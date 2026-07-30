import { RoleType } from './auth.types';

export interface RoutePermission {
  allowedRoles?: RoleType[];
  requiredPermissions?: string[];
}
