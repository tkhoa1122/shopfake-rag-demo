export type UserRole = "customer" | "business_owner" | "marketing" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId?: string; // null for admin, set for business/marketing roles
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
