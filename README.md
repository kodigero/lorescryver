# LoreScryver

A commercial SaaS web authoring platform for fiction writers — from concept to post-publishing.

## Tech Stack

- **Framework:** Next.js 15 + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Signed cookie sessions
- **Editor:** Tiptap (ProseMirror)
- **AI:** Vercel AI SDK
- **Styling:** Tailwind CSS + shadcn/ui
- **Deployment:** Docker on Hetzner

## Pipeline Phases

1. **Ideation & Worldbuilding** — Mind maps, mood boards, series bibles, snowflake method templates
2. **Drafting** — Distraction-free editor with AI assist, chapter management, word count goals
3. **Editing & Polish** — AI-powered style analysis, beta reader management, revision tracking
4. **Compilation & Formatting** — EPUB/PDF export, chapter themes, table of contents generation
5. **Publishing & Monetization** — Royal Road integration, KDP prep, stub management, Patreon funnel tools

## Getting Started

```bash
npm install
npm run dev
```

For local Docker development, set `DB_PASSWORD` in `.env`; Compose fails fast if it is missing.

## Deployment

```bash
docker compose up -d
```

## Current Handoff

See [docs/CLAUDE_COWORK_TAKEOVER.md](docs/CLAUDE_COWORK_TAKEOVER.md) for the current PR status, production secret assumptions, validation results, and recommended next work.
