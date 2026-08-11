import { create } from 'zustand';
import { UserSession } from '../types/auth.types';

interface AuthState {
  user: UserSession | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserSession, accessToken: string, refreshToken?: string) => void;
  clearAuth: () => void;
}

const initialUserRaw = localStorage.getItem('user_session');
let initialUser: UserSession | null = null;
try {
  if (initialUserRaw) {
    initialUser = JSON.parse(initialUserRaw);
  }
} catch {
  initialUser = null;
}

// Fallback user if non-logged in or testing
if (!initialUser) {
  initialUser = {
    id: 'dummy-super-admin',
    email: 'superadmin@nestsphere.com',
    firstName: 'Super',
    lastName: 'Admin',
    roles: ['SUPER_ADMIN'],
    societyId: null,
  } as unknown as UserSession;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('user_session', JSON.stringify(user));
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    set({
      user,
      accessToken,
      refreshToken: refreshToken || localStorage.getItem('refresh_token'),
      isAuthenticated: true,
    });
  },
  clearAuth: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_session');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },
}));
