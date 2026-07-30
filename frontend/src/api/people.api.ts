import { axiosClient } from './axiosClient';

export interface PersonRole {
  id: string;
  roleCode: string;
}

export interface PersonUnitMapping {
  id: string;
  unitId: string;
  occupancyStatus: string;
  unit?: {
    id: string;
    flatNumber: string;
    code: string;
  };
}

export interface Person {
  id: string;
  digitalId: string;
  digitalIdQrToken?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  gender: string;
  avatarUrl?: string;
  identityType?: string;
  identityNumber?: string;
  kycStatus: string;
  status: string;
  emergencyContacts?: { name: string; relation: string; phone: string }[];
  isAttendanceReady: boolean;
  isFaceRecognitionReady: boolean;
  isMobileAppReady: boolean;
  isVisitorReady: boolean;
  roles: PersonRole[];
  unitMappings?: PersonUnitMapping[];
  createdAt: string;
}

export interface PeoplePaginatedResponse {
  data: Person[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const peopleApi = {
  getPeople: async (params?: {
    search?: string;
    role?: string;
    kycStatus?: string;
    status?: string;
    page?: number;
  }): Promise<PeoplePaginatedResponse> => {
    const res = await axiosClient.get('/people', { params });
    return res.data?.data || res.data;
  },

  getPerson: async (id: string): Promise<Person> => {
    const res = await axiosClient.get(`/people/${id}`);
    return res.data?.data || res.data;
  },

  createPerson: async (data: any): Promise<Person> => {
    const res = await axiosClient.post('/people', data);
    return res.data?.data || res.data;
  },

  updatePerson: async (id: string, data: any): Promise<Person> => {
    const res = await axiosClient.put(`/people/${id}`, data);
    return res.data?.data || res.data;
  },

  deletePerson: async (id: string): Promise<void> => {
    await axiosClient.delete(`/people/${id}`);
  },

  exportPeople: async (): Promise<any[]> => {
    const res = await axiosClient.get('/people/export');
    return res.data?.data || res.data;
  },
};
