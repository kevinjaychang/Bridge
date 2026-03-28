"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowBigDown, ArrowBigUp, ArrowLeft, ArrowRightLeft, MessageSquare, Users2 } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AUTH_EVENT, getSessionUser, openAuthModal } from "@/lib/auth";
import { getIssueById, ISSUES_EVENT, updateIssue } from "@/lib/issues";
import type { IssueComment, SocialCluster } from "@/types/issue";
import type { User } from "@/types/user";

const defaultCluster: SocialCluster = "Pragmatic Moderates";
const inactiveStanceClasses = "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50";

function buildBridgeStatus(user: User | null) {
  return {
    cluster: user?.username ? "Civic Reformers" : defaultCluster,
  } as const;
}

export default function IssueDetailPage() {
  const params = useParams<{ id: string }>();
  const issueId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [commentStance, setCommentStance] = useState<"for" | "against">("for");
  const [showCounterPerspective, setShowCounterPerspective] = useState(false);
  const [tick, setTick] = useState(0);

  const issue = useMemo(() => (issueId ? getIssueById(issueId) : null), [issueId, tick]);
  const bridgeStatus = useMemo(() => buildBridgeStatus(currentUser), [currentUser]);
  const groupedComments = useMemo(
    () => ({
      for: issue?.comments.filter((comment) => comment.stance === "for") ?? [],
      against: issue?.comments.filter((comment) => comment.stance === "against") ?? [],
    }),
    [issue],
  );

  useEffect(() => {
    function syncUser() {
      setCurrentUser(getSessionUser());
    }

    function syncIssue() {
      setTick((current) => current + 1);
    }

    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener(AUTH_EVENT, syncUser);
    window.addEventListener(ISSUES_EVENT, syncIssue);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener(AUTH_EVENT, syncUser);
      window.removeEventListener(ISSUES_EVENT, syncIssue);
    };
  }, []);

  function handleVote(direction: "up" | "down") {
    if (!issueId) {
      return;
    }

    updateIssue(issueId, (current) => {
      if (direction === "up") {
        return {
          ...current,
          upvotes: current.upvotes + 1,
          supporterCount: current.supporterCount + 1,
          consensusScore: Math.min(99, current.consensusScore + 1),
          opposingViewSupport: Math.min(95, current.opposingViewSupport + 0.5),
        };
      }

      return {
        ...current,
        downvotes: current.downvotes + 1,
        consensusScore: Math.max(0, current.consensusScore - 1),
        opposingViewSupport: Math.max(5, current.opposingViewSupport - 0.5),
      };
    });
  }

  function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser) {
      openAuthModal("signin");
      return;
    }

    const body = commentBody.trim();
    if (!body || !issueId) {
      return;
    }

    updateIssue(issueId, (current) => ({
      ...current,
      comments: [
        {
          id: crypto.randomUUID(),
          author: currentUser.username,
          cluster: bridgeStatus.cluster,
          stance: commentStance,
          body,
          createdAt: "Just now",
        },
        ...current.comments,
      ],
      commentCount: current.commentCount + 1,
    }));

    setCommentBody("");
    setCommentStance("for");
  }

  if (!issue) {
    return (
      <div className="space-y-6">
        <AuthModal />
        <Card className="border-slate-200/80 bg-white/90">
          <CardContent className="p-8">
            <div className="text-lg font-semibold text-slate-900">Post not found</div>
            <p className="mt-2 text-sm text-slate-600">This thread could not be loaded.</p>
            <a
              href="/"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to feed
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <AuthModal />

      <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_52%,#38bdf8_100%)] px-6 py-8 text-white shadow-[0_35px_90px_-45px_rgba(15,23,42,0.8)] sm:px-8 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(147,197,253,0.24),transparent_22%)]" />
        <div className="relative space-y-4">
          <a
            href="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to feed
          </a>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="bg-white/15 text-white">
              {issue.category}
            </Badge>
            <Badge variant="secondary" className="bg-white/15 text-white">
              {issue.community}
            </Badge>
            <div className="text-sm text-blue-100">
              Posted by {issue.author} • {issue.createdAt}
            </div>
          </div>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">{issue.title}</h1>
          <p className="max-w-4xl text-base leading-8 text-blue-50/90 sm:text-lg">{issue.body}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.78fr]">
        <div className="space-y-6">
          <Card className="border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
            <CardHeader>
              <CardTitle className="text-2xl">Thread interaction</CardTitle>
              <CardDescription>Vote, follow, and inspect the bridge signals behind this post.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => handleVote("up")}>
                  <ArrowBigUp className="h-4 w-4" />
                  {issue.upvotes}
                </Button>
                <Button variant="outline" onClick={() => handleVote("down")}>
                  <ArrowBigDown className="h-4 w-4" />
                  {issue.downvotes}
                </Button>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                  <Users2 className="h-4 w-4" />
                  {issue.supporterCount} following
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
                  Consensus {issue.consensusScore}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Bridge Meter</div>
                    <div className="mt-1 text-sm font-medium text-slate-700">
                      {issue.opposingViewSupport}% of agreement comes from opposing clusters
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{issue.consensusScore}/100</div>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#f97316_0%,#fb7185_35%,#38bdf8_100%)]"
                    style={{ width: `${issue.opposingViewSupport}%` }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  {issue.clusterMix.map((entry) => (
                    <span key={entry.cluster} className="rounded-full bg-white px-3 py-1 shadow-sm">
                      {entry.cluster}: {entry.support}%
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowCounterPerspective((current) => !current)}
                  className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  {showCounterPerspective ? "Hide Counter-Perspective" : "View Counter-Perspective"}
                </button>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                  <MessageSquare className="h-4 w-4" />
                  {issue.commentCount} comments
                </div>
              </div>

              {showCounterPerspective ? (
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">
                    Counter-perspective from {issue.counterPerspective.cluster}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{issue.counterPerspective.author}</div>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{issue.counterPerspective.summary}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
            <CardHeader>
              <CardTitle className="text-2xl">Comments</CardTitle>
              <CardDescription>Organized into two lanes so support and critique are easy to compare.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Your stance</Label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setCommentStance("for")}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        commentStance === "for" ? "bg-emerald-600 text-white" : inactiveStanceClasses
                      }`}
                    >
                      For
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommentStance("against")}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        commentStance === "against" ? "bg-rose-600 text-white" : inactiveStanceClasses
                      }`}
                    >
                      Against
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment-body">Add a comment</Label>
                  <Textarea
                    id="comment-body"
                    value={commentBody}
                    onChange={(event) => setCommentBody(event.target.value)}
                    placeholder="Share a grounded response, critique, or bridge-building thought."
                  />
                </div>
                <Button type="submit" variant="secondary">
                  <MessageSquare className="h-4 w-4" />
                  {currentUser ? "Post comment" : "Sign in to comment"}
                </Button>
              </form>

              <div className="grid gap-5 lg:grid-cols-2">
                <CommentLane
                  title="For"
                  count={groupedComments.for.length}
                  accent="emerald"
                  comments={groupedComments.for}
                />
                <CommentLane
                  title="Against"
                  count={groupedComments.against.length}
                  accent="rose"
                  comments={groupedComments.against}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
            <CardHeader>
              <Badge variant="secondary" className="w-fit">Thread signals</Badge>
              <CardTitle className="text-xl">Why this is ranking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>Consensus Score is currently {issue.consensusScore}, which keeps this thread visible in the main feed.</p>
              <p>{issue.opposingViewSupport}% of support comes from clusters outside the post’s most likely base.</p>
              <p>Comments and votes here update the main feed because this page shares the same issue store.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function CommentLane({
  title,
  count,
  accent,
  comments,
}: {
  title: string;
  count: number;
  accent: "emerald" | "rose";
  comments: IssueComment[];
}) {
  const accentClasses = {
    emerald: {
      badge: "bg-emerald-50 text-emerald-700",
      border: "border-emerald-200",
    },
    rose: {
      badge: "bg-rose-50 text-rose-700",
      border: "border-rose-200",
    },
  };

  return (
    <div className={`rounded-[26px] border ${accentClasses[accent].border} bg-slate-50/70 p-4`}>
      <div className="flex items-center justify-between gap-3">
        <div className={`rounded-full px-3 py-1 text-sm font-semibold ${accentClasses[accent].badge}`}>{title}</div>
        <div className="text-sm text-slate-500">{count} comments</div>
      </div>
      <div className="mt-4 space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="rounded-2xl border border-white bg-white px-4 py-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="font-semibold text-slate-800">{comment.author}</span>
                <span>•</span>
                <span>{comment.cluster}</span>
                <span>•</span>
                <span>{comment.createdAt}</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-700">{comment.body}</p>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
            No {title.toLowerCase()} comments yet.
          </div>
        )}
      </div>
    </div>
  );
}
