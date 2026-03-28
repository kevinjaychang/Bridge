import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/utils";
import type { CounterPerspective, IssueCategory, IssueComment, IssuePost, SocialCluster } from "@/types/issue";

const ISSUES_KEY = "bridge-protocol.issues";
export const ISSUES_EVENT = "bridge-protocol-issues-changed";

export const categoryOptions: IssueCategory[] = [
  "Economy",
  "Healthcare",
  "Immigration",
  "Climate",
  "Education",
  "Technology",
];

type UrgencyLabel = IssuePost["urgencyLabel"];

type IssueRow = {
  id: string;
  title: string;
  body: string;
  community: string;
  category: string;
  author: string;
  state: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  supporter_count: number;
  consensus_score: number;
  opposing_view_support: number;
  cluster_mix: unknown;
  counter_cluster: string;
  counter_author: string;
  counter_summary: string;
  urgency_label: string;
};

type CommentRow = {
  id: string;
  issue_id: string;
  author: string;
  cluster: string;
  stance: "for" | "against";
  body: string;
  created_at: string;
};

export const initialIssues: IssuePost[] = [
  {
    id: "issue-1",
    title: "Should cities publish monthly rent dashboards before approving major rezoning plans?",
    body: "People in fast-growth neighborhoods want more housing, but they also want a public record of whether promised affordability gains are actually happening. A transparent dashboard could make zoning debates less abstract and easier to track over time.",
    community: "r/housingpolicy",
    category: "Economy",
    author: "Maya",
    state: "California",
    createdAt: "2 hours ago",
    upvotes: 184,
    downvotes: 41,
    commentCount: 63,
    supporterCount: 412,
    consensusScore: 91,
    opposingViewSupport: 68,
    comments: [
      {
        id: "comment-1",
        author: "Ari",
        cluster: "Pragmatic Moderates",
        stance: "against",
        body: "Publishing the dashboard only helps if the affordability definitions are consistent across cities; otherwise everyone argues over the numbers instead of the policy.",
        createdAt: "1 hour ago",
      },
      {
        id: "comment-2",
        author: "Nia",
        cluster: "Local Organizers",
        stance: "for",
        body: "I support the dashboard idea because local tenants need something they can point to at hearings, not just campaign promises.",
        createdAt: "32 minutes ago",
      },
    ],
    clusterMix: [
      { cluster: "Civic Reformers", support: 29 },
      { cluster: "Pragmatic Moderates", support: 27 },
      { cluster: "Institutional Skeptics", support: 24 },
      { cluster: "Local Organizers", support: 20 },
    ],
    counterPerspective: {
      cluster: "Institutional Skeptics",
      author: "Rowan",
      summary:
        "Public dashboards help, but if cities rush the metric design they can create a false sense of progress. The stronger move may be tying publication requirements to enforcement and tenant remedy timelines.",
    },
    urgencyLabel: "High urgency",
  },
  {
    id: "issue-2",
    title: "Would a nationwide preventive care credit reduce emergency room overload?",
    body: "Supporters argue that covering screenings and routine care earlier would cut downstream costs and make care feel more accessible. Critics want more evidence on how it would be funded and whether rural providers could absorb the demand.",
    community: "r/publichealth",
    category: "Healthcare",
    author: "Jonah",
    state: "Michigan",
    createdAt: "5 hours ago",
    upvotes: 132,
    downvotes: 26,
    commentCount: 48,
    supporterCount: 305,
    consensusScore: 84,
    opposingViewSupport: 59,
    comments: [
      {
        id: "comment-3",
        author: "Elena",
        cluster: "Pragmatic Moderates",
        stance: "against",
        body: "Credits sound strong on paper, but appointment supply is still a bottleneck. Without more provider capacity, people may have coverage and still wait too long.",
        createdAt: "2 hours ago",
      },
    ],
    clusterMix: [
      { cluster: "Pragmatic Moderates", support: 32 },
      { cluster: "Civic Reformers", support: 26 },
      { cluster: "Local Organizers", support: 23 },
      { cluster: "Institutional Skeptics", support: 19 },
    ],
    counterPerspective: {
      cluster: "Pragmatic Moderates",
      author: "Elena",
      summary:
        "Preventive credits could help, but they may fail if clinics still cannot add appointments. Pairing the credit with provider capacity targets might create more durable agreement.",
    },
    urgencyLabel: "Active debate",
  },
  {
    id: "issue-3",
    title: "Should public schools require AI literacy units before high school graduation?",
    body: "Teachers are seeing students use AI tools long before schools have clear guidance for research, plagiarism, and responsible use. A required literacy unit could set a baseline for both opportunity and risk.",
    community: "r/educationpolicy",
    category: "Education",
    author: "Priya",
    state: "Georgia",
    createdAt: "Today",
    upvotes: 156,
    downvotes: 38,
    commentCount: 57,
    supporterCount: 351,
    consensusScore: 79,
    opposingViewSupport: 54,
    comments: [
      {
        id: "comment-4",
        author: "Marcus",
        cluster: "Institutional Skeptics",
        stance: "against",
        body: "I agree with the goal, but districts will need ready-to-use curriculum or this turns into another mandate that widens quality gaps.",
        createdAt: "45 minutes ago",
      },
    ],
    clusterMix: [
      { cluster: "Local Organizers", support: 31 },
      { cluster: "Civic Reformers", support: 25 },
      { cluster: "Pragmatic Moderates", support: 24 },
      { cluster: "Institutional Skeptics", support: 20 },
    ],
    counterPerspective: {
      cluster: "Institutional Skeptics",
      author: "Marcus",
      summary:
        "AI literacy is necessary, but adding a graduation requirement without teacher support may widen district gaps. A phased pilot with shared curriculum could bridge more people first.",
    },
    urgencyLabel: "Policy watch",
  },
  {
    id: "issue-4",
    title: "How aggressive should the U.S. be about carbon reporting requirements for large manufacturers?",
    body: "Manufacturers say new reporting rules could be expensive in the short term, while climate advocates argue that transparent data is necessary before stronger emissions policy can work. The question is how fast regulators should move.",
    community: "r/climatepolicy",
    category: "Climate",
    author: "Luis",
    state: "Arizona",
    createdAt: "1 day ago",
    upvotes: 119,
    downvotes: 31,
    commentCount: 39,
    supporterCount: 268,
    consensusScore: 73,
    opposingViewSupport: 49,
    comments: [
      {
        id: "comment-5",
        author: "Tessa",
        cluster: "Pragmatic Moderates",
        stance: "for",
        body: "Manufacturers are more likely to cooperate if reporting phases in by sector and smaller suppliers get shared tools.",
        createdAt: "3 hours ago",
      },
    ],
    clusterMix: [
      { cluster: "Civic Reformers", support: 35 },
      { cluster: "Pragmatic Moderates", support: 28 },
      { cluster: "Institutional Skeptics", support: 21 },
      { cluster: "Local Organizers", support: 16 },
    ],
    counterPerspective: {
      cluster: "Pragmatic Moderates",
      author: "Tessa",
      summary:
        "Reporting can be valuable, but manufacturers are more likely to support it if compliance phases in by sector and if smaller suppliers get shared tooling instead of one-size-fits-all rules.",
    },
    urgencyLabel: "Active debate",
  },
];

