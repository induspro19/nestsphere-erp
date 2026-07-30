import { axiosClient } from './axiosClient';

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  type: string;
  priority: string;
  status: string;
  title: string;
  description: string;
  asset?: { id: string; name: string; assetCode: string };
  assignedStaff?: { id: string; firstName: string; lastName: string; phone: string };
  assignedVendorName?: string;
  scheduledDate: string;
  completedAt?: string;
  downtimeHours: number;
  labourCost: number;
  materialCost: number;
  totalCost: number;
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
}

export interface MaintenanceMetrics {
  totalWorkOrders: number;
  totalPreventive: number;
  totalCorrective: number;
  totalCompleted: number;
  totalDowntimeHours: number;
  totalMaintenanceCost: number;
  averageMTTR: number;
}

export const maintenanceApi = {
  getMetrics: async (): Promise<MaintenanceMetrics> => {
    const res = await axiosClient.get('/maintenance/metrics');
    return res.data?.data || res.data;
  },

  getWorkOrders: async (params?: { search?: string; type?: string; status?: string; priority?: string }) => {
    const res = await axiosClient.get('/maintenance', { params });
    return res.data?.data || res.data;
  },

  createWorkOrder: async (data: {
    type?: string;
    priority?: string;
    title: string;
    description: string;
    assetId: string;
    scheduledDate?: string;
  }): Promise<WorkOrder> => {
    const res = await axiosClient.post('/maintenance', data);
    return res.data?.data || res.data;
  },

  updateWorkOrder: async (
    id: string,
    data: {
      status?: string;
      downtimeHours?: number;
      labourCost?: number;
      materialCost?: number;
      rootCause?: string;
      correctiveAction?: string;
      preventiveAction?: string;
    },
  ): Promise<WorkOrder> => {
    const res = await axiosClient.put(`/maintenance/${id}`, data);
    return res.data?.data || res.data;
  },
};
