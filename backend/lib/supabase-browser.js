import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/backend/lib/supabase-env";

let browserClient;

/** Browser Supabase client (singleton) — OAuth + session */
export function createBrowserSupabaseClient() {
  if (typeof window === "undefined") {
    return createBrowserClient(
      getSupabaseUrl() || "https://placeholder.supabase.co",
      getSupabaseAnonKey() || "placeholder-anon-key"
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      getSupabaseUrl() || "https://placeholder.supabase.co",
      getSupabaseAnonKey() || "placeholder-anon-key"
    );
  }

  return browserClient;
}
