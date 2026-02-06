"use client";

import { useCallback } from "react";
import { useSessionStore } from "@/commons/store/session-store";
import { createClient } from "@/lib/supabase/browser";

export interface UseAuthResult {
  user: ReturnType<typeof useSessionStore.getState>["user"];
  isAuthenticated: boolean;
  isAdmin: boolean;
  currentUserId: string | null;
  signOut: () => Promise<void>;
}

/**
 * 로그인 상태 및 사용자 정보를 반환하는 훅
 * Supabase Auth와 session-store 동기화
 */
export function useAuth(): UseAuthResult {
  const user = useSessionStore((state) => state.user);
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const isAdmin = useSessionStore((state) => state.isAdmin);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  }, []);

  return {
    user,
    isAuthenticated,
    isAdmin,
    currentUserId: user?.id ?? null,
    signOut,
  };
}
