"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { getUser, onAuthChange, signOut } from "@/backend/api/auth";

const AuthContext = createContext(null);

function mapSupabaseUser(supabaseUser) {
  if (!supabaseUser) return null;

  const meta = supabaseUser.user_metadata || {};
  const email = supabaseUser.email || "";
  const name =
    meta.full_name ||
    meta.name ||
    email.split("@")[0] ||
    "Resident";

  return {
    id: supabaseUser.id,
    email,
    name: String(name).trim() || "Resident",
    loggedInAt: supabaseUser.last_sign_in_at || new Date().toISOString(),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const supabaseUser = await getUser();
    setUser(mapSupabaseUser(supabaseUser));
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await refresh();
      if (mounted) setReady(true);
    })();

    const { data: listener } = onAuthChange((supabaseUser) => {
      setUser(mapSupabaseUser(supabaseUser));
      setReady(true);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [refresh]);

  const login = useCallback(async () => {
    await refresh();
    return user;
  }, [refresh, user]);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ready,
        user,
        isLoggedIn: Boolean(user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
