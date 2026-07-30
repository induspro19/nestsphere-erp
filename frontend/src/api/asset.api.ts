import { axiosClient } from './axiosClient';

export interface AssetCategory {
  id: string;
  code: string;
  name: string;
}

export interface AssetLog {
  id: string;
  logType: string;
  title: string;
  description?: string;
  cost: number;
  performedBy?: string;
  logDate: string;
}

export interface Asset {
  id: string;
  assetCode: string;
  qrToken?: string;
  name: string;
  brand?: string;
  modelNumber?: string;
  serialNumber?: string;
  barcode?: string;
  rfidTag?: string;
  locationDetails?: string;
  purchaseDate?: string;
  installationDate?: string;
  warrantyExpiry?: string;
  amcExpiry?: string;
  vendorName?: string;
  vendorPhone?: string;
  purchaseCost: number;
  currentValue: number;
  depreciationRate: number;
  maintenanceIntervalDays: number;
  lastServiceDate?: string;
  nextServiceDate?: string;
  status: string;
  category: AssetCategory;
  building?: { id: string; name: string };
  logs?: AssetLog[];
  createdAt: string;
}

export interface AssetMetrics {
  totalAssets: number;
  totalValuation: number;
  operationalCount: number;
  maintenanceCount: number;
  breakdownCount: number;
  serviceDueCount: number;
}

export const assetApi = {
  getCategories: async (): Promise<AssetCategory[]> => {
    const res = await axiosClient.get('/assets/categories');
    return res.data?.data || res.data;
  },

  getMetrics: async (): Promise<AssetMetrics> => {
    const res = await axiosClient.get('/assets/metrics');
    return res.data?.data || res.data;
  },

  getAssets: async (params?: { search?: string; categoryId?: string; status?: string; page?: number }) => {
    const res = await axiosClient.get('/assets', { params });
    return res.data?.data || res.data;
  },

  getAssetDetails: async (id: string): Promise<Asset> => {
    const res = await axiosClient.get(`/assets/${id}`);
    return res.data?.data || res.data;
  },

  createAsset: async (data: any): Promise<Asset> => {
    const res = await axiosClient.post('/assets', data);
    return res.data?.data || res.data;
  },

  updateAsset: async (id: string, data: any): Promise<Asset> => {
    const res = await axiosClient.put(`/assets/${id}`, data);
    return res.data?.data || res.data;
  },

  logServiceEvent: async (id: string, data: { logType: string; title: string; cost?: number; description?: string }) => {
    const res = await axiosClient.post(`/assets/${id}/log-service`, data);
    return res.data?.data || res.data;
  },

  exportAssets: async (): Promise<any[]> => {
    const res = await axiosClient.get('/assets/export');
    return res.data?.data || res.data;
  },
};
