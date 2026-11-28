import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./supabase-config";

export function createSupabaseAdminClient() {
  const { url } = getSupabasePublicConfig();
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secretKey) {
    throw new Error(
      "Supabase admin access is not configured. Set SUPABASE_SECRET_KEY in .env.local.",
    );
  }

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
