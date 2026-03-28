"use client";

import { useState } from "react";
import { ArrowBigDown, ArrowBigUp, ArrowRightLeft, Flame, MapPin, MessageSquare, Users2 } from "lucide-react";
import MarkdownContent, { getMarkdownPreview } from "@/components/content/MarkdownContent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { IssuePost } from "@/types/issue";

interface IssueCardProps {
  issue: IssuePost;
  onVote: (issueId: string, direction: "up" | "down") => void;
}

const urgencyVariant: Record<IssuePost["urgencyLabel"], "success" | "warning" | "secondary"> = {
  "High urgency": "warning",
  "Active debate": "secondary",
  "Policy watch": "success",
};

export default function IssueCard({ issue, onVote }: IssueCardProps) {
  const score = issue.upvotes - issue.downvotes;
  const [showCounterPerspective, setShowCounterPerspective] = useState(false);
  const topClusters = issue.clusterMix.slice(0, 3);
  const previewMarkdown = getMarkdownPreview(issue.body);

  return (
    <Card className="overflow-hidden rounded-[24px] border-slate-200/80 bg-white shadow-[0_18px_40px_-30px_rgba(15,23,42,0.3)]">
      <div className="flex flex-col sm:flex-row">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 sm:w-[78px] sm:flex-col sm:justify-start sm:border-b-0 sm:border-r">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVote(issue.id, "up")}
            className="h-9 w-9 rounded-xl text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <ArrowBigUp className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <div className="text-base font-semibold text-slate-900">{score}</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Score</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVote(issue.id, "down")}
            className="h-9 w-9 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-700"
          >
            <ArrowBigDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-w-0 flex-1">
          <CardHeader className="space-y-3 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{issue.category}</Badge>
              <Badge variant={urgencyVariant[issue.urgencyLabel]}>{issue.urgencyLabel}</Badge>
              <div className="inline-flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {issue.state}
              </div>
              <div className="text-xs text-slate-500">{issue.community}</div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                  <Flame className="h-3.5 w-3.5" />
                  Consensus {issue.consensusScore}
                </div>
                <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Feed rank</div>
              </div>
              <a href={`/issues/${issue.id}`} className="block transition hover:opacity-85">
                <h2 className="text-lg font-semibold leading-snug text-slate-950">{issue.title}</h2>
              </a>
              <p className="text-xs text-slate-500">
                Posted by <span className="font-medium text-slate-700">{issue.author}</span> · {issue.createdAt}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-3.5">
            <a href={`/issues/${issue.id}`} className="block transition hover:opacity-90">
              <MarkdownContent markdown={previewMarkdown} compact className="line-clamp-4 text-sm" />
            </a>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Cross-community support</div>
                <div className="text-xs font-semibold text-slate-900">{issue.opposingViewSupport}% outside-core support</div>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#f97316_0%,#fb7185_35%,#38bdf8_100%)]"
                  style={{ width: `${issue.opposingViewSupport}%` }}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-slate-500">
                {topClusters.map((entry) => (
                  <span key={entry.cluster} className="rounded-full bg-white px-2.5 py-1 shadow-sm">
                    {entry.cluster}: {entry.support}%
                  </span>
                ))}
              </div>
            </div>

            {showCounterPerspective ? (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-3 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-500">
                  Other viewpoint from {issue.counterPerspective.cluster}
                </div>
                <div className="mt-1.5 text-sm font-semibold text-slate-900">{issue.counterPerspective.author}</div>
                <p className="mt-1.5 text-sm leading-6 text-slate-700">{issue.counterPerspective.summary}</p>
              </div>
            ) : null}
          </CardContent>

          <CardFooter className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/80">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <div className="inline-flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                {issue.commentCount} comments
              </div>
              <div className="inline-flex items-center gap-1.5">
                <Users2 className="h-4 w-4" />
                {issue.supporterCount} following
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`/issues/${issue.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Open thread
              </a>
              <button
                type="button"
                onClick={() => setShowCounterPerspective((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-2 text-xs font-medium text-indigo-700 transition hover:bg-indigo-50"
              >
                <ArrowRightLeft className="h-4 w-4" />
                {showCounterPerspective ? "Hide other viewpoint" : "View other viewpoint"}
              </button>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700">
                <Flame className="h-3.5 w-3.5" />
                Consensus-ranked thread
              </div>
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
