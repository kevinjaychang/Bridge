"use client";

import { useEffect, useState } from "react";
import { Flame, LogOut, PlusSquare, UserRound } from "lucide-react";
import { AUTH_EVENT, getSessionUser, openAuthModal, signOutUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";

export default function TopHeader() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    function syncUser() {
      setCurrentUser(getSessionUser());
    }

    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener(AUTH_EVENT, syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener(AUTH_EVENT, syncUser);
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-3 rounded-2xl transition hover:opacity-90">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
              B
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 sm:text-2xl">Bridge</h1>
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Issue feed</p>
            </div>
          </a>
          <nav className="hidden items-center gap-2 sm:flex">
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Flame className="h-4 w-4" />
              Feed
            </a>
            <a
              href="/submit"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <PlusSquare className="h-4 w-4" />
              Create post
            </a>
            {currentUser ? (
              <>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                  <UserRound className="h-4 w-4 text-sky-600" />
                  {currentUser.username}
                </div>
                <Button variant="ghost" size="sm" onClick={signOutUser}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("signin")}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <UserRound className="h-4 w-4" />
                Sign in
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
