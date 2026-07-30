import { axiosClient } from './axiosClient';
import { AuthResponse } from '../types/auth.types';

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    // Mock login for frontend preview
    return {
      user: {
        id: 'mock-admin-id',
        email: credentials.email || 'admin@society.com',
        firstName: 'Gatekeeper',
        lastName: 'Admin',
        roles: ['SUPER_ADMIN', 'SECURITY'],
        societyId: 'mock-society-id',
        societyName: 'Grand Heights Society',
      },
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      }
    };
  },

  logout: async (): Promise<void> => {
    // mock logout
  },
};
