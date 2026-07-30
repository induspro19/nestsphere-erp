import { axiosClient } from './axiosClient';

export interface BillConfig {
  billingCycle: string;
  baseSqFtRate: number;
  flatRatePerUnit: number;
  sinkingFundAmount: number;
  corpusFundAmount: number;
  parkingCharge2Wheeler: number;
  parkingCharge4Wheeler: number;
  waterCharge: number;
  electricityCharge: number;
  lateFeePercentage: number;
  dueDateDays: number;
  gstPercentage: number;
}

export interface MaintenanceBill {
  id: string;
  billNumber: string;
  billingMonth: string;
  status: string;
  maintenanceAmount: number;
  sinkingFund: number;
  corpusFund: number;
  utilityCharges: number;
  parkingCharges: number;
  subtotal: number;
  gstAmount: number;
  lateFee: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  dueDate: string;
  unit?: { flatNumber: string; sqFt?: number };
  person?: { firstName: string; lastName: string; phone: string };
  financialTransaction?: { txnNumber: string; status: string };
}

export interface BillingMetrics {
  totalBilled: number;
  totalCollected: number;
  totalOutstanding: number;
  totalLateFees: number;
  currentMonthBilled: number;
  currentMonthCollected: number;
  unpaidCount: number;
  overdueCount: number;
  collectionRate: number;
}

export interface AgingBucket {
  aging: { '0_30': number; '31_60': number; '61_90': number; '90_plus': number };
  totalDebtors: number;
}

export const maintenanceBillingApi = {
  getConfig: async (): Promise<BillConfig> => {
    const res = await axiosClient.get('/maintenance-billing/config');
    return res.data?.data || res.data;
  },

  upsertConfig: async (data: Partial<BillConfig>): Promise<BillConfig> => {
    const res = await axiosClient.put('/maintenance-billing/config', data);
    return res.data?.data || res.data;
  },

  getMetrics: async (): Promise<BillingMetrics> => {
    const res = await axiosClient.get('/maintenance-billing/metrics');
    return res.data?.data || res.data;
  },

  getAging: async (): Promise<AgingBucket> => {
    const res = await axiosClient.get('/maintenance-billing/aging');
    return res.data?.data || res.data;
  },

  generateBulkBills: async (data: { billingMonth?: string; buildingId?: string }) => {
    const res = await axiosClient.post('/maintenance-billing/generate-bulk', data);
    return res.data?.data || res.data;
  },

  getBills: async (params?: { search?: string; billingMonth?: string; status?: string }) => {
    const res = await axiosClient.get('/maintenance-billing', { params });
    return res.data?.data || res.data;
  },

  getBill: async (id: string): Promise<MaintenanceBill> => {
    const res = await axiosClient.get(`/maintenance-billing/${id}`);
    return res.data?.data || res.data;
  },

  recordPayment: async (data: {
    billId: string;
    paidAmount: number;
    paymentMethod?: string;
    gatewayRef?: string;
    discountAmount?: number;
  }) => {
    const res = await axiosClient.post('/maintenance-billing/pay', data);
    return res.data?.data || res.data;
  },

  applyLateFees: async () => {
    const res = await axiosClient.post('/maintenance-billing/apply-late-fees', {});
    return res.data?.data || res.data;
  },
};
