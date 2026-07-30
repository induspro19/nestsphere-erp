import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { RoleType } from '../types/auth.types';

interface ProtectedRouteProps {
  allowedRoles?: RoleType[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = user?.roles?.some((role) =>
      allowedRoles.includes(role as RoleType) || role === 'SUPER_ADMIN',
    );

    if (!hasPermission) {
      return <Navigate to="/403" replace />;
    }
  }

  return <Outlet />;
};
