---
name: Full Codebase Audit (2026-03-15)
description: Comprehensive audit findings covering security, bugs, UI/UX, database, and integrations across the entire Marketing Content Suite
type: project
---

Full codebase audit completed on 2026-03-15 covering API server, database, mobile app, mockup sandbox, and shared libraries.

**Key findings by severity:**
- CRITICAL (~25 issues): Missing auth on all data routes, no user data isolation (missing userId FKs), mass assignment in PUT routes, plaintext OAuth tokens, CORS wide open
- HIGH (~40 issues): Auto-publish broken (draft→ready transition missing), NaN ID params silently fail, no error handling on DB operations, missing UI states in mobile app, WCAG failures in mockup sandbox, broken image edit API
- MEDIUM (~30 issues): Inconsistent keyboard handling, hardcoded values, missing DB indexes, race conditions, no API timeouts
- LOW (~15 issues): Duplicate exports, style inconsistencies, unnecessary font loads

**Why:** User requested full audit to understand codebase health before further development.

**How to apply:** Reference these findings when working on any part of the codebase. Prioritize security fixes (auth, userId isolation) before feature work. When touching a file mentioned here, fix its issues opportunistically.
