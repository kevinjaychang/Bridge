"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Cpu,
  GraduationCap,
  Flame,
  Globe2,
  HeartPulse,
  Layers3,
  LockKeyhole,
  MessageSquareText,
  Newspaper,
  Shield,
  TrendingUp,
  Users2,
} from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import { useAuthState } from "@/components/auth/AuthProvider";
import IssueCard from "@/components/feed/IssueCard";
import AppSidebar from "@/components/navigation/AppSidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { openAuthModal } from "@/lib/auth";
import { ISSUES_EVENT, listIssues, voteOnIssue } from "@/lib/issues";
import type { IssueCategory, IssuePost } from "@/types/issue";

const topCategories: Array<{
  label: string;
  value: "All" | IssueCategory;
  icon: typeof Newspaper;
}> = [
  { label: "Trending", value: "All", icon: Newspaper },
  { label: "Economy", value: "Economy", icon: BriefcaseBusiness },
  { label: "Healthcare", value: "Healthcare", icon: HeartPulse },
  { label: "Immigration", value: "Immigration", icon: Globe2 },
  { label: "Climate", value: "Climate", icon: Shield },
  { label: "Education", value: "Education", icon: GraduationCap },
  { label: "Technology", value: "Technology", icon: Cpu },
  { label: "Local Policy", value: "All", icon: Building2 },
];

