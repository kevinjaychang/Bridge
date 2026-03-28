# Bridge Protocol

Bridge Protocol is a Next.js civic discussion prototype focused on a consensus-ranked issue feed. Users can sign in locally or with Google, publish new issue threads, vote on posts, and add comments that are organized into "for" and "against" lanes. Issue and comment data now load from Supabase when the public project env vars are configured.

## Current App Surface

- `/` renders the main consensus feed with sidebar metrics and ranked issue cards.
- `/submit` provides the dedicated thread composer for signed-in users.
- `/issues/[id]` shows the full issue view, voting controls, bridge metrics, and comments.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Supabase for issue and comment persistence
- Local browser storage for demo auth, with seeded issue fallback when Supabase is not configured

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase Setup

This repo is now prepared for a local Supabase CLI workflow:

1. Install the Supabase CLI and Docker on your machine.
2. Run `supabase start` from the repo root.
3. Apply the migration in `supabase/migrations/20260327190000_init.sql`.
4. Seed local data from `supabase/seed.sql`.
5. Copy the local API URL and anon key into `.env.local`.
6. Optional: hit `/api/health/supabase` to confirm the env is loaded.

If Supabase is not configured yet, the app falls back to the seeded local issue dataset so the frontend still works.

## Build

```bash
npx next build --webpack
```

`--webpack` is the most reliable build path in this environment.

## Repo Notes

- Auth state lives in `src/lib/auth.ts`.
- Supabase env and browser client helpers live in `src/lib/supabase/`.
- Local Supabase migration and seed files live in `supabase/migrations/` and `supabase/seed.sql`.
- Issue reads, writes, voting, comments, and local fallback behavior live in `src/lib/issues.ts`.
- Shared UI primitives live in `src/components/ui/`.
- `scripts/generate_app_summary_pdf.py` regenerates the PDF summary in `output/pdf/`.