function hasWindow() {
  return typeof window !== "undefined";
}

function emitIssuesChange() {
  if (!hasWindow()) {
    return;
  }

  window.dispatchEvent(new Event(ISSUES_EVENT));
}

function readLocalIssues() {
  if (!hasWindow()) {
    return initialIssues;
  }

  const raw = window.localStorage.getItem(ISSUES_KEY);
  if (!raw) {
    return initialIssues;
  }

  try {
    return JSON.parse(raw) as IssuePost[];
  } catch {
    return initialIssues;
  }
}

function writeLocalIssues(issues: IssuePost[]) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
  emitIssuesChange();
}

function normalizeCluster(value: string): SocialCluster {
  const allowed: SocialCluster[] = [
    "Civic Reformers",
    "Pragmatic Moderates",
    "Institutional Skeptics",
    "Local Organizers",
  ];

  return allowed.includes(value as SocialCluster) ? (value as SocialCluster) : "Pragmatic Moderates";
}

function normalizeUrgency(value: string): UrgencyLabel {
  const allowed: UrgencyLabel[] = ["High urgency", "Active debate", "Policy watch"];
  return allowed.includes(value as UrgencyLabel) ? (value as UrgencyLabel) : "Active debate";
}

function normalizeCategory(value: string): IssueCategory {
  return categoryOptions.includes(value as IssueCategory) ? (value as IssueCategory) : "Economy";
}

function normalizeClusterMix(value: unknown): IssuePost["clusterMix"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const cluster = "cluster" in entry ? normalizeCluster(String(entry.cluster)) : null;
      const support = "support" in entry ? Number(entry.support) : null;

      if (!cluster || Number.isNaN(support)) {
        return null;
      }

      return { cluster, support };
    })
    .filter((entry): entry is IssuePost["clusterMix"][number] => Boolean(entry));
}

function toCommentRow(issueId: string, comment: IssueComment): CommentRow {
  return {
    id: comment.id,
    issue_id: issueId,
    author: comment.author,
    cluster: comment.cluster,
    stance: comment.stance,
    body: comment.body,
    created_at: new Date().toISOString(),
  };
}

