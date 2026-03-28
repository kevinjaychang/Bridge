export type IssueCategory = "Economy" | "Healthcare" | "Immigration" | "Climate" | "Education" | "Technology";
export type SocialCluster = "Civic Reformers" | "Pragmatic Moderates" | "Institutional Skeptics" | "Local Organizers";

export interface CounterPerspective {
  cluster: SocialCluster;
  author: string;
  summary: string;
}

export interface IssueComment {
  id: string;
  author: string;
  cluster: SocialCluster;
  stance: "for" | "against";
  body: string;
  createdAt: string;
}

export interface IssuePost {
  id: string;
  title: string;
  body: string;
  community: string;
  category: IssueCategory;
  author: string;
  state: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  supporterCount: number;
  consensusScore: number;
  opposingViewSupport: number;
  comments: IssueComment[];
  clusterMix: Array<{
    cluster: SocialCluster;
    support: number;
  }>;
  counterPerspective: CounterPerspective;
  urgencyLabel: "High urgency" | "Active debate" | "Policy watch";
}
