import { Audit } from '../../common/decorators/audit.decorator';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentManagementService } from './document-management.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { CreateFolderDto } from './dto/create-folder.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ActiveUser } from '../../common/decorators/active-user.decorator';

@ApiTags('Enterprise Document & File Management Engine')
@ApiBearerAuth()
@Audit()
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentManagementController {
  constructor(private documentService: DocumentManagementService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get Document Platform Storage Metrics & Expiry Analytics' })
  async getMetrics(@CurrentTenant() societyId: string) {
    return this.documentService.getMetrics(societyId);
  }

  @Get('folders')
  @ApiOperation({ summary: 'Get Document Folders Hierarchy' })
  async getFolders(@CurrentTenant() societyId: string, @Query('parentId') parentId?: string) {
    return this.documentService.getFolders(societyId, parentId);
  }

  @Post('folders')
  @ApiOperation({ summary: 'Create Document Folder' })
  async createFolder(@CurrentTenant() societyId: string, @Body() dto: CreateFolderDto) {
    return this.documentService.createFolder(societyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Query Paginated Document Catalog Across 12 Target Modules' })
  async findAll(@CurrentTenant() societyId: string, @Query() query: QueryDocumentDto) {
    return this.documentService.findAll(societyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Detailed Document Profile & Version History' })
  async findOne(@CurrentTenant() societyId: string, @Param('id') id: string) {
    return this.documentService.findOne(societyId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Upload / Register New Document (With Duplicate Check & SHA-256 Hash)' })
  async createDocument(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateDocumentDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.documentService.createDocument(societyId, dto, actorId);
  }

  @Post(':id/version')
  @ApiOperation({ summary: 'Upload New Version for Document' })
  async addVersion(
    @CurrentTenant() societyId: string,
    @Param('id') documentId: string,
    @Body('fileUrl') fileUrl: string,
    @Body('sizeBytes') sizeBytes: number,
    @Body('changeNotes') changeNotes: string,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.documentService.addVersion(societyId, documentId, fileUrl, sizeBytes, changeNotes, actorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Move Document to Recycle Bin' })
  async moveToRecycleBin(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.documentService.moveToRecycleBin(societyId, id, actorId);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore Document from Recycle Bin' })
  async restoreFromRecycleBin(
    @CurrentTenant() societyId: string,
    @Param('id') id: string,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.documentService.restoreFromRecycleBin(societyId, id, actorId);
  }
}
