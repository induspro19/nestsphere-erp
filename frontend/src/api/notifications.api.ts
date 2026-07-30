import { axiosClient } from './axiosClient';

export interface AppNotification {
  id: string;
  channel: string;
  category: string;
  priority: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationTemplate {
  id: string;
  code: string;
  name: string;
  category: string;
  channel: string;
  titleTemplate: string;
  bodyTemplate: string;
  variables: string[];
  isActive: boolean;
}

export interface UserNotificationsResponse {
  data: AppNotification[];
  meta: {
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const notificationsApi = {
  getUserNotifications: async (params?: {
    category?: string;
    isRead?: boolean;
    page?: number;
  }): Promise<UserNotificationsResponse> => {
    const res = await axiosClient.get('/notifications', { params });
    return res.data?.data || res.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await axiosClient.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await axiosClient.put('/notifications/read-all');
  },

  broadcast: async (data: {
    title: string;
    message: string;
    category?: string;
    priority?: string;
  }) => {
    const res = await axiosClient.post('/notifications/broadcast', data);
    return res.data?.data || res.data;
  },

  getTemplates: async (): Promise<NotificationTemplate[]> => {
    const res = await axiosClient.get('/notifications/templates');
    return res.data?.data || res.data;
  },

  createTemplate: async (data: {
    code: string;
    name: string;
    category: string;
    channel: string;
    titleTemplate: string;
    bodyTemplate: string;
    variables?: string[];
  }): Promise<NotificationTemplate> => {
    const res = await axiosClient.post('/notifications/templates', data);
    return res.data?.data || res.data;
  },
};
