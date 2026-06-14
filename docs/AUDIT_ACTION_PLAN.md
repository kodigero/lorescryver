# LoreScryver — Project Audit & Action Plan

**Date:** June 14, 2026  
**Audited by:** Claude (Cowork)  
**Scope:** Full codebase audit — backend, frontend, infrastructure, CI/CD, database

---

## Current Remediation Status

The audit remediation work is implemented on branch `codex/audit-remediation-hardening` and opened as draft PR #1:

https://github.com/kodigero/lorescryver/pull/1

For takeover context, production secret assumptions, validation results, and remaining next steps, see:

`docs/CLAUDE_COWORK_TAKEOVER.md`

The issue list below is the original audit baseline. It is intentionally preserved for historical context and should be read together with the takeover document.

---

## Summary

| Severity | Count | Description |
|----------|-------|-------------|
| Critical | 6 | App-breaking bugs or security holes |
| High | 10 | Functional gaps or code quality risks |
| Medium | 10 | Polish and robustness improvements |
| Low | 7 | Cleanup and optimization |
| **Total** | **33** | |

---

## Critical (Fix Immediately)

### C1 — No authentication — hardcoded test user everywhere
- **Type:** Security
- **Files:** `src/lib/auth.ts`, all API routes
- **Issue:** Every route uses `getTestUser()` which always returns the same hardcoded user (`test@lorescryver.com`). `src/lib/auth.ts` is a stub that exports nothing. Any unauthenticated request can read/write/delete any data.
- **Fix:** Acceptable during solo dev. Must implement NextAuth.js or custom JWT auth before any beta launch.
- **Priority:** Before public access.

### C2 — useState misused as useEffect on dashboard
- **Type:** Bug
- **File:** `src/app/(dashboard)/dashboard/page.tsx`
- **Issue:** `useState(() => { fetch('/api/projects')... })` is used as a side-effect initializer. `useState`'s initializer runs during the render phase, not as an effect. This causes the fetch to fire during SSR/render, ignores cleanup, and will re-run unpredictably.
- **Fix:** Move the fetch call into a `useEffect` hook. Quick 2-line change.
- **Priority:** Immediate.

### C3 — start.sh runs both migrate deploy AND db push
- **Type:** Infrastructure
- **File:** `start.sh`
- **Issue:** `prisma db push` can destructively alter the schema and conflicts with `prisma migrate deploy`. Running both on every container start is dangerous in production.
- **Fix:** Remove `prisma db push --skip-generate` from `start.sh`. Use it only as a manual dev command. Keep only `prisma migrate deploy` for production.
- **Priority:** Immediate.

### C4 — Default DB password "changeme" in docker-compose
- **Type:** Security
- **File:** `docker-compose.yml`, `deploy/docker-compose.prod.yml`
- **Issue:** `${DB_PASSWORD:-changeme}` means if the env var is unset, Postgres runs with a known password.
- **Fix:** Remove the default value. The container should fail fast if `DB_PASSWORD` is not set.
- **Priority:** Before any public deployment.

### C5 — SSH key hardcoded in setup script
- **Type:** Security
- **File:** `deploy/setup.sh`
- **Issue:** Public SSH key is committed to source control. If the repo was ever public, the key fingerprint is exposed.
- **Fix:** Move SSH key to a GitHub secret. Pass as env var during setup.
- **Priority:** Before making repo public.

### C6 — AI response written directly to DB without key validation
- **Type:** Security
- **File:** `src/app/api/scryve/consolidate/route.ts`
- **Issue:** The LLM's JSON response is `JSON.parse()`d and each key-value pair is written directly into `ProjectSection`. If the model returns unexpected keys, arbitrary section keys are created in the database.
- **Fix:** Validate returned keys against an allowlist: `summary.main_characters`, `summary.scope`, `summary.main_conflict`, `summary.outline_overview`, `summary.synopsis`.
- **Priority:** Immediate.

---

## High (Fix Soon)

### H1 — No CI quality gates — pushes go straight to prod
- **Type:** CI/CD
- **File:** `.github/workflows/deploy.yml`
- **Issue:** No lint, type-check, or test steps before deploy. A push to `main` goes straight to production with zero quality gates.
- **Fix:** Add `npm run lint`, `npx tsc --noEmit`, and `npm run build` steps before the deploy step in the workflow.

