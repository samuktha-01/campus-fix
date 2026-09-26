import { UserRole } from '../lib/constants';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department_id?: string | null;
  department_name?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserProfile;
}

export interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (name: string, email: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
  clearError: () => void;
}
