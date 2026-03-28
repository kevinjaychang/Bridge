"use client";

import type { ReactNode } from "react";
import { AuthProvider, useAuthState } from "@/components/auth/AuthProvider";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import { SidebarProvider } from "@/components/navigation/SidebarProvider";
import TopHeader from "@/components/navigation/TopHeader";

function LoadingShell() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-800 antialiased">
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1720px] items-center justify-between px-4 sm:px-6 xl:px-10 2xl:px-12">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-slate-900" />
            <div className="space-y-2">
              <div className="h-5 w-28 rounded-full bg-slate-200" />
              <div className="h-3 w-20 rounded-full bg-slate-100" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-24 rounded-full bg-slate-100" />
            <div className="h-10 w-24 rounded-full bg-slate-100" />
          </div>
        </div>
      </header>

      <main className="flex-grow pb-24 sm:pb-0">
        <div className="mx-auto max-w-[1720px] px-4 py-6 sm:px-6 xl:px-10 2xl:px-12">
          <div className="h-[72vh] rounded-[36px] border border-slate-200/70 bg-white/80 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.25)]" />
        </div>
      </main>
    </div>
  );
}

function AppFrameInner({ children }: { children: ReactNode }) {
  const { isAuthReady } = useAuthState();

  if (!isAuthReady) {
    return <LoadingShell />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-800 antialiased">
      <TopHeader />
      <main className="flex-grow pb-24 sm:pb-0">
        <div className="mx-auto max-w-[1720px] px-4 py-6 sm:px-6 xl:px-10 2xl:px-12">{children}</div>
      </main>
      <MobileBottomNav />
    </div>
  );
}

export default function AppFrame({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AppFrameInner>{children}</AppFrameInner>
      </SidebarProvider>
    </AuthProvider>
  );
}
