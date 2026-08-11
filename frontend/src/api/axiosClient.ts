import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const axiosClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const state = useAuthStore.getState();
  const token = state.accessToken;
  const user = state.user;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (user?.societyId && config.headers) {
    config.headers['X-Society-ID'] = user.societyId;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken || localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post('/api/v1/auth/refresh', { refreshToken });
          const newToken = res.data?.data?.accessToken || res.data?.accessToken;
          const newRefreshToken = res.data?.data?.refreshToken || res.data?.refreshToken;

          if (newToken) {
            const currentUser = useAuthStore.getState().user!;
            useAuthStore.getState().setAuth(currentUser, newToken, newRefreshToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosClient(originalRequest);
          }
        } catch (refreshErr) {
          console.error('Refresh token failed:', refreshErr);
          useAuthStore.getState().clearAuth();
        }
      } else {
        useAuthStore.getState().clearAuth();
      }
    }
    return Promise.reject(error);
  },
);
