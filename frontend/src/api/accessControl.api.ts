import { axiosClient } from './axiosClient';

export interface LiveOccupancyResponse {
  totalInside: number;
  activeVehicles: number;
  byType: Record<string, number>;
  timestamp: string;
}

export interface AccessLog {
  id: string;
  gateId: string;
  accessType: string;
  entryMethod: string;
  direction: 'ENTRY' | 'EXIT';
  entryTime: string;
  exitTime?: string | null;
  durationMinutes?: number | null;
  isOverstay: boolean;
  approvalSource: string;
  vehicleNumber?: string | null;
  photoUrl?: string | null;
  remarks?: string | null;
  gate?: { id: string; name: string; code: string };
  person?: { id: string; firstName: string; lastName: string; digitalId: string };
}

export interface AccessRule {
  id: string;
  ruleType: 'WHITELIST' | 'BLACKLIST';
  entityType: string;
  entityValue: string;
  reason?: string;
  createdAt: string;
}

export const accessControlApi = {
  getLiveOccupancy: async (): Promise<LiveOccupancyResponse> => {
    const res = await axiosClient.get('/access-control/live-occupancy');
    return res.data?.data || res.data;
  },

  getOverstayAlerts: async (): Promise<AccessLog[]> => {
    const res = await axiosClient.get('/access-control/overstay-alerts');
    return res.data?.data || res.data;
  },

  getAccessLogs: async (params?: {
    search?: string;
    accessType?: string;
    entryMethod?: string;
    direction?: string;
    isOverstay?: boolean;
    page?: number;
  }) => {
    const res = await axiosClient.get('/access-control/logs', { params });
    return res.data?.data || res.data;
  },

  logEntry: async (data: {
    gateId: string;
    accessType: string;
    entryMethod: string;
    vehicleNumber?: string;
    personId?: string;
    remarks?: string;
  }): Promise<AccessLog> => {
    const res = await axiosClient.post('/access-control/entry', data);
    return res.data?.data || res.data;
  },

  logExit: async (data: {
    gateId: string;
    accessLogId?: string;
    vehicleNumber?: string;
  }): Promise<AccessLog> => {
    const res = await axiosClient.post('/access-control/exit', data);
    return res.data?.data || res.data;
  },

  emergencyOverride: async (emergencyType: string, remarks: string): Promise<AccessLog> => {
    const res = await axiosClient.post('/access-control/emergency-override', {
      emergencyType,
      remarks,
    });
    return res.data?.data || res.data;
  },

  getAccessRules: async (): Promise<AccessRule[]> => {
    const res = await axiosClient.get('/access-control/rules');
    return res.data?.data || res.data;
  },

  createAccessRule: async (data: {
    ruleType: 'WHITELIST' | 'BLACKLIST';
    entityType: string;
    entityValue: string;
    reason?: string;
  }): Promise<AccessRule> => {
    const res = await axiosClient.post('/access-control/rules', data);
    return res.data?.data || res.data;
  },
};
