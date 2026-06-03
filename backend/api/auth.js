import { isSupabaseConfigured } from "@/backend/lib/config";
import { createBrowserSupabaseClient } from "@/backend/lib/supabase-browser";

function getClient() {
  return createBrowserSupabaseClient();
}

export async function signUp(email, password, fullName, profileMeta = {}) {
  const { data, error } = await getClient().auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        ...profileMeta,
      },
    },
  });
  return { data, error };
}

export async function signIn(email, password) {
  const { data, error } = await getClient().auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signInWithGoogle({ next = "/" } = {}) {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: new Error(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      ),
    };
  }

  if (typeof window === "undefined") {
    return { data: null, error: new Error("Google sign-in must run in the browser") };
  }

  const safeNext = next.startsWith("/") ? next : "/";
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;

  const { data, error } = await getClient().auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "online",
        prompt: "select_account",
      },
    },
  });

  if (!error && data?.url) {
    window.location.assign(data.url);
  }

  return { data, error };
}

export async function signOut() {
  const { error } = await getClient().auth.signOut();
  return { error };
}

export async function getUser() {
  const {
    data: { user },
    error,
  } = await getClient().auth.getUser();

  if (error) {
    const {
      data: { session },
    } = await getClient().auth.getSession();
    return session?.user ?? null;
  }

  return user ?? null;
}

export async function getSession() {
  const { data, error } = await getClient().auth.getSession();
  return { session: data.session, error };
}

export function onAuthChange(callback) {
  return getClient().auth.onAuthStateChange((event, session) => {
    callback(event, session?.user ?? null);
  });
}
