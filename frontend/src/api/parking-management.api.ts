import { axiosClient } from './axiosClient';

export interface ParkingZone {
  id: string;
  code: string;
  name: string;
  parkingType: string;
  floor?: string;
  totalSlots: number;
  isActive: boolean;
  _count?: { slots: number };
  slots?: { status: string }[];
}

export interface ParkingSlot {
  id: string;
  slotNumber: string;
  slotSize: string;
  status: string;
  floor?: string;
  block?: string;
  location?: string;
  isEvEnabled: boolean;
  isRfidEnabled: boolean;
  isQrEnabled: boolean;
  isBoomBarrier: boolean;
  monthlyRate: number;
  zone?: { name: string; parkingType: string };
  allocations?: {
    vehicle: { vehicleNumber: string; typeCode: string; brand?: string };
    person: { firstName: string; lastName: string };
  }[];
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  typeCode: string;
  brand?: string;
  modelName?: string;
  color?: string;
  stickerNumber?: string;
  rfidTag?: string;
  fasTag?: string;
  insuranceExpiry?: string;
  pucExpiry?: string;
  fitnessExpiry?: string;
  flat?: { flatNumber: string };
  person?: { firstName: string; lastName: string; phone: string };
  allocations?: { slot: { slotNumber: string; zone: { name: string } } }[];
}

export interface ParkingAllocation {
  id: string;
  allocationNumber: string;
  allocationType: string;
  status: string;
  startDate: string;
  endDate?: string;
  monthlyCharge: number;
  depositPaid: number;
  slot?: { slotNumber: string; floor?: string; zone: { name: string; parkingType: string } };
  vehicle?: { vehicleNumber: string; typeCode: string; brand?: string; color?: string };
  person?: { firstName: string; lastName: string; phone: string };
}

export interface ParkingMetrics {
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  reservedSlots: number;
  evSlots: number;
  totalVehicles: number;
  activeAllocations: number;
  monthlyRevenue: number;
  utilizationRate: number;
  alerts: { insuranceExpiring: number; pucExpiring: number; fitnessExpiring: number };
}

export const parkingApi = {
  getMetrics: async (): Promise<ParkingMetrics> => {
    const res = await axiosClient.get('/parking/metrics');
    return res.data?.data || res.data;
  },

  getExpiryAlerts: async () => {
    const res = await axiosClient.get('/parking/expiry-alerts');
    return res.data?.data || res.data;
  },

  getZones: async (): Promise<ParkingZone[]> => {
    const res = await axiosClient.get('/parking/zones');
    return res.data?.data || res.data || [];
  },

  createZone: async (data: Partial<ParkingZone> & { parkingType: string; code: string; name: string }) => {
    const res = await axiosClient.post('/parking/zones', data);
    return res.data?.data || res.data;
  },

  getSlots: async (params?: { zoneId?: string; slotStatus?: string; slotSize?: string; search?: string }) => {
    const res = await axiosClient.get('/parking/slots', { params });
    return res.data?.data || res.data;
  },

  createSlot: async (data: Partial<ParkingSlot> & { zoneId: string; slotNumber: string }) => {
    const res = await axiosClient.post('/parking/slots', data);
    return res.data?.data || res.data;
  },

  updateSlotStatus: async (id: string, status: string) => {
    const res = await axiosClient.put(`/parking/slots/${id}/status`, { status });
    return res.data?.data || res.data;
  },

  getVehicles: async (params?: { search?: string }) => {
    const res = await axiosClient.get('/parking/vehicles', { params });
    return res.data?.data || res.data;
  },

  registerVehicle: async (data: Partial<Vehicle> & { flatId: string; vehicleNumber: string; typeCode: string }) => {
    const res = await axiosClient.post('/parking/vehicles', data);
    return res.data?.data || res.data;
  },

  getAllocations: async (params?: { allocationType?: string; allocationStatus?: string; search?: string }) => {
    const res = await axiosClient.get('/parking/allocations', { params });
    return res.data?.data || res.data;
  },

  createAllocation: async (data: {
    slotId: string;
    vehicleId: string;
    personId: string;
    unitId?: string;
    allocationType?: string;
    startDate: string;
    endDate?: string;
    monthlyCharge?: number;
    depositPaid?: number;
    notes?: string;
  }) => {
    const res = await axiosClient.post('/parking/allocations', data);
    return res.data?.data || res.data;
  },

  deactivateAllocation: async (id: string) => {
    const res = await axiosClient.delete(`/parking/allocations/${id}`);
    return res.data?.data || res.data;
  },

  transferAllocation: async (id: string, newPersonId: string) => {
    const res = await axiosClient.put(`/parking/allocations/${id}/transfer`, { newPersonId });
    return res.data?.data || res.data;
  },
};
