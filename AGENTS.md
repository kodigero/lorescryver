# AGENTS.md — LoreScryver AI Development Constitution

> **Version:** 1.1.0 | **Last Updated:** June 16, 2026
> **Author:** AC Kodigero | **Enforced By:** All AI development platforms
>
> This document is the **single source of truth** for how AI development partners
> should behave when working on the LoreScryver project. Every AI platform
> (Claude Cowork, OpenAI Codex, Google Gemini/Antigravity, Cursor, Windsurf,
> or any future tool) MUST read and follow this constitution.

---

## 1. Project Identity

- **Name:** LoreScryver
- **Tagline:** From Concept to Post-Publishing
- **AI Brand:** "Scryve" — the in-app AI assistant
- **Owner:** AC Kodigero (`kodigero` on GitHub)
- **Repository:** `github.com/kodigero/lorescryver`
- **Source of Truth:** GitHub `main` branch
- **License:** Proprietary (do NOT open-source anything without explicit permission)

### Vision
LoreScryver is a **commercial SaaS authoring platform** for fiction writers. It is
**IP-first and media-agnostic** — the core concept is a "Story Foundation" (characters,
world, plot, themes) that can be adapted to multiple delivery formats (novel,
screenplay, comic/manga, game narrative).

### Current Stage
Early development (v0.1.0). Only the Summary wizard, Staging/Brainstorm, and auth
flows are functional. Most pipeline phases are stubs.

---

## 2. Source of Truth Workflow

```
GitHub main branch → ALWAYS pull before starting work
                   → ALWAYS push when done
                   → NEVER work on stale code
```

### Rules
1. **Always check the current state of `main`** before starting any work.
2. **Never assume the codebase matches your last session.** Other AI platforms or the
   owner may have made changes.
3. **Commit frequently** with clear, conventional commit messages.
4. **Never force-push** to `main`.
5. **Create feature branches** for large changes; merge via PR when possible.

### Commit Message Convention
```
type(scope): description

# Types: feat, fix, refactor, docs, style, test, chore, ci, perf
# Scope: auth, api, dashboard, scryve, prisma, deploy, ui, etc.

# Examples:
feat(scryve): add rate limiting to AI endpoints
fix(auth): constant-time token comparison in middleware
refactor(ui): extract shared icon components
docs: update README tech stack to match reality
```

---

## 3. Architecture Principles

### Tech Stack (Current Reality — NOT Aspirational)
| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 15 (App Router) | TypeScript strict mode |
| Database | PostgreSQL + Prisma ORM | Schema in `prisma/schema.prisma` |
| Auth | Custom signed cookie sessions | HMAC-SHA256 tokens, PBKDF2 passwords |
| AI | DeepSeek via raw fetch | `src/lib/deepseek.ts` |
| Styling | Tailwind CSS v3 | CSS custom properties for theming |
| Deployment | Docker + Caddy on Hetzner | CI/CD via GitHub Actions |
| Cache/Sessions | Redis 7 | Rate limiting, session store |
| Runtime | Node.js 20 | Pinned in CI, Dockerfile, and `package.json` engines |

### Key Architecture Rules
1. **Server Components by default.** Only use `'use client'` when you need
   interactivity, browser APIs, or React hooks.
2. **Prisma is the single data access layer.** Never raw SQL unless Prisma can't
   express the query.
3. **All API input MUST be validated with Zod.** No exceptions. Schemas live in
   `src/lib/validation.ts`.
4. **Auth checks are mandatory** on every API route that accesses user data.
   Use `getCurrentUser()` from `@/lib/auth`.
5. **The dashboard uses section-based navigation** within a single project page
   (`/dashboard/project/[id]`), NOT separate pages per section.

### File Organization
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth pages (login, register)
│   ├── (dashboard)/        # Dashboard layout + pages
│   └── api/                # API routes
├── components/
│   ├── icons.tsx           # Shared icon components (DO NOT duplicate)
│   ├── ui/                 # Reusable primitives (Button, Modal, Input, etc.)
│   ├── sections/           # Dashboard section components
│   └── [feature]/          # Feature-specific components
├── contexts/               # React contexts
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities, auth, validation, AI client
├── services/               # Business logic services
├── styles/                 # Global CSS
└── types/                  # TypeScript type definitions
```

---

## 4. Coding Standards

### TypeScript
- **Strict mode is mandatory.** Never add `// @ts-ignore` or `// @ts-expect-error`
  without a comment explaining why.
