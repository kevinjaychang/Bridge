"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AUTH_EVENT, getSessionUser } from "@/lib/auth";
import type { User } from "@/types/user";

type AuthContextValue = {
  currentUser: User | null;
  isAuthReady: boolean;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  async function refreshAuth() {
    setCurrentUser(await getSessionUser());
    setIsAuthReady(true);
  }

  useEffect(() => {
    void refreshAuth();

    function handleAuthChange() {
      void refreshAuth();
    }

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener(AUTH_EVENT, handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener(AUTH_EVENT, handleAuthChange);
    };
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthReady,
      refreshAuth,
    }),
    [currentUser, isAuthReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthState() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthState must be used within AuthProvider.");
  }

  return context;
}