function toIssueRow(issue: IssuePost): IssueRow {
  return {
    id: issue.id,
    title: issue.title,
    body: issue.body,
    community: issue.community,
    category: issue.category,
    author: issue.author,
    state: issue.state,
    created_at: new Date().toISOString(),
    upvotes: issue.upvotes,
    downvotes: issue.downvotes,
    comment_count: issue.commentCount,
    supporter_count: issue.supporterCount,
    consensus_score: issue.consensusScore,
    opposing_view_support: issue.opposingViewSupport,
    cluster_mix: issue.clusterMix,
    counter_cluster: issue.counterPerspective.cluster,
    counter_author: issue.counterPerspective.author,
    counter_summary: issue.counterPerspective.summary,
    urgency_label: issue.urgencyLabel,
  };
}

function mapIssue(row: IssueRow, comments: CommentRow[]): IssuePost {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    community: row.community,
    category: normalizeCategory(row.category),
    author: row.author,
    state: row.state,
    createdAt: formatRelativeTime(row.created_at),
    upvotes: row.upvotes,
    downvotes: row.downvotes,
    commentCount: row.comment_count,
    supporterCount: row.supporter_count,
    consensusScore: row.consensus_score,
    opposingViewSupport: Number(row.opposing_view_support),
    comments: comments.map((comment) => ({
      id: comment.id,
      author: comment.author,
      cluster: normalizeCluster(comment.cluster),
      stance: comment.stance,
      body: comment.body,
      createdAt: formatRelativeTime(comment.created_at),
    })),
    clusterMix: normalizeClusterMix(row.cluster_mix),
    counterPerspective: {
      cluster: normalizeCluster(row.counter_cluster),
      author: row.counter_author,
      summary: row.counter_summary,
    },
    urgencyLabel: normalizeUrgency(row.urgency_label),
  };
}

async function seedSupabaseIssues() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return;
  }

  const { count, error } = await supabase.from("issues").select("id", { count: "exact", head: true });
  if (error || (count ?? 0) > 0) {
    return;
  }

  const issueRows = initialIssues.map(toIssueRow);
  const commentRows = initialIssues.flatMap((issue) => issue.comments.map((comment) => toCommentRow(issue.id, comment)));

  await supabase.from("issues").insert(issueRows);
  if (commentRows.length > 0) {
    await supabase.from("issue_comments").insert(commentRows);
  }
}

async function fetchSupabaseIssues() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return readLocalIssues();
  }

  await seedSupabaseIssues();

  const { data: issueRows, error: issuesError } = await supabase
    .from("issues")
    .select("*")
    .order("consensus_score", { ascending: false })
    .order("created_at", { ascending: false });

  if (issuesError || !issueRows) {
    throw issuesError ?? new Error("Issues query returned no data.");
  }

  if (issueRows.length === 0) {
    return [];
  }

  const issueIds = issueRows.map((issue) => issue.id);
  const { data: commentRows, error: commentsError } = await supabase
    .from("issue_comments")
    .select("*")
    .in("issue_id", issueIds)
    .order("created_at", { ascending: false });

  if (commentsError) {
    throw commentsError;
  }

  const commentsByIssue = new Map<string, CommentRow[]>();
  for (const comment of (commentRows ?? []) as CommentRow[]) {
    const entry = commentsByIssue.get(comment.issue_id) ?? [];
    entry.push(comment);
    commentsByIssue.set(comment.issue_id, entry);
  }

  return (issueRows as IssueRow[]).map((issue) => mapIssue(issue, commentsByIssue.get(issue.id) ?? []));
}

async function fetchSupabaseIssueById(issueId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return readLocalIssues().find((issue) => issue.id === issueId) ?? null;
  }

  const { data: issueRow, error: issueError } = await supabase.from("issues").select("*").eq("id", issueId).maybeSingle();
  if (issueError || !issueRow) {
    return null;
  }

  const { data: commentRows, error: commentsError } = await supabase
    .from("issue_comments")
    .select("*")
    .eq("issue_id", issueId)
    .order("created_at", { ascending: false });

  if (commentsError) {
    throw commentsError;
  }

  return mapIssue(issueRow as IssueRow, (commentRows ?? []) as CommentRow[]);
}

function buildIssueFromInput(input: {
  title: string;
  body: string;
  category: IssueCategory;
  state: string;
  author: string;
  clusterMix: IssuePost["clusterMix"];
  counterPerspective: CounterPerspective;
  urgencyLabel: UrgencyLabel;
}): IssuePost {
  return {
    id: crypto.randomUUID(),
    title: input.title,
    body: input.body,
    community: `r/${input.category.toLowerCase()}`,
    category: input.category,
    author: input.author,
    state: input.state,
    createdAt: "just now",
    upvotes: 1,
    downvotes: 0,
    commentCount: 0,
    supporterCount: 1,
    consensusScore: 58,
    opposingViewSupport: 41,
    comments: [],
    clusterMix: input.clusterMix,
    counterPerspective: input.counterPerspective,
    urgencyLabel: input.urgencyLabel,
  };
}

