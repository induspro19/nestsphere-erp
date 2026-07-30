import { axiosClient } from './axiosClient';

export interface PropertyConfig {
  id: string;
  societyId: string;
  blockLabel: string;
  hasWings: boolean;
  hasFloors: boolean;
  isSeparateParking: boolean;
  autoUnitNumbering: boolean;
  unitNumberPattern: string;
}

export interface PropertyUnit {
  id: string;
  code: string;
  flatNumber: string;
  unitType: string;
  sqFt?: number;
  status: string;
}

export interface PropertyBlock {
  id: string;
  name: string;
  code: string;
  wings?: {
    id: string;
    name: string;
    floors?: {
      id: string;
      floorNumber: number;
      flats: PropertyUnit[];
    }[];
  }[];
  flats?: PropertyUnit[];
}

export interface PropertyHierarchyResponse {
  config: PropertyConfig;
  blocks: PropertyBlock[];
}

export const propertyApi = {
  getConfig: async (): Promise<PropertyConfig> => {
    const res = await axiosClient.get('/property-management/config');
    return res.data?.data || res.data;
  },

  updateConfig: async (data: Partial<PropertyConfig>): Promise<PropertyConfig> => {
    const res = await axiosClient.put('/property-management/config', data);
    return res.data?.data || res.data;
  },

  getHierarchy: async (): Promise<PropertyHierarchyResponse> => {
    const res = await axiosClient.get('/property-management/hierarchy');
    return res.data?.data || res.data;
  },

  createBlock: async (data: { name: string; code?: string }): Promise<PropertyBlock> => {
    const res = await axiosClient.post('/property-management/blocks', data);
    return res.data?.data || res.data;
  },

  createUnit: async (data: {
    buildingId: string;
    wingId?: string;
    floorId?: string;
    flatNumber: string;
    unitType?: string;
    sqFt?: number;
  }): Promise<PropertyUnit> => {
    const res = await axiosClient.post('/property-management/units', data);
    return res.data?.data || res.data;
  },
};
