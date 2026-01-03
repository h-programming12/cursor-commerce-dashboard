export type UserRole = "user" | "super_admin";

export interface UserSession {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
}

export interface SessionState {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