export default function Home() {
  const [issues, setIssues] = useState<IssuePost[]>([]);
  const [activeCategory, setActiveCategory] = useState<"All" | IssueCategory>("All");
  const { currentUser } = useAuthState();

  const summary = useMemo(() => {
    const issueCount = issues.length;
    const totalVotes = issues.reduce((sum, issue) => sum + issue.upvotes + issue.downvotes, 0);
    const totalComments = issues.reduce((sum, issue) => sum + issue.commentCount, 0);
    const consensusLeader =
      issues.length > 0
        ? issues.reduce((top, issue) => (issue.consensusScore > top.consensusScore ? issue : top), issues[0])
        : null;

    return {
      issueCount,
      totalVotes,
      totalComments,
      consensusLeader,
      totalFollowers: issues.reduce((sum, issue) => sum + issue.supporterCount, 0),
      averageConsensus:
        issues.length > 0 ? Math.round(issues.reduce((sum, issue) => sum + issue.consensusScore, 0) / issues.length) : 0,
    };
  }, [issues]);

  const consensusFeed = useMemo(
    () =>
      issues
        .filter((issue) => (activeCategory === "All" ? true : issue.category === activeCategory))
        .slice()
        .sort((a, b) => b.consensusScore - a.consensusScore || b.opposingViewSupport - a.opposingViewSupport),
    [activeCategory, issues],
  );

  useEffect(() => {
    async function syncIssues() {
      setIssues(await listIssues());
    }

    function handleIssuesChange() {
      void syncIssues();
    }

    void syncIssues();
    window.addEventListener(ISSUES_EVENT, handleIssuesChange);

    return () => {
      window.removeEventListener(ISSUES_EVENT, handleIssuesChange);
    };
  }, []);

  async function handleVote(issueId: string, direction: "up" | "down") {
    const updated = await voteOnIssue(issueId, direction);
    if (!updated) {
      return;
    }

    setIssues((current) => current.map((issue) => (issue.id === updated.id ? updated : issue)));
  }

  return (
    <div className="space-y-8 pb-10">
      <AuthModal />

      <div className="relative flex gap-5 xl:gap-7">
        <AppSidebar
          currentUser={currentUser}
          activeLabel="Consensus feed"
          secondaryStat={{
            label: "Popular now",
            value: `${summary.issueCount}`,
            description: "Threads currently ranking across the main feed.",
          }}
        />

        <main className="min-w-0 flex-1 space-y-8 lg:pl-0">
          <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.22)]">
            <div className="flex gap-2 overflow-x-auto px-4 py-4 xl:px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {topCategories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.value;

                return (
                  <button
                    key={`${category.label}-${category.value}`}
                    type="button"
                    onClick={() => setActiveCategory(category.value)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                        : "border-transparent bg-slate-100 text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,#172554_0%,#1d4ed8_52%,#f97316_100%)] px-6 py-8 text-white shadow-[0_35px_90px_-45px_rgba(15,23,42,0.8)] sm:px-8 sm:py-10 xl:px-10 xl:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.26),transparent_22%)]" />
            <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.9fr)] 2xl:grid-cols-[minmax(0,1.45fr)_430px]">
              <div className="space-y-5 xl:space-y-6">
                <div className="flex items-center gap-3">
                  <Badge className="w-fit bg-white/15 text-orange-50 backdrop-blur" variant="secondary">
                    Consensus Feed
                  </Badge>
                </div>
                <div className="space-y-4">
                  <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl xl:text-[4.25rem] xl:leading-[1.02]">
                    Follow the strongest, most sourceable threads first.
                  </h1>
                  <p className="max-w-3xl text-base leading-7 text-blue-50/90 sm:text-lg xl:text-[1.38rem] xl:leading-9">
                    The main feed favors clear titles, stronger agreement, and active discussion over raw virality.
                    Open any thread to vote, read comments, and review the supporting links attached to the post.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {currentUser ? (
                    <a
                      href="/submit"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                    >
                      Start a thread
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openAuthModal("signin")}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                    >
                      Sign in to post
                      <LockKeyhole className="h-4 w-4" />
                    </button>
                  )}
                  <a
                    href="#feed"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                  >
                    Jump to feed
                    <Flame className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <Card className="h-full border-white/15 bg-white/10 text-white shadow-none backdrop-blur-xl">
                <CardHeader className="pb-4 xl:pb-5">
                  <CardDescription className="flex items-center gap-2 text-blue-50">
                    <TrendingUp className="h-4 w-4" />
                    Feed overview
                  </CardDescription>
                  <CardTitle className="text-3xl text-white">{summary.averageConsensus} avg agreement</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 xl:gap-5">
                  <MetricTile label="Live issues" value={`${summary.issueCount}`} icon={<Layers3 className="h-4 w-4" />} />
                  <MetricTile label="Total votes" value={`${summary.totalVotes}`} icon={<BarChart3 className="h-4 w-4" />} />
                  <MetricTile label="Comments" value={`${summary.totalComments}`} icon={<MessageSquareText className="h-4 w-4" />} />
                  <MetricTile
                    label="Top bridge thread"
                    value={summary.consensusLeader ? `${summary.consensusLeader.consensusScore}` : "0"}
                    icon={<Users2 className="h-4 w-4" />}
                  />
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.58fr)_320px] 2xl:grid-cols-[minmax(0,1.68fr)_340px]">
            <div id="feed" className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Primary View</div>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                    {activeCategory === "All" ? "Consensus Feed" : `${activeCategory} threads`}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {activeCategory === "All"
                      ? "Default ranking favors posts with higher agreement across diverse clusters, then by cross-cluster support."
                      : `Showing ${activeCategory.toLowerCase()} posts ranked by agreement and discussion quality.`}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Sorted by agreement
                </div>
              </div>

              {consensusFeed.length > 0 ? (
                consensusFeed.map((issue) => <IssueCard key={issue.id} issue={issue} onVote={handleVote} />)
              ) : (
                <Card className="border-slate-200/80 bg-white/90 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.22)]">
                  <CardContent className="p-8 text-sm text-slate-600">
                    No threads are available in this category yet. Try another section or create the first one.
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] xl:sticky xl:top-24">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">Thread tips</Badge>
                  <CardTitle className="text-xl">Before you publish</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-600">
                  <p>Use a specific title so readers know exactly what claim or question they are evaluating.</p>
                  <p>Longer thread bodies perform better when they explain the claim, the context, and the tradeoffs.</p>
                  <p>Include at least two bibliography links so readers can inspect the evidence directly.</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">Create a thread</Badge>
                  <CardTitle className="text-xl">Use the submit page</CardTitle>
                  <CardDescription>
                    Post creation now lives on its own dedicated route so the feed stays focused on reading and ranking.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a
                    href="/submit"
                    className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Go to /submit
                  </a>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-white/15 bg-slate-950/20 p-4 xl:p-5">
      <div className="flex items-center justify-between text-blue-50">
        <span className="text-sm xl:text-[15px]">{label}</span>
        {icon}
      </div>
      <div className="mt-3 text-2xl font-semibold text-white xl:text-[2rem]">{value}</div>
    </div>
  );
}
