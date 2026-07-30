import { axiosClient } from './axiosClient';

export interface WorkflowStepInstance {
  id: string;
  stepNumber: number;
  stepName: string;
  roleCode: string;
  status: string;
  approverId?: string;
  comments?: string;
  signatureHash?: string;
  actionAt?: string;
}

export interface WorkflowComment {
  id: string;
  actorId: string;
  comment: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface WorkflowInstance {
  id: string;
  entityType: string;
  entityId: string;
  title: string;
  notes?: string;
  status: string;
  currentStepNumber: number;
  slaDueDate?: string;
  isEscalated: boolean;
  signatureHash?: string;
  createdAt: string;
  steps: WorkflowStepInstance[];
  comments?: WorkflowComment[];
  timeline?: any[];
}

export interface WorkflowTemplate {
  id: string;
  code: string;
  name: string;
  entityType: string;
  approvalType: string;
  slaHours: number;
  isActive: boolean;
  steps: {
    id: string;
    stepNumber: number;
    stepName: string;
    assigneeRole?: string;
    requireDigitalSignature: boolean;
  }[];
}

export const workflowApi = {
  getPendingApprovals: async (): Promise<WorkflowInstance[]> => {
    const res = await axiosClient.get('/workflows/pending');
    return res.data?.data || res.data;
  },

  getWorkflows: async (params?: { search?: string; entityType?: string; status?: string; page?: number }) => {
    const res = await axiosClient.get('/workflows', { params });
    return res.data?.data || res.data;
  },

  getWorkflowDetails: async (id: string): Promise<WorkflowInstance> => {
    const res = await axiosClient.get(`/workflows/${id}`);
    return res.data?.data || res.data;
  },

  startWorkflow: async (data: {
    entityType: string;
    entityId: string;
    title: string;
    notes?: string;
    templateCode?: string;
  }): Promise<WorkflowInstance> => {
    const res = await axiosClient.post('/workflows/start', data);
    return res.data?.data || res.data;
  },

  processAction: async (
    id: string,
    data: {
      action: 'APPROVED' | 'REJECTED' | 'RETURNED_FOR_CORRECTION' | 'CANCELLED' | 'WITHDRAWN';
      comments?: string;
      signatureHash?: string;
    },
  ): Promise<WorkflowInstance> => {
    const res = await axiosClient.post(`/workflows/${id}/action`, data);
    return res.data?.data || res.data;
  },

  getTemplates: async (): Promise<WorkflowTemplate[]> => {
    const res = await axiosClient.get('/workflows/templates/all');
    return res.data?.data || res.data;
  },

  createTemplate: async (data: any): Promise<WorkflowTemplate> => {
    const res = await axiosClient.post('/workflows/templates', data);
    return res.data?.data || res.data;
  },
};
