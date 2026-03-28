"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Flame,
  Gauge,
  Layers3,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Newspaper,
  Shield,
  Sparkles,
  TrendingUp,
  Users2,
  X,
} from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import IssueCard from "@/components/feed/IssueCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AUTH_EVENT, getSessionUser, openAuthModal } from "@/lib/auth";
import { getStoredIssues, ISSUES_EVENT, updateIssue } from "@/lib/issues";
import type { IssuePost, SocialCluster } from "@/types/issue";
import type { User } from "@/types/user";

const sidebarLinks = [
  { label: "Consensus feed", icon: Newspaper },
  { label: "Bridge leaders", icon: TrendingUp },
  { label: "Policy watch", icon: Shield },
  { label: "Cross-cluster ideas", icon: Sparkles },
];

const defaultCluster: SocialCluster = "Pragmatic Moderates";

function buildBridgeStatus(user: User | null) {
  return {
    displayName: user?.username ?? "Guest observer",
    reputationScore: user ? 82 : 64,
    reliability: user ? 0.78 : 0.61,
    cluster: user?.username ? "Civic Reformers" : defaultCluster,
  } as const;
}

export default function Home() {
  const [issues, setIssues] = useState<IssuePost[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const bridgeStatus = useMemo(() => buildBridgeStatus(currentUser), [currentUser]);

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
        .slice()
        .sort((a, b) => b.consensusScore - a.consensusScore || b.opposingViewSupport - a.opposingViewSupport),
    [issues],
  );

  useEffect(() => {
    function syncUser() {
      setCurrentUser(getSessionUser());
    }

    function syncIssues() {
      setIssues(getStoredIssues());
    }

    syncUser();
    syncIssues();
    window.addEventListener("storage", syncUser);
    window.addEventListener(AUTH_EVENT, syncUser);
    window.addEventListener(ISSUES_EVENT, syncIssues);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener(AUTH_EVENT, syncUser);
      window.removeEventListener(ISSUES_EVENT, syncIssues);
    };
  }, []);

  function handleVote(issueId: string, direction: "up" | "down") {
    updateIssue(issueId, (issue) => {
      if (direction === "up") {
        return {
          ...issue,
          upvotes: issue.upvotes + 1,
          supporterCount: issue.supporterCount + 1,
          consensusScore: Math.min(99, issue.consensusScore + 1),
          opposingViewSupport: Math.min(95, issue.opposingViewSupport + 0.5),
        };
      }

      return {
        ...issue,
        downvotes: issue.downvotes + 1,
        consensusScore: Math.max(0, issue.consensusScore - 1),
        opposingViewSupport: Math.max(5, issue.opposingViewSupport - 0.5),
      };
    });
  }

  return (
    <div className="space-y-8 pb-10">
      <AuthModal />

      <div className="relative flex gap-6">
        <div
          className={`fixed inset-0 z-30 bg-slate-950/35 transition-opacity duration-300 lg:hidden ${
            sidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <aside
          className={`fixed inset-y-0 left-0 z-40 border-r border-slate-200/70 bg-white/95 shadow-2xl backdrop-blur-xl transition-all duration-300 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:translate-x-0 lg:rounded-[28px] lg:border lg:shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] ${
            sidebarExpanded ? "w-72" : "w-[78px]"
          } ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-5">
              <button
                type="button"
                onClick={() => {
                  if (!sidebarExpanded) {
                    setSidebarOpen((current) => !current);
                    setSidebarExpanded(true);
                    return;
                  }

                  setSidebarExpanded((current) => !current);
                  if (sidebarOpen) {
                    setSidebarOpen(false);
                  }
                }}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              {sidebarExpanded ? (
                <span className="pr-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Bridge status</span>
              ) : null}
            </div>

            <div className="px-3 py-4">
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50 p-4">
                <div className="flex items-center gap-3 rounded-2xl">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                    {bridgeStatus.displayName[0]?.toUpperCase() ?? "G"}
                  </div>
                  {sidebarExpanded ? (
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{bridgeStatus.displayName}</div>
                      <div className="text-xs text-slate-500">Bridge Status snapshot</div>
                    </div>
                  ) : null}
                </div>

                {sidebarExpanded ? (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-white px-3 py-3 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Reputation Score
                        </div>
                        <Gauge className="h-4 w-4 text-sky-600" />
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950">{bridgeStatus.reputationScore}</div>
                      <div className="mt-2 text-sm text-slate-500">
                        Bayesian reliability: {Math.round(bridgeStatus.reliability * 100)}% alignment with later consensus
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white px-3 py-3 shadow-sm">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Cluster Badge</div>
                      <div className="mt-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
                        {bridgeStatus.cluster}
                      </div>
                      <div className="mt-2 text-sm text-slate-500">
                        Cross-cluster agreement improves when your votes bridge beyond this cluster.
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex-1 space-y-3 px-3 py-2">
              {sidebarLinks.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                      index === 0
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {sidebarExpanded ? <span className="text-sm font-medium">{item.label}</span> : null}
                  </button>
                );
              })}
            </div>

            {sidebarExpanded ? (
              <div className="border-t border-slate-200/70 px-4 py-5">
                <div className="rounded-[24px] bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Create a post</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Publish a new issue from the dedicated submit page and let the consensus feed rank it.
                  </p>
                  {currentUser ? (
                    <a
                      href="/submit"
                      className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Start thread
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openAuthModal("signin")}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <LockKeyhole className="h-4 w-4" />
                      Sign in to post
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-8 lg:pl-0">
          <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,#172554_0%,#1d4ed8_52%,#f97316_100%)] px-6 py-8 text-white shadow-[0_35px_90px_-45px_rgba(15,23,42,0.8)] sm:px-8 sm:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.26),transparent_22%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.9fr]">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSidebarOpen(true);
                      setSidebarExpanded(true);
                    }}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
                    aria-label="Open sidebar"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <Badge className="w-fit bg-white/15 text-orange-50 backdrop-blur" variant="secondary">
                    Consensus Feed
                  </Badge>
                </div>
                <div className="space-y-4">
                  <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                    Ranked by agreement that actually bridges across different communities.
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-blue-50/90 sm:text-lg">
                    The default feed is sorted by Consensus Score, not raw virality. Posts rise when they attract
                    durable support from opposing social clusters, and every thread exposes a counter-perspective to
                    break the scroll-hole effect.
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

              <Card className="border-white/15 bg-white/10 text-white shadow-none backdrop-blur-xl">
                <CardHeader className="pb-4">
                  <CardDescription className="flex items-center gap-2 text-blue-50">
                    <TrendingUp className="h-4 w-4" />
                    Bridge overview
                  </CardDescription>
                  <CardTitle className="text-3xl text-white">{summary.averageConsensus} avg consensus</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
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

          <section className="grid gap-6 xl:grid-cols-[1.35fr_0.72fr]">
            <div id="feed" className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Primary View</div>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-950">Consensus Feed</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Default ranking favors posts with higher agreement across diverse clusters, then by cross-cluster support.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Sorted by Consensus Score
                </div>
              </div>

              {consensusFeed.map((issue) => (
                <IssueCard key={issue.id} issue={issue} onVote={handleVote} />
              ))}
            </div>

            <div className="space-y-6">
              <Card className="border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">How ranking works</Badge>
                  <CardTitle className="text-xl">Bridge mechanics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-600">
                  <p>Consensus Score promotes posts with strong agreement across opposing user clusters.</p>
                  <p>Bridge Meter highlights how much support comes from viewpoints outside a single echo chamber.</p>
                  <p>Counter-Perspective forces a quick encounter with a high-ranked opposing argument before scrolling on.</p>
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
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-slate-950/20 p-4">
      <div className="flex items-center justify-between text-blue-50">
        <span className="text-sm">{label}</span>
        {icon}
      </div>
      <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}
