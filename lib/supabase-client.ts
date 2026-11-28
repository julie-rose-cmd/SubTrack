import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "./supabase-config";

const { url, key } = getSupabasePublicConfig();

export const supabase = createBrowserClient(url, key);
