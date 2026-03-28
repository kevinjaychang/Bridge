import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserEnv, hasSupabaseBrowserEnv } from "@/lib/supabase/env";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (!hasSupabaseBrowserEnv()) {
    return null;
  }

  if (browserClient) {
    return browserClient;
  }

  const env = getSupabaseBrowserEnv();
  browserClient = createClient(env.url, env.anonKey);
  return browserClient;
}