### H2 — Duplicate Prisma clients (prisma.ts vs db.ts)
- **Type:** Backend
- **Files:** `src/lib/prisma.ts`, `src/lib/db.ts`
- **Issue:** Two separate files export separate PrismaClient instances. Routes import from `prisma.ts`; `db.ts` is unused but creates a risk of connection pool exhaustion if both are imported.
- **Fix:** Delete `src/lib/db.ts`. Use `src/lib/prisma.ts` everywhere.

### H3 — No try/catch on project API routes
- **Type:** Backend
- **Files:** `src/app/api/projects/route.ts`, `src/app/api/projects/[id]/route.ts`
- **Issue:** Prisma failures produce unhandled 500s with raw stack traces. The Scryve routes have try/catch — inconsistent pattern.
- **Fix:** Wrap all route handlers in try/catch blocks. Return structured JSON errors with appropriate status codes.

### H4 — Auth pages are non-functional (no submit handlers)
- **Type:** Frontend
- **Files:** `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`
- **Issue:** Both forms have no `onSubmit` handler, no validation, no error display, no loading state. The submit buttons do nothing.
- **Fix:** Either wire up auth (when implementing C1) or remove the pages entirely and redirect to `/dashboard`.

### H5 — summary-section.tsx is 1,400 lines — too large
- **Type:** Frontend
- **File:** `src/components/sections/summary-section.tsx`
- **Issue:** Contains the full state machine (`processAnswer`), `SummaryCard`, `ScryveModal`, wizard UI, and content view all in one file.
- **Fix:** Split into separate files:
  - `src/lib/wizard-state-machine.ts` — processAnswer function and types
  - `src/components/sections/ScryveModal.tsx` — modal component
  - `src/components/sections/SummaryCard.tsx` — card component
  - `src/components/sections/summary-section.tsx` — main wizard orchestrator (slim)

### H6 — Icons duplicated across 5+ files
- **Type:** Frontend
- **Files:** `src/app/page.tsx`, `src/components/scryve-panel.tsx`, `src/app/(auth)/layout.tsx`, `src/app/(dashboard)/layout.tsx`, `src/app/(dashboard)/dashboard/project/[id]/page.tsx`
- **Issue:** Same SVG icon components (QuillIcon, SparklesIcon, etc.) are copy-pasted in multiple files.
- **Fix:** Extract all shared icons to `src/components/icons/index.tsx` and import from there.

### H7 — No input validation on PATCH/POST bodies
- **Type:** Backend
- **File:** `src/app/api/projects/[id]/route.ts`
- **Issue:** `title`, `projectType`, `status`, and `wordCountGoal` are accepted without any type or range checking. A caller could set `status` to any arbitrary string, or `wordCountGoal` to a negative number.
- **Fix:** Add Zod schema validation on all route inputs. Example:
  ```typescript
  import { z } from 'zod';
  const PatchSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    projectType: z.enum(['novel', 'screenplay', ...]).optional(),
    status: z.enum(['ideation', 'drafting', ...]).optional(),
    wordCountGoal: z.number().int().positive().optional(),
  });
  ```

### H8 — Auth pages hardcode dark-mode-only styles
- **Type:** Frontend
- **Files:** `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`
- **Issue:** Input borders use `border-white/10` and `bg-white/5` directly — invisible in light mode. The dashboard has a theme toggle.
- **Fix:** Replace with Tailwind `dark:` variants or CSS variables that adapt to the theme.

### H9 — Dockerfile uses npm install instead of npm ci
- **Type:** Infrastructure
- **File:** `Dockerfile`
- **Issue:** No `package-lock.json` is copied into the build. `npm install` is non-deterministic. Also installs devDependencies, bloating the image.
- **Fix:** 
  1. Copy `package-lock.json` alongside `package.json`
  2. Use `npm ci` in the deps stage
  3. Use `npm ci --omit=dev` in the runner stage (or prune after build)

### H10 — No Caddy security headers
- **Type:** Infrastructure
- **File:** `deploy/Caddyfile`
- **Issue:** No rate limiting, no security headers (CSP, HSTS preload, X-Frame-Options, X-Content-Type-Options).
- **Fix:** Add a `header` block to the Caddyfile:
  ```
  header {
    X-Content-Type-Options nosniff
    X-Frame-Options DENY
    Referrer-Policy strict-origin-when-cross-origin
    Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  }
  ```

