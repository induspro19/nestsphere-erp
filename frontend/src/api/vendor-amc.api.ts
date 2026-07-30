import { axiosClient } from './axiosClient';

export interface Vendor {
  id: string;
  vendorCode: string;
  name: string;
  typeCode: string;
  status: string;
  gstNumber?: string;
  panNumber?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  website?: string;
  city?: string;
  state?: string;
  rating: number;
  totalContracts: number;
  totalContractValue: number;
  penaltyAmount: number;
  isPreferred: boolean;
  isBlacklisted: boolean;
  isEmergencyContact: boolean;
  contacts?: { name: string; phone: string; designation?: string; isPrimary: boolean; isEmergency: boolean }[];
  _count?: { amcContracts: number; serviceVisits: number; contacts: number };
}

export interface AmcContract {
  id: string;
  amcNumber: string;
  contractNumber?: string;
  contractType: string;
  status: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  amcCostPerMonth: number;
  slaResponseHours: number;
  slaResolutionHours: number;
  visitFrequency?: string;
  autoRenew: boolean;
  renewalReminderDays: number;
  daysToExpiry?: number;
  vendor?: { vendorCode: string; name: string; typeCode: string; primaryPhone?: string };
  assetLinks?: { asset: { assetCode: string; name: string } }[];
  _count?: { serviceVisits: number };
}

export interface ServiceVisit {
  id: string;
  visitNumber: string;
  visitType: string;
  status: string;
  scheduledDate: string;
  actualDate?: string;
  completedAt?: string;
  technicianName?: string;
  technicianPhone?: string;
  workDescription?: string;
  labourCost: number;
  materialCost: number;
  totalCost: number;
  penaltyAmount: number;
  residentRating?: number;
  residentFeedback?: string;
  society?: { name: string; vendorCode: string; typeCode: string };
  amc?: { amcNumber: string; contractType: string };
}

export interface VendorAmcMetrics {
  vendors: { total: number; active: number; blacklisted: number; preferred: number; avgRating: number };
  amcs: { total: number; active: number; expired: number; expiringIn30Days: number; totalValue: number; monthlyRecurring: number };
  visits: { total: number; completed: number; pending: number; totalCost: number; totalPenalty: number };
}

export const vendorAmcApi = {
  getMetrics: async (): Promise<VendorAmcMetrics> => {
    const res = await axiosClient.get('/vendor-amc/metrics');
    return res.data?.data || res.data;
  },

  getVendors: async (params?: { search?: string; typeCode?: string; status?: string }) => {
    const res = await axiosClient.get('/vendor-amc/vendors', { params });
    return res.data?.data || res.data;
  },

  createVendor: async (data: Partial<Vendor> & { name: string; typeCode: string }) => {
    const res = await axiosClient.post('/vendor-amc/vendors', data);
    return res.data?.data || res.data;
  },

  getVendor: async (id: string): Promise<Vendor> => {
    const res = await axiosClient.get(`/vendor-amc/vendors/${id}`);
    return res.data?.data || res.data;
  },

  updateVendor: async (id: string, data: Partial<Vendor>) => {
    const res = await axiosClient.put(`/vendor-amc/vendors/${id}`, data);
    return res.data?.data || res.data;
  },

  addContact: async (vendorId: string, contact: { name: string; phone: string; designation?: string; email?: string; isPrimary?: boolean; isEmergency?: boolean }) => {
    const res = await axiosClient.post(`/vendor-amc/vendors/${vendorId}/contacts`, contact);
    return res.data?.data || res.data;
  },

  getAmcContracts: async (params?: { search?: string; vendorId?: string; contractType?: string; contractStatus?: string; renewalDays?: number }) => {
    const res = await axiosClient.get('/vendor-amc/amc', { params });
    return res.data?.data || res.data;
  },

  createAmc: async (data: {
    vendorId: string;
    contractType: string;
    startDate: string;
    endDate: string;
    contractValue?: number;
    amcCostPerMonth?: number;
    slaResponseHours?: number;
    slaResolutionHours?: number;
    visitFrequency?: string;
    autoRenew?: boolean;
    assetIds?: string[];
  }) => {
    const res = await axiosClient.post('/vendor-amc/amc', data);
    return res.data?.data || res.data;
  },

  updateAmcStatus: async (id: string, status: string) => {
    const res = await axiosClient.put(`/vendor-amc/amc/${id}/status`, { status });
    return res.data?.data || res.data;
  },

  getServiceVisits: async (params?: { search?: string; vendorId?: string; visitType?: string; visitStatus?: string }) => {
    const res = await axiosClient.get('/vendor-amc/service-visits', { params });
    return res.data?.data || res.data;
  },

  createServiceVisit: async (data: {
    vendorId: string;
    amcId?: string;
    visitType: string;
    scheduledDate: string;
    technicianName?: string;
    technicianPhone?: string;
    workDescription?: string;
  }) => {
    const res = await axiosClient.post('/vendor-amc/service-visits', data);
    return res.data?.data || res.data;
  },

  updateServiceVisit: async (id: string, data: {
    status?: string;
    labourCost?: number;
    materialCost?: number;
    penaltyAmount?: number;
    residentRating?: number;
    residentFeedback?: string;
    technicalNotes?: string;
  }) => {
    const res = await axiosClient.put(`/vendor-amc/service-visits/${id}`, data);
    return res.data?.data || res.data;
  },
};
