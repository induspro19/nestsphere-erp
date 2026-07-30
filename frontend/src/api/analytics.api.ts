import { axiosClient } from './axiosClient';

export interface DashboardKPI {
  totalPeople: number;
  totalAccessLogs: number;
  overstayAlerts: number;
  totalVisitors: number;
  pendingApprovals: number;
  assetValuation: number;
  storageMB: number;
  totalBilled: number;
  totalCollected: number;
  totalOutstanding: number;
}

export interface ExecutiveDashboard {
  kpi: DashboardKPI;
  trends: {
    monthlyCollections: { month: string; amount: number }[];
    visitorTrends: { day: string; count: number }[];
  };
}

export interface ReportConfig {
  id: string;
  reportCode: string;
  title: string;
  description?: string;
  domain: string;
  chartType: string;
  isScheduled: boolean;
  cronSchedule?: string;
  isFavorite: boolean;
}

export const analyticsApi = {
  getDashboard: async (): Promise<ExecutiveDashboard> => {
    const res = await axiosClient.get('/analytics/dashboard');
    return res.data?.data || res.data;
  },

  getReports: async (): Promise<ReportConfig[]> => {
    const res = await axiosClient.get('/analytics/reports');
    return res.data?.data || res.data;
  },

  createReport: async (data: {
    title: string;
    domain: string;
    chartType?: string;
    isScheduled?: boolean;
    cronSchedule?: string;
  }): Promise<ReportConfig> => {
    const res = await axiosClient.post('/analytics/reports', data);
    return res.data?.data || res.data;
  },
};