---

## Medium (Plan for Next Sprint)

### M1 — Theme toggle bypasses Next.js patterns
- **Type:** Frontend
- **File:** `src/app/(dashboard)/layout.tsx`
- **Issue:** Directly manipulates `document.documentElement.classList` in a `useEffect`. Conflicts with root layout's hardcoded `className="dark"`. Does not persist across navigation. No SSR consideration.
- **Fix:** Use `next-themes` package or implement a proper ThemeProvider that handles SSR, persistence, and class toggling.

### M2 — No error handling on dashboard API calls
- **Type:** Frontend
- **File:** `src/app/(dashboard)/dashboard/page.tsx`
- **Issue:** `handleDelete` and `saveEdit` silently fail if the API returns an error. `CreateProjectModal.handleSubmit` has no error feedback. The initial fetch `.catch(() => setLoaded(true))` swallows errors.
- **Fix:** Add error state, display toast/alert on failure, show loading indicators during async operations.

### M3 — Scryve assist endpoint has no input validation
- **Type:** Backend
- **File:** `src/app/api/scryve/assist/route.ts`
- **Issue:** `messages` and `context` from the request body are used directly without checking structure. Missing `messages` would cause the spread into `chatCompletion` to pass `undefined`. Missing `context.question` would inject "undefined" into the system prompt.
- **Fix:** Validate that `messages` is an array and `context` has required fields before proceeding.

### M4 — Consolidation error leaks internal details
- **Type:** Backend
- **File:** `src/app/api/scryve/consolidate/route.ts`
- **Issue:** On catch, `error.message` is returned in the response body. If the error originates from Prisma or DeepSeek, it may expose internal details (DB connection strings, API error bodies).
- **Fix:** Return a generic error message to the client. Log the actual error server-side.

### M5 — No health check on app container
- **Type:** Infrastructure
- **File:** `deploy/docker-compose.prod.yml`
- **Issue:** If Next.js crashes after boot, Docker won't restart it.
- **Fix:** Create `/api/health` endpoint returning `{ status: 'ok' }`. Add healthcheck to compose:
  ```yaml
  healthcheck:
    test: ["CMD", "wget", "-qO-", "http://localhost:3000/api/health"]
    interval: 30s
    timeout: 5s
    retries: 3
  ```

### M6 — No backup strategy for database
- **Type:** Infrastructure
- **File:** `deploy/docker-compose.prod.yml`
- **Issue:** `pgdata` volume has no backup schedule. No logging driver configured. No memory/CPU limits on any service.
- **Fix:** Add a cron job for `pg_dump` backups. Configure Docker logging limits. Set `mem_limit` on services.

### M7 — Scryve panel missing accessibility
- **Type:** Frontend
- **File:** `src/components/scryve-panel.tsx`
- **Issue:** The floating action button has `title` but no `aria-label`. Chat messages lack `role="log"` or `aria-live` for screen reader announcements. The textarea has no associated label.
- **Fix:** Add `aria-label` to FAB, `role="log"` and `aria-live="polite"` to message container, `<label>` or `aria-label` to textarea.

### M8 — Mobile nav completely missing on landing page
- **Type:** Frontend
- **File:** `src/app/page.tsx`
- **Issue:** No hamburger menu. Mobile users cannot access Pipeline/Features/Pricing navigation links.
- **Fix:** Add a hamburger button and mobile nav drawer.

### M9 — Duplicate project route structure
- **Type:** Frontend
- **Files:** `src/app/(dashboard)/projects/page.tsx`, `src/app/(dashboard)/dashboard/project/[id]/page.tsx`
- **Issue:** Both `/projects/` and `/dashboard/project/` exist. `/projects/page.tsx` is a stub returning `<div>Projects list</div>`. Different param names (`projectId` vs `id`).
- **Fix:** Remove the stub `/projects/` route. Standardize on `/dashboard/project/[id]`.

### M10 — Server IP hardcoded in CI workflow
- **Type:** Infrastructure
- **File:** `.github/workflows/deploy.yml`
- **Issue:** `138.201.119.11` is hardcoded. Should be a GitHub secret for flexibility and security.
- **Fix:** Replace with `${{ secrets.DEPLOY_HOST }}`.

