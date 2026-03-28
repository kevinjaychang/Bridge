import type { IssueCategory, IssuePost } from "@/types/issue";

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

export function getStoredIssues(): IssuePost[] {
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

export function saveIssues(issues: IssuePost[]) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
  emitIssuesChange();
}

export function updateIssue(issueId: string, updater: (issue: IssuePost) => IssuePost) {
  const nextIssues = getStoredIssues().map((issue) => (issue.id === issueId ? updater(issue) : issue));
  saveIssues(nextIssues);
}

export function getIssueById(issueId: string) {
  return getStoredIssues().find((issue) => issue.id === issueId) ?? null;
}
