import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AUTH_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import type { Database } from "@/types/supabase";

type UserRow = Pick<
  Database["public"]["Tables"]["users"]["Row"],
  "id" | "role"
>;

/**
 * 현재 로그인한 사용자가 관리자(admin) 권한을 가지고 있는지 확인합니다.
 *
 * @returns 사용자가 admin이면 true, 아니면 false
 */
export async function checkAdminAccess(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return false;
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    // eslint-disable-next-line no-console
    console.error("[checkAdminAccess] 사용자 조회 실패:", error);
    return false;
  }

  const row = data as UserRow | null;
  return row?.role === "admin";
}

/**
 * Admin 페이지 접근 시 세션·역할 검사 후 미충족 시 redirect.
 * 세션 없음 → 로그인 페이지, role !== 'admin' → 커머스 홈.
 */
export async function requireAdminAccess(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(AUTH_URLS.LOGIN);
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    redirect(COMMERCE_URLS.HOME);
  }

  const row = data as UserRow | null;
  if (row?.role !== "admin") {
    redirect(COMMERCE_URLS.HOME);
  }
}