---

## Low (Nice to Have)

### L1 — Dead stub files (ai.ts, storage.ts, auth.ts)
- **Type:** Cleanup
- **Files:** `src/lib/ai.ts`, `src/lib/storage.ts`, `src/lib/auth.ts`
- **Issue:** All export nothing (`export {}`). Dead code.
- **Fix:** Delete them, or implement them when needed.

### L2 — Hardcoded model name in deepseek.ts
- **Type:** Backend
- **File:** `src/lib/deepseek.ts`
- **Issue:** `model: 'deepseek-chat'` is hardcoded.
- **Fix:** Use `process.env.DEEPSEEK_MODEL || 'deepseek-chat'`.

### L3 — No request timeout on DeepSeek API calls
- **Type:** Backend
- **File:** `src/lib/deepseek.ts`
- **Issue:** The `fetch()` call has no `AbortController` or timeout. A hung upstream API will block Next.js indefinitely.
- **Fix:** Add `AbortController` with a 30-second timeout.

### L4 — Placeholder testimonial on auth page
- **Type:** Frontend
- **File:** `src/app/(auth)/layout.tsx`
- **Issue:** Quote reads "A future testimonial from a happy storyteller" — placeholder content visible to users.
- **Fix:** Remove or replace with real content.

### L5 — Invalid Tailwind class h-5.5/w-5.5
- **Type:** Frontend
- **File:** `src/components/scryve-panel.tsx`
- **Issue:** Tailwind doesn't support `5.5` as a spacing value. Silently produces no styling.
- **Fix:** Change to `h-6 w-6` or `h-5 w-5`.

### L6 — next.config.ts missing security/performance options
- **Type:** Infrastructure
- **File:** `next.config.ts`
- **Issue:** No `poweredByHeader: false`, no `images.remotePatterns`, no `headers()` for security headers.
- **Fix:** Add these options to the Next.js config.

### L7 — Empty placeholder directories (api/ai, api/export)
- **Type:** Cleanup
- **Files:** `src/app/api/ai/`, `src/app/api/export/`
- **Issue:** Only contain `.gitkeep` files. Planned but unimplemented.
- **Fix:** Leave for now. Remove .gitkeep files when implementing these routes.

---

## Recommended Execution Order

### Phase 1 — Quick Wins (30 min)
1. **C2** — Fix useState → useEffect bug on dashboard
2. **C3** — Remove `db push` from start.sh
3. **C6** — Add allowlist validation to consolidate endpoint
4. **H2** — Delete duplicate `db.ts`
5. **L1** — Delete dead stub files
6. **L5** — Fix invalid Tailwind class

### Phase 2 — Backend Hardening (1-2 hrs)
7. **H3** — Add try/catch to all project API routes
8. **H7** — Add Zod input validation to all routes
9. **M3** — Validate assist endpoint inputs
10. **M4** — Sanitize error messages returned to client
11. **L2** — Make model name an env var
12. **L3** — Add timeout to DeepSeek calls

### Phase 3 — Frontend Cleanup (2-3 hrs)
13. **H5** — Split summary-section.tsx into 4 files
14. **H6** — Extract shared icons to components/icons/
15. **M2** — Add error handling to dashboard API calls
16. **M9** — Remove duplicate project route
17. **L4** — Remove placeholder testimonial

### Phase 4 — Infrastructure (1-2 hrs)
18. **C4** — Remove default DB password
19. **H1** — Add lint + type-check to CI pipeline
20. **H9** — Fix Dockerfile to use npm ci + lockfile
21. **H10** — Add Caddy security headers
22. **M5** — Add /api/health endpoint + Docker healthcheck
23. **M10** — Move server IP to GitHub secret
24. **L6** — Add Next.js security config

### Phase 5 — Polish (when time allows)
25. **H4** — Wire up auth pages or remove them
26. **H8** — Fix auth page dark-mode-only styles
27. **M1** — Implement proper theme provider
28. **M6** — Set up database backups
29. **M7** — Add accessibility attributes to Scryve panel
30. **M8** — Add mobile nav to landing page
31. **C1** — Implement real authentication (before beta)
32. **C5** — Move SSH key to GitHub secret
33. **L7** — Clean up placeholder directories
