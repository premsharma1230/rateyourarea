import { createBrowserSupabaseClient } from "@/backend/lib/supabase-browser";

/** Browser client used across the app (reviews, storage, auth) */
export const supabase = createBrowserSupabaseClient();
