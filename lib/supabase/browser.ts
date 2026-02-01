import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { getPublicEnv } from "@/commons/config/env";
import type { Database } from "@/types/supabase";

export function createClient() {
  const { supabase } = getPublicEnv();
  return createBrowserClient<Database>(supabase.url, supabase.publishableKey);
}
