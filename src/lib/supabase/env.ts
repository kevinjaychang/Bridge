export function getSupabaseBrowserEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "",
  };
}

export function getSupabaseEnv() {
  return {
    ...getSupabaseBrowserEnv(),
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "",
  };
}

export function hasSupabaseBrowserEnv() {
  const env = getSupabaseBrowserEnv();
  return Boolean(env.url && env.anonKey);
}
