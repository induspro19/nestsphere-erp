import { useAuthStore } from '../store/authStore';
import { RoleType } from '../types/auth.types';

export const usePermission = () => {
  const user = useAuthStore((state) => state.user);

  const hasRole = (allowedRoles: RoleType[]): boolean => {
    if (!user || !user.roles) return false;
    if (user.roles.includes('SUPER_ADMIN')) return true;
    return allowedRoles.some((role) => user.roles.includes(role));
  };

  return { hasRole, userRoles: user?.roles || [] };
};
