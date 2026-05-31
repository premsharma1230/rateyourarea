const PLACEHOLDER_URL = "your_project_url";
const PLACEHOLDER_KEY = "your_anon_key";

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    url &&
      key &&
      url !== PLACEHOLDER_URL &&
      key !== PLACEHOLDER_KEY &&
      url.startsWith("http")
  );
}
