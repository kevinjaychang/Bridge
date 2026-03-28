"use client";

import { Menu, Newspaper, PenSquare, ScrollText, Shield, TrendingUp, UserRound, X } from "lucide-react";
import { useSidebarState } from "@/components/navigation/SidebarProvider";
import type { User } from "@/types/user";

const sidebarLinks = [
  { label: "Popular", icon: TrendingUp, href: "/" },
  { label: "Consensus feed", icon: Newspaper, href: "/" },
  { label: "Policy watch", icon: Shield, href: "/" },
  { label: "Source-first", icon: ScrollText, href: "/" },
  { label: "Profile", icon: UserRound, href: "/profile" },
];

function getReputationScore(user: User) {
  return 72 + (user.username.length % 19);
}

export default function AppSidebar({
  currentUser,
  activeLabel,
  secondaryStat,
}: {
  currentUser: User | null;
  activeLabel: string;
  secondaryStat?: {
    label: string;
    value: string;
    description: string;
  };
}) {
  const { isExpanded, setIsExpanded } = useSidebarState();

  if (!currentUser) {
    return null;
  }

  return (
    <aside className={`hidden shrink-0 transition-all duration-300 lg:block ${isExpanded ? "w-[296px]" : "w-[72px]"}`}>
      <div className="sticky top-24 space-y-5">
        {isExpanded ? (
          <>
            <div className="rounded-[28px] border border-slate-200/80 bg-white/92 p-4 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900 text-base font-semibold text-white">
                    {currentUser.username[0]?.toUpperCase() ?? "B"}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-slate-950">{currentUser.username}</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Signed in</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  aria-label="Collapse sidebar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Reputation score</div>
                  <div className="mt-2 text-3xl font-semibold text-slate-950">{getReputationScore(currentUser)}</div>
                  <div className="mt-2 text-sm text-slate-500">Higher-quality threads and constructive activity improve visibility.</div>
                </div>

                {secondaryStat ? (
                  <div className="rounded-2xl bg-slate-50 px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{secondaryStat.label}</div>
                    <div className="mt-2 text-3xl font-semibold text-slate-950">{secondaryStat.value}</div>
                    <div className="mt-2 text-sm text-slate-500">{secondaryStat.description}</div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/80 bg-white/92 p-4 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
              <div className="space-y-2">
                {sidebarLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.label === activeLabel;

                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5 shrink-0" />
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Submit</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Create a source-backed thread with a clear claim, supporting context, and bibliography links.
              </p>
              <a
                href="/submit"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <PenSquare className="h-4 w-4" />
                Open submit page
              </a>
            </div>
          </>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/92 text-slate-700 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] backdrop-blur transition hover:bg-white hover:text-slate-950"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
