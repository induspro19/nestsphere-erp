import { axiosClient } from './axiosClient';

export interface DocumentFolder {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  _count?: { documents: number };
}

export interface DocumentVersion {
  id: string;
  version: number;
  fileUrl: string;
  sizeBytes: number;
  changeNotes?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  documentCode: string;
  title: string;
  description?: string;
  category: string;
  entityType?: string;
  entityId?: string;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  storageProvider: string;
  fileUrl: string;
  version: number;
  fileHash?: string;
  isPrivate: boolean;
  expiryDate?: string;
  isDeleted: boolean;
  folder?: DocumentFolder;
  versions?: DocumentVersion[];
  createdAt: string;
}

export interface DocumentMetrics {
  totalDocuments: number;
  totalSizeBytes: number;
  totalSizeMB: number;
  expiringCount: number;
  categoryCount: Record<string, number>;
  providerCount: Record<string, number>;
}

export const documentApi = {
  getMetrics: async (): Promise<DocumentMetrics> => {
    const res = await axiosClient.get('/documents/metrics');
    return res.data?.data || res.data;
  },

  getFolders: async (parentId?: string): Promise<DocumentFolder[]> => {
    const res = await axiosClient.get('/documents/folders', { params: { parentId } });
    return res.data?.data || res.data;
  },

  createFolder: async (name: string, parentId?: string): Promise<DocumentFolder> => {
    const res = await axiosClient.post('/documents/folders', { name, parentId });
    return res.data?.data || res.data;
  },

  getDocuments: async (params?: {
    search?: string;
    folderId?: string;
    category?: string;
    entityType?: string;
    isDeleted?: boolean;
    page?: number;
  }) => {
    const res = await axiosClient.get('/documents', { params });
    return res.data?.data || res.data;
  },

  getDocumentDetails: async (id: string): Promise<Document> => {
    const res = await axiosClient.get(`/documents/${id}`);
    return res.data?.data || res.data;
  },

  createDocument: async (data: {
    title: string;
    description?: string;
    category?: string;
    entityType?: string;
    mimeType: string;
    extension: string;
    sizeBytes: number;
    fileUrl: string;
    storageProvider?: string;
    fileHash?: string;
  }): Promise<Document> => {
    const res = await axiosClient.post('/documents', data);
    return res.data?.data || res.data;
  },

  addVersion: async (
    id: string,
    data: { fileUrl: string; sizeBytes: number; changeNotes: string },
  ): Promise<Document> => {
    const res = await axiosClient.post(`/documents/${id}/version`, data);
    return res.data?.data || res.data;
  },

  moveToRecycleBin: async (id: string) => {
    const res = await axiosClient.delete(`/documents/${id}`);
    return res.data?.data || res.data;
  },

  restoreFromRecycleBin: async (id: string) => {
    const res = await axiosClient.post(`/documents/${id}/restore`);
    return res.data?.data || res.data;
  },
};
