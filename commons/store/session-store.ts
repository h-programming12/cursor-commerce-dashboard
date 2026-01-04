import { create } from "zustand";

// UserRole 타입 정의
export type UserRole = "user" | "admin";

// UserSession 타입 정의 (Supabase users 테이블과 일치)
export interface UserSession {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
}

// SessionState 인터페이스
export interface SessionState {
  user: UserSession | null;
  isAuthenticated: boolean; // user !== null로 자동 계산
  isAdmin: boolean; // user?.role === "admin"로 자동 계산
  setUser: (user: UserSession) => void;
  clearUser: () => void;
}

// 유저 세션 스토어 생성 (메모리 전용, persist 사용 X)
export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  // 유저 정보 설정
  setUser: (user) => {
    set({
      user,
      isAuthenticated: true,
      isAdmin: user.role === "admin",
    });
  },

  // 유저 정보 제거 (로그아웃)
  clearUser: () => {
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  },
}));
