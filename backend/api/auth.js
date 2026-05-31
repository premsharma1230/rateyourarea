import { supabase } from "@/backend/lib/supabase";

export async function signUp(email, password, fullName, profileMeta = {}) {
  const { data, error } = await supabase.auth.signUp({
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
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
}
