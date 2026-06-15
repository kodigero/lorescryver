# Claude Cowork Takeover Notes

**Last refreshed from GitHub:** June 15, 2026
**Repository:** `kodigero/lorescryver`
**Canonical branch:** `main`
**Current GitHub HEAD:** `3879ea4 fix: remove unused ShieldCheckIcon - fixes lint`
**Latest deployment workflow:** success, run `27549483219`
**Merged audit PR:** https://github.com/kodigero/lorescryver/pull/1

This document is the handoff point for Claude Cowork, Codex, or another engineering agent taking over LoreScryver work.

## GitHub Is Source Of Truth

Always refresh GitHub before making project-status claims or starting new work.

Use this order:

```bash
git fetch --all --prune
git status --short --branch
gh pr list --repo kodigero/lorescryver --state all --limit 20
gh issue list --repo kodigero/lorescryver --state all --limit 30
gh run list --repo kodigero/lorescryver --limit 12
```

Trust GitHub over local memory, previous chat context, or stale documentation. Local checkout state is only a working copy and must be compared against `origin/main` before edits.

Current GitHub snapshot from this refresh:

- `main` and `origin/main` point at `3879ea4`.
- PR #1, `[codex] harden app and deployment`, is merged.
- No repository issues are currently listed by `gh issue list`.
- The latest `Deploy to Hetzner` workflow on `main` completed successfully.
- Earlier failed deploy runs were followed by later successful fixes.

## Current State

The merged remediation and follow-up work provides:

- Signed cookie auth with `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, and `/api/auth/me`.
- Middleware protecting dashboard pages, project routes, and project/Scryve APIs.
- Zod validation in `src/lib/validation.ts`.
- Session-scoped project and Scryve API access using `getCurrentUser()` from `src/lib/auth.ts`.
- Scryve Summary consolidation with section-key allowlisting and sanitized client-facing errors.
- DeepSeek timeout handling and configurable `DEEPSEEK_MODEL`.
- Dashboard fetch moved to `useEffect`, plus error states for create, rename, delete, and initial load.
- Functional login/register pages with improved password toggles.
- Summary wizard split into focused modules:
  - `src/lib/wizard-state-machine.ts`
  - `src/components/sections/summary-card.tsx`
  - `src/components/sections/scryve-modal.tsx`
  - `src/components/sections/summary-section.tsx`
- Staging Phase 1:
  - `src/components/sections/staging-section.tsx`
  - `/api/projects/[id]/staging`
  - `/api/projects/[id]/staging/[conceptId]`
  - `/api/scryve/brainstorm`
  - `StagingConcept` Prisma model
- CI quality gates in `.github/workflows/deploy.yml`.
- Docker and production Compose hardening, including required `DB_PASSWORD`, app healthcheck, Caddy security headers, log limits, and a Postgres backup service.
- Dead stubs removed: `src/lib/ai.ts`, `src/lib/db.ts`, `src/lib/storage.ts`, `src/lib/test-user.ts`.
- Empty placeholder API directories removed: `src/app/api/ai`, `src/app/api/export`.

## GitHub Secrets

The following repository secrets are configured for `kodigero/lorescryver`:

- `DEPLOY_HOST`
- `DEPLOY_SSH_KEY`
- `DEEPSEEK_API_KEY`
- `DB_PASSWORD`
- `AUTH_SECRET`

`DB_PASSWORD` was copied from the production `/opt/lorescryver/.env` `DATABASE_URL` value during the remediation pass. Do not rotate it casually. Password rotation needs a coordinated database role update on the server.

## Validation

Latest local validation on synced `main`:

```bash
npm ci
npm run lint
npx tsc --noEmit
npm run build
```

All passed.

`npm audit --audit-level=moderate` still reports a moderate PostCSS advisory under Next's dependency tree. The suggested `npm audit fix --force` path is breaking and should not be applied blindly.

## Known Residuals

### Documentation Drift

This handoff file must be refreshed after meaningful GitHub state changes. The audit action plan is historical and should not be read as current status without checking this document and GitHub first.

### Product Surface Still Incomplete

The in-project Summary and Staging surfaces are functional, but many workspace sections still show placeholder content or one-line route stubs:

- Atlas
- Story Bible
- Research
- Reference
- Manuscript / editor
- Staging and export
- Review
- Publish

### Staging API Needs Hardening

The new Staging update route accepts loose request bodies for `messages`, `tags`, `phase`, and `stage`. Add shared Zod schemas before expanding the feature.

### Global Scryve Panel Is Placeholder-Only

The floating global Scryve panel still simulates responses. The in-project Staging chat uses the real DeepSeek-backed `/api/scryve/brainstorm` route.

### Auth Is Custom Cookie Session Auth

The app uses custom signed cookie sessions, not NextAuth. Before beta/public launch, decide whether to keep the custom path or migrate to a provider-backed auth stack.

If keeping custom auth, add:

- CSRF protection for browser mutation forms if form posts are added.
- Password reset flow.
- Email verification.
- Rate limiting for login/register.
- Session invalidation or persisted sessions table if server-side revocation is needed.

## Production Deploy Notes

The deploy workflow injects:

- `DEEPSEEK_API_KEY`
- `DB_PASSWORD`
- `AUTH_SECRET`

It does not inject `DATABASE_URL`. The current server `.env` still contains production `DATABASE_URL`. If rebuilding a server from scratch, make sure `.env` contains a correct `DATABASE_URL` using the same password as `DB_PASSWORD`.

Production startup runs:

```bash
prisma migrate deploy
node server.js
```

Do not reintroduce `prisma db push` into production startup.

## Recommended Next Work

1. Harden Staging API validation with Zod.
2. Connect or remove the placeholder global Scryve panel.
3. Build Story Bible CRUD for characters, locations, factions, lore entries, tags, and relationships.
4. Replace remaining one-line legacy workspace route stubs.
5. Add auth hardening for rate limits, reset, verification, and revocation.

## Useful Commands

```bash
npm ci
npm run dev
npx tsc --noEmit
npm run lint
npm run build
npm audit --audit-level=moderate
```

For local Docker development, set `DB_PASSWORD` in `.env`; Compose fails fast if it is missing.
