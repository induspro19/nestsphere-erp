import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { CreateFolderDto } from './dto/create-folder.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { ActivityAction } from '@prisma/client';

@Injectable()
export class DocumentManagementService {
  constructor(private prisma: PrismaService) {}

  // 1. Folders Hierarchy Management
  async getFolders(societyId: string, parentId?: string) {
    return this.prisma.documentFolder.findMany({
      where: {
        societyId,
        parentId: parentId || null,
      },
      include: {
        children: true,
        _count: { select: { documents: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createFolder(societyId: string, dto: CreateFolderDto) {
    const parent = dto.parentId
      ? await this.prisma.documentFolder.findUnique({ where: { id: dto.parentId } })
      : null;

    const path = parent ? `${parent.path}${dto.name}/` : `/${dto.name}/`;

    return this.prisma.documentFolder.create({
      data: {
        societyId,
        parentId: dto.parentId || null,
        name: dto.name,
        path,
      },
    });
  }

  // 2. Upload / Register Document with SHA-256 Duplicate Check & Initial Version
  async createDocument(societyId: string, dto: CreateDocumentDto, actorId: string) {
    // SHA-256 Duplicate Check
    if (dto.fileHash) {
      const duplicate = await this.prisma.document.findFirst({
        where: { societyId, fileHash: dto.fileHash, isDeleted: false },
      });
      if (duplicate) {
        throw new ConflictException(
          `DUPLICATE FILE DETECTED: A document with identical checksum already exists (${duplicate.documentCode}: ${duplicate.title})`,
        );
      }
    }

    const count = await this.prisma.document.count({ where: { societyId } });
    const documentCode = `DOC-${String(count + 1).padStart(5, '0')}`;

    const document = await this.prisma.document.create({
      data: {
        societyId,
        folderId: dto.folderId || null,
        documentCode,
        title: dto.title,
        description: dto.description,
        category: dto.category || 'GENERAL',
        entityType: dto.entityType || null,
        entityId: dto.entityId || null,
        mimeType: dto.mimeType,
        extension: dto.extension,
        sizeBytes: BigInt(dto.sizeBytes),
        storageProvider: dto.storageProvider || 'LOCAL',
        storageKey: dto.storageKey || `docs/${documentCode}.${dto.extension}`,
        fileUrl: dto.fileUrl,
        thumbnailUrl: dto.thumbnailUrl || null,
        version: 1,
        fileHash: dto.fileHash || null,
        isPrivate: dto.isPrivate || false,
        accessRoles: dto.accessRoles || [],
        tags: dto.tags || [],
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        renewalReminderDate: dto.renewalReminderDate ? new Date(dto.renewalReminderDate) : null,
        workflowInstanceId: dto.workflowInstanceId || null,
        createdBy: actorId,
      },
    });

    // Create Version 1 Record
    await this.prisma.documentVersion.create({
      data: {
        documentId: document.id,
        version: 1,
        fileUrl: dto.fileUrl,
        storageKey: document.storageKey,
        sizeBytes: BigInt(dto.sizeBytes),
        fileHash: dto.fileHash || null,
        changeNotes: 'Initial document upload',
        createdBy: actorId,
      },
    });

    // Log Timeline
    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'DOCUMENT',
        entityId: document.id,
        action: ActivityAction.CREATED,
        title: `Document Uploaded (${documentCode})`,
        description: `${dto.title} (${dto.extension.toUpperCase()}) added to Document Engine`,
        actorId,
      },
    });

    return {
      ...document,
      sizeBytes: Number(document.sizeBytes),
    };
  }

  // 3. Add New Version to Existing Document
  async addVersion(
    societyId: string,
    documentId: string,
    fileUrl: string,
    sizeBytes: number,
    changeNotes: string,
    actorId: string,
  ) {
    const doc = await this.prisma.document.findFirst({
      where: { id: documentId, societyId, isDeleted: false },
    });

    if (!doc) throw new NotFoundException('Document not found');

    const nextVersion = doc.version + 1;

    await this.prisma.documentVersion.create({
      data: {
        documentId,
        version: nextVersion,
        fileUrl,
        storageKey: doc.storageKey,
        sizeBytes: BigInt(sizeBytes),
        changeNotes,
        createdBy: actorId,
      },
    });

    const updated = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        version: nextVersion,
        fileUrl,
        sizeBytes: BigInt(sizeBytes),
        updatedBy: actorId,
      },
    });

    return {
      ...updated,
      sizeBytes: Number(updated.sizeBytes),
    };
  }

  // 4. Query Documents
  async findAll(societyId: string, query: QueryDocumentDto) {
    const { search, folderId, category, entityType, entityId, isDeleted = false, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { societyId, isDeleted };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { documentCode: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (folderId) where.folderId = folderId;
    if (category) where.category = category;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          folder: true,
          versions: { orderBy: { version: 'desc' } },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      data: items.map((doc) => ({
        ...doc,
        sizeBytes: Number(doc.sizeBytes),
        versions: doc.versions.map((v) => ({ ...v, sizeBytes: Number(v.sizeBytes) })),
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // 5. Get Single Document Details & Version History
  async findOne(societyId: string, id: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id, societyId },
      include: {
        folder: true,
        versions: { orderBy: { version: 'desc' } },
      },
    });

    if (!doc) throw new NotFoundException('Document not found');

    return {
      ...doc,
      sizeBytes: Number(doc.sizeBytes),
      versions: doc.versions.map((v) => ({ ...v, sizeBytes: Number(v.sizeBytes) })),
    };
  }

  // 6. Recycle Bin Lifecycle (Soft Delete & Restore)
  async moveToRecycleBin(societyId: string, id: string, actorId: string) {
    const doc = await this.findOne(societyId, id);

    await this.prisma.document.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), deletedBy: actorId },
    });

    return { message: `Document ${doc.documentCode} moved to Recycle Bin` };
  }

  async restoreFromRecycleBin(societyId: string, id: string, actorId: string) {
    await this.prisma.document.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null, updatedBy: actorId },
    });

    return { message: `Document restored successfully` };
  }

  // 7. Metrics & Analytics
  async getMetrics(societyId: string) {
    const docs = await this.prisma.document.findMany({
      where: { societyId, isDeleted: false },
      select: { sizeBytes: true, category: true, storageProvider: true, expiryDate: true },
    });

    let totalSizeBytes = 0;
    const categoryCount: Record<string, number> = {};
    const providerCount: Record<string, number> = {};
    let expiringCount = 0;

    const now = new Date();

    docs.forEach((d) => {
      totalSizeBytes += Number(d.sizeBytes || 0);
      categoryCount[d.category] = (categoryCount[d.category] || 0) + 1;
      providerCount[d.storageProvider] = (providerCount[d.storageProvider] || 0) + 1;

      if (d.expiryDate && new Date(d.expiryDate) <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) {
        expiringCount++;
      }
    });

    return {
      totalDocuments: docs.length,
      totalSizeBytes,
      totalSizeMB: Number((totalSizeBytes / (1024 * 1024)).toFixed(2)),
      expiringCount,
      categoryCount,
      providerCount,
    };
  }
}
