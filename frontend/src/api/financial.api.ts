import { axiosClient } from './axiosClient';

export interface FinancialAccount {
  id: string;
  accountCode: string;
  accountName: string;
  type: string;
  balance: number;
  isSystem: boolean;
}

export interface FinancialTransaction {
  id: string;
  txnNumber: string;
  txnType: string;
  txnDate: string;
  dueDate?: string;
  subtotal: number;
  taxAmount: number;
  penaltyAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentMethod: string;
  gatewayRef?: string;
  status: string;
  unit?: { id: string; flatNumber: string };
  person?: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

export interface FinancialMetrics {
  totalBilled: number;
  totalCollected: number;
  totalOutstanding: number;
  totalWalletBalance: number;
  totalTransactions: number;
}

export interface AgingAnalysis {
  totalOutstanding: number;
  current0To30: number;
  days31To60: number;
  days61To90: number;
  days90Plus: number;
  unpaidInvoiceCount: number;
}

export const financialApi = {
  getMetrics: async (): Promise<FinancialMetrics> => {
    const res = await axiosClient.get('/financials/metrics');
    return res.data?.data || res.data;
  },

  getAgingAnalysis: async (): Promise<AgingAnalysis> => {
    const res = await axiosClient.get('/financials/aging');
    return res.data?.data || res.data;
  },

  getAccounts: async (): Promise<FinancialAccount[]> => {
    const res = await axiosClient.get('/financials/accounts');
    return res.data?.data || res.data;
  },

  createAccount: async (data: { accountCode: string; accountName: string; type: string }) => {
    const res = await axiosClient.post('/financials/accounts', data);
    return res.data?.data || res.data;
  },

  createJournalEntry: async (data: {
    narration: string;
    items: { accountId: string; debitAmount?: number; creditAmount?: number }[];
  }) => {
    const res = await axiosClient.post('/financials/journal', data);
    return res.data?.data || res.data;
  },

  getTransactions: async (params?: { search?: string; txnType?: string; status?: string; page?: number }) => {
    const res = await axiosClient.get('/financials/transactions', { params });
    return res.data?.data || res.data;
  },

  createTransaction: async (data: {
    txnType: string;
    subtotal: number;
    taxAmount?: number;
    penaltyAmount?: number;
    discountAmount?: number;
    paymentMethod?: string;
  }): Promise<FinancialTransaction> => {
    const res = await axiosClient.post('/financials/transactions', data);
    return res.data?.data || res.data;
  },

  payTransaction: async (id: string, data: { amount: number; paymentMethod: string }) => {
    const res = await axiosClient.post(`/financials/transactions/${id}/pay`, data);
    return res.data?.data || res.data;
  },
};
