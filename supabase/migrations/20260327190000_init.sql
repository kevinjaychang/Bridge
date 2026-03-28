create extension if not exists pgcrypto;

create table if not exists public.issues (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  body text not null,
  community text not null,
  category text not null,
  author text not null,
  state text not null,
  created_at timestamptz not null default now(),
  upvotes integer not null default 0,
  downvotes integer not null default 0,
  comment_count integer not null default 0,
  supporter_count integer not null default 0,
  consensus_score integer not null default 0,
  opposing_view_support numeric(5,2) not null default 0,
  cluster_mix jsonb not null default '[]'::jsonb,
  counter_cluster text not null,
  counter_author text not null,
  counter_summary text not null,
  urgency_label text not null
);

create table if not exists public.issue_comments (
  id text primary key default gen_random_uuid()::text,
  issue_id text not null references public.issues(id) on delete cascade,
  author text not null,
  cluster text not null,
  stance text not null check (stance in ('for', 'against')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists issue_comments_issue_id_idx on public.issue_comments(issue_id);

alter table public.issues enable row level security;
alter table public.issue_comments enable row level security;

drop policy if exists "issues are readable" on public.issues;
create policy "issues are readable"
on public.issues for select
using (true);

drop policy if exists "issues are writable" on public.issues;
create policy "issues are writable"
on public.issues for all
using (true)
with check (true);

drop policy if exists "comments are readable" on public.issue_comments;
create policy "comments are readable"
on public.issue_comments for select
using (true);

drop policy if exists "comments are writable" on public.issue_comments;
create policy "comments are writable"
on public.issue_comments for all
using (true)
with check (true);
