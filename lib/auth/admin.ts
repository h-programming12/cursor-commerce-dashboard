import { createClient } from "@/lib/supabase/server";
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
