# Bridge Protocol

Bridge Protocol is a Next.js civic discussion prototype focused on a consensus-ranked issue feed. Users can sign in locally or with Google, publish new issue threads, vote on posts, and add comments that are organized into "for" and "against" lanes.

## Current App Surface

- `/` renders the main consensus feed with sidebar metrics and ranked issue cards.
- `/submit` provides the dedicated thread composer for signed-in users.
- `/issues/[id]` shows the full issue view, voting controls, bridge metrics, and comments.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Local browser storage for demo auth and issue persistence

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npx next build --webpack
```

`--webpack` is the most reliable build path in this environment.

## Repo Notes

- Auth state lives in `src/lib/auth.ts`.
- Seeded issues and issue persistence live in `src/lib/issues.ts`.
- Shared UI primitives live in `src/components/ui/`.
- `scripts/generate_app_summary_pdf.py` regenerates the PDF summary in `output/pdf/`.
