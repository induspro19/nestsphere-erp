import { axiosClient } from './axiosClient';

export interface Complaint {
  id: string;
  ticketNumber: string;
  category: string;
  priority: string;
  status: string;
  subject: string;
  description: string;
  reportedBy?: { id: string; firstName: string; lastName: string; phone: string };
  unit?: { id: string; flatNumber: string };
  asset?: { id: string; name: string; assetCode: string };
  assignedVendorName?: string;
  slaHours: number;
  slaDueDate?: string;
  isEscalated: boolean;
  resolutionNotes?: string;
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  cost: number;
  starRating?: number;
  residentFeedback?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface ComplaintMetrics {
  totalTickets: number;
  totalOpen: number;
  totalInProgress: number;
  totalResolved: number;
  totalOverdue: number;
  totalCost: number;
}

export const complaintApi = {
  getMetrics: async (): Promise<ComplaintMetrics> => {
    const res = await axiosClient.get('/complaints/metrics');
    return res.data?.data || res.data;
  },

  getComplaints: async (params?: { search?: string; category?: string; status?: string; priority?: string }) => {
    const res = await axiosClient.get('/complaints', { params });
    return res.data?.data || res.data;
  },

  createComplaint: async (data: {
    category: string;
    priority?: string;
    subject: string;
    description: string;
    unitId?: string;
    assetId?: string;
  }): Promise<Complaint> => {
    const res = await axiosClient.post('/complaints', data);
    return res.data?.data || res.data;
  },

  updateComplaint: async (
    id: string,
    data: {
      status?: string;
      priority?: string;
      assignedVendorName?: string;
      resolutionNotes?: string;
      rootCause?: string;
      correctiveAction?: string;
      preventiveAction?: string;
      cost?: number;
      starRating?: number;
      residentFeedback?: string;
    },
  ): Promise<Complaint> => {
    const res = await axiosClient.put(`/complaints/${id}`, data);
    return res.data?.data || res.data;
  },
};