function updateLocalIssue(issueId: string, updater: (issue: IssuePost) => IssuePost) {
  const nextIssues = readLocalIssues().map((issue) => (issue.id === issueId ? updater(issue) : issue));
  writeLocalIssues(nextIssues);
  return nextIssues.find((issue) => issue.id === issueId) ?? null;
}

export async function listIssues() {
  try {
    return await fetchSupabaseIssues();
  } catch (error) {
    console.error("Falling back to local issues store.", error);
    return readLocalIssues();
  }
}

export async function getIssueById(issueId: string) {
  try {
    return await fetchSupabaseIssueById(issueId);
  } catch (error) {
    console.error("Falling back to local issue lookup.", error);
    return readLocalIssues().find((issue) => issue.id === issueId) ?? null;
  }
}

export async function createIssue(input: {
  title: string;
  body: string;
  category: IssueCategory;
  state: string;
  author: string;
  clusterMix: IssuePost["clusterMix"];
  counterPerspective: CounterPerspective;
  urgencyLabel: UrgencyLabel;
}) {
  const issue = buildIssueFromInput(input);
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    writeLocalIssues([issue, ...readLocalIssues()]);
    return issue;
  }

  try {
    const { error } = await supabase.from("issues").insert(toIssueRow(issue));
    if (error) {
      throw error;
    }

    emitIssuesChange();
    return issue;
  } catch (error) {
    console.error("Falling back to local issue creation.", error);
    writeLocalIssues([issue, ...readLocalIssues()]);
    return issue;
  }
}

export async function voteOnIssue(issueId: string, direction: "up" | "down") {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return updateLocalIssue(issueId, (issue) => {
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

  try {
    const { data: current, error: fetchError } = await supabase
      .from("issues")
      .select("upvotes, downvotes, supporter_count, consensus_score, opposing_view_support")
      .eq("id", issueId)
      .single();

    if (fetchError || !current) {
      throw fetchError ?? new Error("Issue not found.");
    }

    const payload =
      direction === "up"
        ? {
            upvotes: current.upvotes + 1,
            supporter_count: current.supporter_count + 1,
            consensus_score: Math.min(99, current.consensus_score + 1),
            opposing_view_support: Math.min(95, Number(current.opposing_view_support) + 0.5),
          }
        : {
            downvotes: current.downvotes + 1,
            consensus_score: Math.max(0, current.consensus_score - 1),
            opposing_view_support: Math.max(5, Number(current.opposing_view_support) - 0.5),
          };

    const { error: updateError } = await supabase.from("issues").update(payload).eq("id", issueId);
    if (updateError) {
      throw updateError;
    }

    emitIssuesChange();
    return await fetchSupabaseIssueById(issueId);
  } catch (error) {
    console.error("Falling back to local issue voting.", error);
    return updateLocalIssue(issueId, (issue) => {
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
}

export async function addIssueComment(input: {
  issueId: string;
  author: string;
  cluster: SocialCluster;
  stance: "for" | "against";
  body: string;
}) {
  const comment: IssueComment = {
    id: crypto.randomUUID(),
    author: input.author,
    cluster: input.cluster,
    stance: input.stance,
    body: input.body,
    createdAt: "just now",
  };

  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return updateLocalIssue(input.issueId, (issue) => ({
      ...issue,
      comments: [comment, ...issue.comments],
      commentCount: issue.commentCount + 1,
    }));
  }

  try {
    const { data: current, error: fetchError } = await supabase
      .from("issues")
      .select("comment_count")
      .eq("id", input.issueId)
      .single();

    if (fetchError || !current) {
      throw fetchError ?? new Error("Issue not found.");
    }

    const { error: insertError } = await supabase.from("issue_comments").insert({
      id: comment.id,
      issue_id: input.issueId,
      author: comment.author,
      cluster: comment.cluster,
      stance: comment.stance,
      body: comment.body,
    });
    if (insertError) {
      throw insertError;
    }

    const { error: updateError } = await supabase
      .from("issues")
      .update({ comment_count: current.comment_count + 1 })
      .eq("id", input.issueId);
    if (updateError) {
      throw updateError;
    }

    emitIssuesChange();
    return await fetchSupabaseIssueById(input.issueId);
  } catch (error) {
    console.error("Falling back to local comment storage.", error);
    return updateLocalIssue(input.issueId, (issue) => ({
      ...issue,
      comments: [comment, ...issue.comments],
      commentCount: issue.commentCount + 1,
    }));
  }
}
