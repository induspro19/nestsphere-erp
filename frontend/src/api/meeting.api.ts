import { axiosClient } from './axiosClient';

export interface MeetingAgenda {
  id: string;
  agendaNumber: string;
  title: string;
  description?: string;
  presenter?: string;
  estimatedDuration: number;
  sequence: number;
}

export interface MeetingParticipant {
  id: string;
  personId: string;
  role: string;
  invitationStatus: string;
  attendanceStatus: string;
  checkInTime?: string;
  remarks?: string;
  person?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
}

export interface MeetingResolution {
  id: string;
  resolutionNumber: string;
  title: string;
  description: string;
  status: string;
  votingRequired: boolean;
  votesFor: number;
  votesAgainst: number;
  abstained: number;
  passedByPercentage: number;
  votingClosedAt?: string;
  remarks?: string;
}

export interface MeetingActionItem {
  id: string;
  task: string;
  ownerId?: string;
  ownerName?: string;
  dueDate?: string;
  priority: string;
  status: string;
  completionPercentage: number;
  remarks?: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface MeetingTemplate {
  id: string;
  name: string;
  meetingType: string;
  defaultAgenda?: any[];
  estimatedDuration: number;
  status: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  meetingNumber: string;
  title: string;
  meetingType: string;
  meetingMode: string;
  meetingStatus: string;
  description?: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  venue?: string;
  meetingUrl?: string;
  meetingLink?: string;
  meetingPlatform?: string;
  meetingPassword?: string;
  isRecurring: boolean;
  recurrenceType?: string;
  recurrenceEndDate?: string;
  chairPersonId?: string;
  secretaryId?: string;
  requiresApproval: boolean;
  requiredQuorum: number;
  achievedQuorum: number;
  isQuorumAchieved: boolean;
  minutesPrepared: boolean;
  minutesApproved: boolean;
  minutesNotes?: string;
  noticePublished?: boolean;
  noticePublishedAt?: string;
  noticeDocumentId?: string;
  chairPerson?: { id: string; firstName: string; lastName: string; email?: string };
  secretary?: { id: string; firstName: string; lastName: string; email?: string };
  agendas?: MeetingAgenda[];
  participants?: MeetingParticipant[];
  resolutions?: MeetingResolution[];
  actionItems?: MeetingActionItem[];
  _count?: {
    agendas: number;
    participants: number;
    resolutions: number;
    actionItems: number;
  };
  createdAt: string;
}

export interface MeetingMetrics {
  upcomingMeetings: number;
  meetingsThisMonth: number;
  meetingsHeldThisYear: number;
  averageAttendancePercentage: number;
  openActionItems: number;
  overdueActionItems: number;
  resolutionPassRate: number;
}

export const meetingApi = {
  getMetrics: async (): Promise<MeetingMetrics> => {
    const res = await axiosClient.get('/meetings/metrics');
    return res.data?.data || res.data;
  },

  getMeetings: async (params?: { search?: string; meetingType?: string; meetingStatus?: string; page?: number; limit?: number }) => {
    const res = await axiosClient.get('/meetings', { params });
    return res.data?.data || res.data;
  },

  getMeetingDetails: async (id: string): Promise<Meeting> => {
    const res = await axiosClient.get(`/meetings/${id}`);
    return res.data?.data || res.data;
  },

  createMeeting: async (data: any): Promise<Meeting> => {
    const res = await axiosClient.post('/meetings', data);
    return res.data?.data || res.data;
  },

  updateMeeting: async (id: string, data: any): Promise<Meeting> => {
    const res = await axiosClient.put(`/meetings/${id}`, data);
    return res.data?.data || res.data;
  },

  deleteMeeting: async (id: string): Promise<any> => {
    const res = await axiosClient.delete(`/meetings/${id}`);
    return res.data?.data || res.data;
  },

  addAgenda: async (meetingId: string, data: any): Promise<MeetingAgenda> => {
    const res = await axiosClient.post(`/meetings/${meetingId}/agenda`, data);
    return res.data?.data || res.data;
  },

  updateParticipant: async (meetingId: string, data: any): Promise<MeetingParticipant> => {
    const res = await axiosClient.post(`/meetings/${meetingId}/attendance`, data);
    return res.data?.data || res.data;
  },

  addResolution: async (meetingId: string, data: any): Promise<MeetingResolution> => {
    const res = await axiosClient.post(`/meetings/${meetingId}/resolution`, data);
    return res.data?.data || res.data;
  },

  addActionItem: async (meetingId: string, data: any): Promise<MeetingActionItem> => {
    const res = await axiosClient.post(`/meetings/${meetingId}/action-item`, data);
    return res.data?.data || res.data;
  },

  publishNotice: async (id: string, noticeDocumentId?: string): Promise<Meeting> => {
    const res = await axiosClient.post(`/meetings/${id}/notice`, { noticeDocumentId });
    return res.data?.data || res.data;
  },

  exportAttendance: async (id: string): Promise<any> => {
    const res = await axiosClient.get(`/meetings/${id}/export-attendance`);
    return res.data?.data || res.data;
  },

  exportMinutes: async (id: string): Promise<any> => {
    const res = await axiosClient.get(`/meetings/${id}/export-minutes`);
    return res.data?.data || res.data;
  },

  getTemplates: async (): Promise<MeetingTemplate[]> => {
    const res = await axiosClient.get('/meetings/templates');
    return res.data?.data || res.data;
  },

  createTemplate: async (data: any): Promise<MeetingTemplate> => {
    const res = await axiosClient.post('/meetings/templates', data);
    return res.data?.data || res.data;
  },
};
