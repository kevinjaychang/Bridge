"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

const SIDEBAR_STORAGE_KEY = "bridge-protocol.sidebar-expanded";

type SidebarContextValue = {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (saved === "false") {
      setIsExpanded(false);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isExpanded));
  }, [isExpanded]);

  const value = useMemo(
    () => ({
      isExpanded,
      setIsExpanded,
    }),
    [isExpanded],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebarState() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebarState must be used within SidebarProvider.");
  }

  return context;
}
