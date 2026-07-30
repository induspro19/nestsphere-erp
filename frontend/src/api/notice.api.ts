import { axiosClient } from './axiosClient';

export interface NoticeRecipient {
  id: string;
  noticeId: string;
  personId: string;
  targetType: string;
  acknowledgementStatus: string;
  readAt?: string;
  acknowledgedAt?: string;
  person?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
}

export interface Notice {
  id: string;
  noticeNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  publishDate?: string;
  expiryDate?: string;
  requiresApproval: boolean;
  requiresAcknowledgement: boolean;
  createdById?: string;
  approvedById?: string;
  createdBy?: { id: string; firstName: string; lastName: string; email?: string };
  approvedBy?: { id: string; firstName: string; lastName: string };
  recipients?: NoticeRecipient[];
  _count?: { recipients: number };
  createdAt: string;
}

export interface NoticeTemplate {
  id: string;
  templateName: string;
  category: string;
  title: string;
  description: string;
  active: boolean;
  createdAt: string;
}

export interface NoticeMetrics {
  activeNotices: number;
  pendingApproval: number;
  criticalNotices: number;
  acknowledgementRate: number;
}

export const noticeApi = {
  getMetrics: async (): Promise<NoticeMetrics> => {
    const res = await axiosClient.get('/notices/metrics');
    return res.data?.data || res.data;
  },

  getNotices: async (params?: { search?: string; category?: string; priority?: string; status?: string; page?: number; limit?: number }) => {
    const res = await axiosClient.get('/notices', { params });
    return res.data?.data || res.data;
  },

  getNoticeDetails: async (id: string): Promise<Notice> => {
    const res = await axiosClient.get(`/notices/${id}`);
    return res.data?.data || res.data;
  },

  createNotice: async (data: any): Promise<Notice> => {
    const res = await axiosClient.post('/notices', data);
    return res.data?.data || res.data;
  },

  updateNotice: async (id: string, data: any): Promise<Notice> => {
    const res = await axiosClient.put(`/notices/${id}`, data);
    return res.data?.data || res.data;
  },

  approveNotice: async (id: string): Promise<Notice> => {
    const res = await axiosClient.post(`/notices/${id}/approve`);
    return res.data?.data || res.data;
  },

  acknowledgeNotice: async (id: string): Promise<any> => {
    const res = await axiosClient.post(`/notices/${id}/acknowledge`);
    return res.data?.data || res.data;
  },

  deleteNotice: async (id: string): Promise<any> => {
    const res = await axiosClient.delete(`/notices/${id}`);
    return res.data?.data || res.data;
  },

  getTemplates: async (): Promise<NoticeTemplate[]> => {
    const res = await axiosClient.get('/notices/templates');
    return res.data?.data || res.data;
  },

  createTemplate: async (data: any): Promise<NoticeTemplate> => {
    const res = await axiosClient.post('/notices/templates', data);
    return res.data?.data || res.data;
  },
};
