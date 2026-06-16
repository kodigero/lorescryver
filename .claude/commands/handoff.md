---
description: End-of-session handoff — updates AGENTS.md so the next AI platform picks up where you left off
allowed-tools: Read, Edit, mcp__e3c71d27-d798-414d-bc0b-f792acdbc323__create_or_update_file
---

You are ending a development session on the LoreScryver project. Your job is to update AGENTS.md so that the next AI platform (Claude, Codex, or Antigravity) can continue seamlessly without any verbal instructions from the owner.

Do the following:

1. **Read the current AGENTS.md** from the repo root.

2. **Update these sections** (create them if they don't exist):

   ### Section 9: Known Limitations & Technical Debt
   - Move any issues you FIXED during this session from "Current Known Issues" to "Recently Resolved"
   - Add any NEW issues you discovered but didn't fix to "Current Known Issues"

   ### New Section: Last Session Summary (add at the end, before the closing note)
   - **Date**: today's date
   - **Platform**: which AI platform was used (Claude Cowork, Claude Code, Codex, Antigravity)
   - **What was done**: bullet list of completed work (commits, features, fixes)
   - **What's in progress**: anything started but not finished
   - **What's next**: the immediate next task the owner is likely to request
   - **Decisions made**: any product, architecture, or convention decisions made during the session
   - **New preferences**: any owner preferences expressed during the session that should be permanent rules

3. **Update any other sections** if the session changed conventions, tech stack, or architecture (e.g., if Node version changed, if a new dependency was added, if a new file convention was established).

4. **Push the updated AGENTS.md** to the main branch with commit message: `docs: session handoff — [brief summary]`

5. **Report** a one-paragraph summary of what you updated.

IMPORTANT: Only record FACTS — things that actually happened or were explicitly decided. Do not add aspirational items or suggestions. If nothing changed in a section, leave it alone.
