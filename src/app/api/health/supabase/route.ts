import { NextResponse } from "next/server";
import { getSupabaseEnv, hasSupabaseBrowserEnv } from "@/lib/supabase/env";

export async function GET() {
  const env = getSupabaseEnv();

  return NextResponse.json({
    configured: hasSupabaseBrowserEnv(),
    hasUrl: Boolean(env.url),
    hasAnonKey: Boolean(env.anonKey),
    hasServiceRoleKey: Boolean(env.serviceRoleKey),
  });
}
