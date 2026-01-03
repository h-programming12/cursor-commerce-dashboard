// lib/supabase/server.ts
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getPublicEnv } from "@/commons/config/env";
import type { Database } from "@/types/supabase";

export async function createClient() {
  const cookieStore = await cookies();
  const { supabase } = getPublicEnv();

  return createServerClient<Database>(supabase.url, supabase.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // Server Component에서 호출된 경우 무시
        }
      },
    },
  });
}
