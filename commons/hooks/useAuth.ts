"use client";

import { useSessionStore } from "@/commons/store/session-store";

export interface UseAuthResult {
  user: ReturnType<typeof useSessionStore.getState>["user"];
  isAuthenticated: boolean;
  isAdmin: boolean;
  currentUserId: string | null;
}

/**
 * 로그인 상태 및 사용자 정보를 반환하는 훅
 * session-store 기반
 */
export function useAuth(): UseAuthResult {
  const user = useSessionStore((state) => state.user);
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const isAdmin = useSessionStore((state) => state.isAdmin);

  return {
    user,
    isAuthenticated,
    isAdmin,
    currentUserId: user?.id ?? null,
  };
}
