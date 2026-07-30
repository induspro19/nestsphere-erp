import { create } from 'zustand';
import { UserSession } from '../types/auth.types';

interface AuthState {
  user: UserSession | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserSession, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: 'dummy-super-admin',
    email: 'superadmin@nestsphere.com',
    firstName: 'Super',
    lastName: 'Admin',
    roles: ['SUPER_ADMIN'],
    societyId: null,
  } as unknown as UserSession,
  accessToken: localStorage.getItem('access_token'),
  isAuthenticated: true, // !!localStorage.getItem('access_token'),
  setAuth: (user, token) => {
    localStorage.setItem('access_token', token);
    set({ user, accessToken: token, isAuthenticated: true });
  },
  clearAuth: () => {
    localStorage.removeItem('access_token');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
