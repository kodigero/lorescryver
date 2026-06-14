# Claude Cowork Takeover Notes

**Date:** June 14, 2026  
**Branch:** `codex/audit-remediation-hardening`  
**Draft PR:** https://github.com/kodigero/lorescryver/pull/1  
**Last commit:** `48a764d harden app and deployment`

This document is the handoff point for Claude Cowork or another engineering agent taking over after the audit remediation pass.

## Current State

The audit remediation branch implements the high-priority security, backend, frontend, and deployment hardening work from `docs/AUDIT_ACTION_PLAN.md`.

The repository now has:

- Cookie-session auth with `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, and `/api/auth/me`.
- Middleware protecting dashboard pages, project routes, and project/Scryve APIs.
- Zod validation in `src/lib/validation.ts`.
- Session-scoped project and Scryve API access using `getCurrentUser()` from `src/lib/auth.ts`.
- Scryve AI consolidation key allowlisting and sanitized client-facing errors.
- DeepSeek timeout handling and configurable `DEEPSEEK_MODEL`.
- Dashboard fetch moved to `useEffect`, plus error states for create, rename, delete, and initial load.
- Functional login/register pages.
- Summary wizard split into:
  - `src/lib/wizard-state-machine.ts`
  - `src/components/sections/summary-card.tsx`
  - `src/components/sections/scryve-modal.tsx`
  - `src/components/sections/summary-section.tsx`
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

`DB_PASSWORD` was copied from the current production `/opt/lorescryver/.env` `DATABASE_URL` value. Do not rotate it casually. A password rotation needs a coordinated database role update on the server.

## Validation Already Run

These passed locally before PR creation:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

A browser smoke check also passed for:

- `/`
- `/login`
- `/register`

## Known Residuals

### Dependency Audit

`npm audit --audit-level=moderate` reports a moderate PostCSS advisory under Next's dependency tree. The suggested `npm audit fix --force` path is destructive and selects an incompatible Next version, so it was intentionally not applied.

Track this as an upstream Next/PostCSS follow-up.

### Product Surface Still Incomplete

Many workspace sections still show "coming soon" content:

- Atlas
- Story Bible
- Manuscript
- Staging and Export
- Review
- Publish

The best next product milestone is **Story Bible CRUD**, because characters, locations, factions, lore entries, tags, and relationships support later drafting and review features.

### Auth Is Custom Cookie Session Auth

The README originally listed NextAuth.js, but the current branch implements custom signed cookie sessions using `src/lib/auth.ts`.

Before beta/public launch, decide whether to keep this custom auth path or migrate to a full provider-backed auth stack. If keeping it, add:

- CSRF strategy for mutation forms if browser form posts are added.
- Password reset flow.
- Email verification.
- Rate limiting for login/register.
- Session invalidation or persisted sessions table if server-side revocation is needed.

## Production Deploy Notes

The deploy workflow now injects:

- `DEEPSEEK_API_KEY`
- `DB_PASSWORD`
- `AUTH_SECRET`

It no longer injects `DATABASE_URL`. The current server `.env` still contains the production `DATABASE_URL`. If rebuilding a server from scratch, make sure `.env` contains a correct `DATABASE_URL` using the same password as `DB_PASSWORD`.

Production startup now runs only:

```bash
prisma migrate deploy
node server.js
```

Do not reintroduce `prisma db push` into production startup.

## Suggested Next Steps

1. Wait for PR #1 checks to run.
2. Review PR #1 for any deployment assumptions.
3. Merge PR #1 when checks are green.
4. Deploy from `main`.
5. Run production smoke tests:
   - register
   - login
   - create project
   - open project
   - save Summary section
   - run Scryve wizard/consolidation
6. Start the next feature branch for Story Bible CRUD.

## Useful Commands

```bash
npm install
npm run dev
npx tsc --noEmit
npm run lint
npm run build
npm audit --audit-level=moderate
```

For local Docker development, set `DB_PASSWORD` in `.env`; Compose now fails fast if it is missing.
