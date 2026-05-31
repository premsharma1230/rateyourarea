"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getStoredUser,
  loginUser as persistLogin,
  logoutUser as persistLogout,
} from "@/lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);

    const onUpdate = () => refresh();
    window.addEventListener("rateyourarea-auth-update", onUpdate);
    window.addEventListener("storage", onUpdate);

    return () => {
      window.removeEventListener("rateyourarea-auth-update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  const login = useCallback((payload) => {
    const next = persistLogin(payload);
    setUser(next);
    return next;
  }, []);

  const logout = useCallback(() => {
    persistLogout();
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
