"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, LockKeyhole, PlusSquare } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AUTH_EVENT, getSessionUser, openAuthModal } from "@/lib/auth";
import { categoryOptions, getStoredIssues, saveIssues } from "@/lib/issues";
import type { IssueCategory, SocialCluster } from "@/types/issue";
import type { User } from "@/types/user";

const emptyForm = {
  title: "",
  body: "",
  category: "Economy" as IssueCategory,
  state: "",
};

const defaultCluster: SocialCluster = "Pragmatic Moderates";

function buildBridgeStatus(user: User | null) {
  return {
    cluster: user?.username ? "Civic Reformers" : defaultCluster,
  } as const;
}

export default function SubmitPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const bridgeStatus = useMemo(() => buildBridgeStatus(currentUser), [currentUser]);

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser) {
      openAuthModal("signin");
      return;
    }

    const title = form.title.trim();
    const body = form.body.trim();
    const state = form.state.trim();

    if (!title || !body || !state) {
      return;
    }

    const issue = {
      id: crypto.randomUUID(),
      title,
      body,
      community: `r/${form.category.toLowerCase()}`,
      category: form.category,
      author: currentUser.username,
      state,
      createdAt: "Just now",
      upvotes: 1,
      downvotes: 0,
      commentCount: 0,
      supporterCount: 1,
      consensusScore: 58,
      opposingViewSupport: 41,
      comments: [],
      clusterMix: [
        { cluster: bridgeStatus.cluster, support: 38 },
        { cluster: "Pragmatic Moderates" as SocialCluster, support: 24 },
        { cluster: "Institutional Skeptics" as SocialCluster, support: 20 },
        { cluster: "Local Organizers" as SocialCluster, support: 18 },
      ],
      counterPerspective: {
        cluster: "Institutional Skeptics" as SocialCluster,
        author: "Auto-linked counterpoint",
        summary:
          "This idea could be stronger if it spells out costs, implementation guardrails, and how success would be measured across people who disagree with it today.",
      },
      urgencyLabel: "Active debate" as const,
    };

    saveIssues([issue, ...getStoredIssues()]);
    setForm(emptyForm);
    setSubmitted(true);
  }

  return (
    <div className="space-y-8 pb-10">
      <AuthModal />

      <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_48%,#38bdf8_100%)] px-6 py-8 text-white shadow-[0_35px_90px_-45px_rgba(15,23,42,0.8)] sm:px-8 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(125,211,252,0.25),transparent_22%)]" />
        <div className="relative space-y-5">
          <Badge className="w-fit bg-white/15 text-sky-50 backdrop-blur" variant="secondary">
            Dedicated submit page
          </Badge>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Start a new bridge thread from a dedicated posting workflow.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-sky-100 sm:text-lg">
              Draft the issue, choose the topic cluster, and publish it back into the consensus-ranked home feed.
            </p>
          </div>
          <a
            href="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to feed
          </a>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.75fr]">
        <Card className="border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
          <CardHeader>
            <Badge variant="secondary" className="w-fit">Compose thread</Badge>
            <CardTitle className="text-2xl">Create post</CardTitle>
            <CardDescription>
              {currentUser
                ? `Posting as ${currentUser.username}${currentUser.authProvider === "google" ? " with Google" : ""}.`
                : "Sign in to publish a thread into the consensus feed."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!currentUser ? (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Posting is locked until a user signs in.
                <button
                  type="button"
                  onClick={() => openAuthModal("signin")}
                  className="ml-2 font-semibold text-amber-950 underline decoration-amber-400 underline-offset-4"
                >
                  Open sign-in
                </button>
              </div>
            ) : null}

            {submitted ? (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                Thread published. It is now available in the home feed.
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Issue title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(event) => {
                    setSubmitted(false);
                    setForm((current) => ({ ...current, title: event.target.value }));
                  }}
                  placeholder="What issue should the community debate next?"
                  disabled={!currentUser}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    id="category"
                    value={form.category}
                    onChange={(event) => {
                      setSubmitted(false);
                      setForm((current) => ({ ...current, category: event.target.value as IssueCategory }));
                    }}
                    disabled={!currentUser}
                  >
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(event) => {
                      setSubmitted(false);
                      setForm((current) => ({ ...current, state: event.target.value }));
                    }}
                    placeholder="Pennsylvania"
                    disabled={!currentUser}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Thread text</Label>
                <Textarea
                  id="body"
                  value={form.body}
                  onChange={(event) => {
                    setSubmitted(false);
                    setForm((current) => ({ ...current, body: event.target.value }));
                  }}
                  placeholder="Lay out the problem, what should change, and why the issue matters right now."
                  disabled={!currentUser}
                />
              </div>

              <Button type="submit" variant="secondary" className="w-full" disabled={!currentUser}>
                <PlusSquare className="h-4 w-4" />
                {currentUser ? "Publish issue" : "Sign in to publish"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
            <CardHeader>
              <Badge variant="secondary" className="w-fit">Posting guide</Badge>
              <CardTitle className="text-xl">What helps a thread travel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>Use one clear thesis in the title so the issue is easy to rank and debate.</p>
              <p>Explain the tradeoff, not just the grievance, so opposing clusters have something specific to engage.</p>
              <p>Specific local context improves the chance of earning a stronger Bridge Meter.</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
            <CardHeader>
              <Badge variant="secondary" className="w-fit">Bridge reminder</Badge>
              <CardTitle className="text-xl">Consensus matters more than heat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>New posts enter the feed with a starting consensus score and rise as broader clusters agree.</p>
              <p>Threads that only energize one cluster are less likely to lead the default feed.</p>
              <p>Use the home page to monitor counter-perspectives after you publish.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
