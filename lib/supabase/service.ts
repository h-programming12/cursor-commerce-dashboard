import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/commons/config/env";
import type { Database } from "@/types/supabase";

let serviceClient: SupabaseClient<Database> | null = null;

/**
 * service_role 키를 사용하는 Supabase 서버 클라이언트입니다.
 * RLS를 우회해서 관리자 권한으로 쿼리를 실행할 때 사용합니다.
 *
 * ⚠️ 이 클라이언트는 서버 환경에서만 사용해야 하며,
 *    절대 클라이언트 번들에 포함되면 안 됩니다.
 */
export function getSupabaseServiceClient(): SupabaseClient<Database> {
  if (!serviceClient) {
    const {
      supabase: { url, secretKey },
    } = getServerEnv();

    serviceClient = createClient<Database>(url, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: "public",
      },
    });
  }

  return serviceClient;
}
