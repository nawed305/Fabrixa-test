// src/lib/fabrixa/supabase.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { APP_DATA_0 } from "@/lib/fabrixa/APP_DATA_0";

const SUPABASE_URL = APP_DATA_0.supabase.url;
const SUPABASE_ANON_KEY = APP_DATA_0.supabase.anonKey;

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: typeof window !== "undefined",
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return _client;
}