- **No `any` type.** Use `unknown` and narrow, or define proper interfaces.
- **Types MUST align with Prisma schema.** When in doubt, derive types from Prisma:
  ```typescript
  import type { Project } from '@prisma/client';
  ```
- **Do NOT define duplicate interfaces.** If a type exists in `src/types/`, use it.
  If it doesn't exist and should, create it there.

### React / Next.js
- **Component size limit: ~200 lines.** If a component exceeds this, split it.
- **No inline SVG icon components.** Import from the shared icons module.
- **All modals must have:** `role="dialog"`, `aria-modal="true"`, focus trapping,
  Escape to close.
- **All interactive elements must be keyboard-accessible.** No `<div onClick>`
  without `role="button"`, `tabIndex={0}`, and `onKeyDown`.
- **Use CSS custom properties for colors.** Never hardcode `hsl(...)` values inline.
  Use the design tokens from `globals.css`.

### API Routes
- **Consistent response shape:**
  ```typescript
  // Success
  NextResponse.json({ data: result })
  // or for mutations:
  NextResponse.json({ data: result }, { status: 201 })

  // Error
  NextResponse.json({ error: "Human-readable message" }, { status: 4xx/5xx })
  ```
- **Always validate input** before any database or AI call.
- **Always verify resource ownership** before CRUD operations.
- **Never expose internal error details** to the client in production.

### Styling
- **Tailwind CSS** for all styling. No inline `style={{}}` unless absolutely necessary.
- **Use the CSS variable system** (`bg-background`, `text-foreground`, etc.) —
  NOT hardcoded colors.
- **Dark mode support is required.** Use the `.dark` class-based approach.
- **Mobile-responsive** is required for all user-facing pages.

---

## 5. AI Platform Response Guidelines

### How to Communicate
1. **Be concise.** Don't repeat what the code says — explain *why*.
2. **Never show code snippets from a file that needs editing.** Always provide
   the **complete file contents** so the owner can copy-paste the entire thing.
   The owner should never have to search for which line to replace.
3. **Don't bother the owner with code internals.** Complete the action until the
   results are visible. Show outcomes, not implementation details.
4. **One question at a time.** Never ask multiple questions in a single message.
   Each question should be answerable with a single word.
5. **Be direct.** Don't ask vague or open-ended questions.
6. **Don't ask questions with obvious answers.**
7. **Use he/him or she/her for individuals.** Only use they/their for groups
   or organizations.
8. **Use markdown formatting** — headers, tables, code blocks.
9. **Link to files** when referencing code.

### What to Do
- ✅ Check GitHub `main` for the latest state before starting.
- ✅ Read `AGENTS.md` (this file) at the start of every session.
- ✅ Read relevant existing code before modifying it.
- ✅ Run `npm run lint` and `npx tsc --noEmit` after making changes.
- ✅ Commit with conventional commit messages.
- ✅ Update documentation when changing behavior.
- ✅ Preserve existing comments and docstrings unrelated to your changes.
- ✅ Create or update tests when adding/modifying logic.
- ✅ Ask when unsure — especially about product decisions, pricing, UX.
- ✅ Always provide full file contents when the owner needs to manually edit.

### What NOT to Do
- ❌ **Never change the owner's product vision** without explicit approval.
- ❌ **Never remove features** without asking (even "dead" code may be planned).
- ❌ **Never install new major dependencies** without asking first.
- ❌ **Never change the auth system architecture** without approval.
- ❌ **Never modify pricing, plan names, or feature gating** without approval.
- ❌ **Never add `console.log` for debugging** — use proper error handling.
- ❌ **Never skip validation** — all user input goes through Zod.
- ❌ **Never use `any` type** — define proper types.
- ❌ **Never duplicate code** — extract to shared modules.
- ❌ **Never hardcode secrets, URLs, or environment-specific values.**
- ❌ **Never commit `.env` files** or expose secrets in code.
- ❌ **Never force-push to `main`.**
- ❌ **Never give partial code snippets** when a full file replacement is needed.

