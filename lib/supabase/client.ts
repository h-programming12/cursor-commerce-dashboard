// lib/supabase/client.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/commons/config/env";
import type { Database } from "@/types/supabase";

let browserClient: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const { supabase } = getPublicEnv();

    browserClient = createClient<Database>(
      supabase.url,
      supabase.publishableKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
        db: {
          schema: "public",
        },
      }
    );
  }

  return browserClient;
}
