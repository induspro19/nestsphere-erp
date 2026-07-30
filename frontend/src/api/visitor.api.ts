import { axiosClient } from './axiosClient';

export interface VisitorPass {
  id: string;
  passNumber: string;
  passType: string;
  visitorType: string;
  visitorName: string;
  visitorPhone: string;
  visitorEmail?: string;
  purpose?: string;
  vehicleNumber?: string;
  expectedArrival?: string;
  expectedExit?: string;
  actualArrival?: string;
  actualExit?: string;
  qrToken?: string;
  otpCode?: string;
  status: string;
  hostUnit?: { id: string; flatNumber: string };
  hostPerson?: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

export interface VisitorAnalytics {
  totalCount: number;
  checkedInCount: number;
  byType: Record<string, number>;
  frequentVisitors: { phone: string; name: string; visitCount: number }[];
}

export const visitorApi = {
  getAnalytics: async (): Promise<VisitorAnalytics> => {
    const res = await axiosClient.get('/visitors/analytics');
    return res.data?.data || res.data;
  },

  getVisitorPasses: async (params?: {
    search?: string;
    visitorType?: string;
    status?: string;
    page?: number;
  }) => {
    const res = await axiosClient.get('/visitors', { params });
    return res.data?.data || res.data;
  },

  createPass: async (data: {
    visitorType: string;
    visitorName: string;
    visitorPhone: string;
    purpose?: string;
    vehicleNumber?: string;
    passType?: string;
  }): Promise<VisitorPass> => {
    const res = await axiosClient.post('/visitors/pass', data);
    return res.data?.data || res.data;
  },

  checkIn: async (data: { passId?: string; otpCode?: string; qrToken?: string }) => {
    const res = await axiosClient.post('/visitors/check-in', data);
    return res.data?.data || res.data;
  },

  checkOut: async (passId: string) => {
    const res = await axiosClient.post(`/visitors/${passId}/check-out`);
    return res.data?.data || res.data;
  },
};