---

## 6. Forbidden Actions (Hard Rules)

These are **non-negotiable**. Breaking these requires stopping and asking the owner.

| Rule | Reason |
|------|--------|
| Do not change the database schema without asking | Schema changes affect production data |
| Do not change auth/security mechanisms without asking | Security-critical |
| Do not change the AI provider or model without asking | Cost and quality implications |
| Do not change deployment infrastructure without asking | Production stability |
| Do not change the "Scryve" branding or UX without asking | Product identity |
| Do not add paid/premium dependencies without asking | Budget control |
| Do not delete planning docs or design artifacts | Historical record |
| Do not remove `.gitkeep` from placeholder dirs without asking | May indicate planned features |

---

## 7. Environment & Setup

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (via Docker or local)
- Redis (via Docker or local)

### Local Development
```bash
# 1. Clone and install
git clone https://github.com/kodigero/lorescryver.git
cd lorescryver
npm ci

# 2. Environment
cp .env.example .env
# Edit .env with your values

# 3. Database + Redis
docker compose up -d db redis  # Start Postgres and Redis
npx prisma migrate deploy      # Run migrations
npx prisma generate            # Generate client

# 4. Run
npm run dev
```

### Essential Commands
```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run lint          # ESLint check
npm run typecheck     # Type check
npm run test          # Run tests (Vitest)
npx prisma studio     # Database GUI
npx prisma migrate dev --name <name>  # Create migration
npm run format        # Format with Prettier
```

---

## 8. Key Domain Terminology

| Term | Meaning |
|------|---------|
| **Story Foundation** | The media-agnostic core: premise, characters, world, plot, themes |
| **Delivery Layer** | Media-specific output adapters: Novel, Screenplay, Comic, etc. |
| **Scryve** | The AI assistant brand name. "Scryving" = AI-assisted writing |
| **Staging** | The brainstorming/ideation space where concepts are developed with AI |
| **Bible / Story Bible** | The reference document for a story's world, characters, rules |
| **Summary Wizard** | The guided flow that builds a story concept step-by-step |
| **Concept** | A staging-area idea being developed (has phases: concept, candidate, canon) |
| **Pipeline** | The full authoring workflow: Ideate → Draft → Edit → Compile → Publish |
| **Section** | A part of the project workspace (Summary, Atlas, Bible, Editor, etc.) |

---

## 9. Known Limitations & Technical Debt

> This section should be kept current by any AI platform making changes.

### Current Known Issues (as of June 16, 2026)
1. Most pipeline phases are stubs (Bible, Editor, Compile, Review, Publish)
2. Global Scryve panel uses simulated responses (not real AI)
3. No error/loading boundaries in the app
4. Dashboard is not mobile-responsive
5. Some monolith components exceed 200 lines

### Recently Resolved
- ✅ Session revocation — Redis-based session tracking added
- ✅ Rate limiting — Redis-based sliding window on auth + AI endpoints
- ✅ Tests — Vitest configured with initial validation test suite
- ✅ Icon duplication — Replaced with lucide-react imports
- ✅ Type definitions — Prisma enums now used for project types, phases, stages

### Placeholder Directories (Planned Features)
- `src/components/bible/` — Story Bible feature
- `src/components/editor/` — Chapter editor (Tiptap)
- `src/components/ideation/` — Ideation tools
- `src/components/publish/` — Publishing pipeline

---

## 10. Multi-Platform Coordination

Since multiple AI platforms work on this project:

1. **GitHub is the coordination point.** Always pull before working, push when done.
2. **This file (`AGENTS.md`) is the shared constitution.** All platforms follow it.
3. **Each platform should note its contributions** in commit messages.
4. **If two platforms conflict on approach**, the owner (AC Kodigero) decides.

---

> *This constitution is a living document. Update it when the project evolves,
> but NEVER remove rules without the owner's explicit approval.*
