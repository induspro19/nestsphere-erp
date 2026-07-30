import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  return {
    user,
    isAuthenticated,
    setAuth,
    clearAuth,
  };
};
