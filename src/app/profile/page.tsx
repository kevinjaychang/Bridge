"use client";

import { useMemo } from "react";
import { ArrowRight, BadgeCheck, Mail, ShieldCheck, UserRound } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import { useAuthState } from "@/components/auth/AuthProvider";
import AppSidebar from "@/components/navigation/AppSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { openAuthModal, signOutUser } from "@/lib/auth";

function formatJoinedDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date);
}

export default function ProfilePage() {
  const { currentUser: user } = useAuthState();

  const profileStats = useMemo(
    () => [
      { label: "Account type", value: user?.authProvider === "google" ? "Google sign-in" : "Email sign-in" },
      { label: "Member since", value: user ? formatJoinedDate(user.createdAt) : "Sign in required" },
      { label: "Profile status", value: user ? "Ready to publish" : "Guest mode" },
    ],
    [user],
  );

  return (
    <div className="space-y-8 pb-10">
      <AuthModal />

      <div className="flex gap-5 xl:gap-7">
        <AppSidebar
          currentUser={user}
          activeLabel="Profile"
          secondaryStat={{
            label: "Popular now",
            value: "Profile",
            description: "Account details, publishing access, and session status in one place.",
          }}
        />

        <div className="min-w-0 flex-1 space-y-8">
          <section className="rounded-[36px] border border-slate-900/80 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#0f172a_100%)] px-8 py-10 text-white shadow-[0_35px_90px_-45px_rgba(15,23,42,0.8)]">
            <div className="space-y-4">
              <Badge className="rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[11px] uppercase tracking-[0.24em] text-white">
                Profile
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight">Your Bridge identity</h1>
              <p className="max-w-2xl text-base leading-7 text-slate-200">
                Keep your account details in one place and jump back into thread creation whenever you are ready.
              </p>
            </div>
          </section>

          {user ? (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Card className="border-slate-200/80 bg-white/90">
                <CardHeader>
                  <CardTitle>Account overview</CardTitle>
                  <CardDescription>Your current Bridge session details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center gap-4 rounded-3xl bg-slate-50 p-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 text-xl font-semibold text-white">
                      {user.username[0]?.toUpperCase() ?? "B"}
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-semibold text-slate-950">{user.username}</div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {profileStats.map((item) => (
                      <div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <a href="/submit">
                      <Button>
                        Create thread
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button variant="outline" onClick={() => void signOutUser()}>
                      Sign out
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200/80 bg-white/90">
                <CardHeader>
                  <CardTitle>Trust signals</CardTitle>
                  <CardDescription>Lightweight profile markers for this Supabase-backed account flow.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-4">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-sky-600" />
                    Your Supabase session is active, so you can publish, vote, and comment without re-entering credentials.
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-4">
                    <BadgeCheck className="mt-0.5 h-4 w-4 text-sky-600" />
                    This page is now a real route again, so the profile button in the header has somewhere valid to go.
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-slate-200/80 bg-white/90">
              <CardHeader>
                <CardTitle>Sign in to view your profile</CardTitle>
                <CardDescription>Your session is currently in guest mode.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button onClick={() => openAuthModal("signin")}>
                  <UserRound className="h-4 w-4" />
                  Sign in
                </Button>
                <a href="/">
                  <Button variant="outline">Return to feed</Button>
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
