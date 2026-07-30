export type RoleType =
  | 'SUPER_ADMIN'
  | 'SOCIETY_ADMIN'
  | 'COMMITTEE'
  | 'SECURITY'
  | 'RESIDENT'
  | 'TENANT'
  | 'VENDOR'
  | 'MAINTENANCE_STAFF';

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  roles: RoleType[];
  societyId?: string | null;
  societyName?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: UserSession;
  tokens: AuthTokens;
}
