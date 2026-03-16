# CLAUDE.md — Marketing Content Suite

## Project Overview

Marketing Content Suite is a full-stack marketing content platform for startup founders (Startup Anthology brand). It enables social content creation, storyboards, ad creatives, SEO/AEO research, podcast scripts, interview prep, and post scheduling.

## Architecture

- **Monorepo** managed with pnpm workspaces
- **Package manager:** pnpm (enforced via preinstall script — never use npm/yarn)
- **TypeScript** throughout, strict mode, composite project references

### Artifacts (Deployable Apps)
- `artifacts/api-server` — Express 5 REST API, esbuild bundled
- `artifacts/marketing-studio` — Expo (React Native) mobile/web app
- `artifacts/mockup-sandbox` — Vite + React UI prototyping sandbox

### Shared Libraries
- `lib/db` — Drizzle ORM + PostgreSQL schemas
- `lib/api-spec` — OpenAPI 3.1 specification
- `lib/api-client-react` — Orval-generated React Query hooks
- `lib/api-zod` — Orval-generated Zod schemas
- `lib/integrations/integrations-anthropic-ai` — Claude AI SDK integration
- `lib/integrations/openai_ai_integrations` — OpenAI integration (legacy)
- `lib/integrations-openai-ai-server` — Server-side OpenAI utilities
- `lib/integrations-openai-ai-react` — React hooks for OpenAI audio

## Key Commands

```bash
pnpm install                          # Install all dependencies
pnpm run build                        # Typecheck + build all
pnpm run typecheck                    # Typecheck libs then artifacts
pnpm run typecheck:libs               # Typecheck shared libs only
pnpm --filter @workspace/api-server run dev     # Run API server
pnpm --filter @workspace/marketing-studio start # Run Expo app
pnpm --filter @workspace/mockup-sandbox run dev # Run mockup sandbox
pnpm --filter @workspace/db run push            # Push DB schema
pnpm --filter @workspace/api-spec run generate  # Regenerate API client/zod
```

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 24 (Replit) / 20+ LTS elsewhere |
| Language | TypeScript | ~5.9.2 |
| API | Express | 5 |
| ORM | Drizzle | ^0.45.1 |
| Database | PostgreSQL | via `pg` ^8.20 |
| Mobile | Expo / React Native | 54 / 0.81.5 |
| UI Sandbox | Vite + React | 7.3 / 19.1 |
| UI Components | shadcn/ui + Radix | Various |
| Styling | Tailwind CSS | ^4.1.14 |
| AI | Anthropic SDK | ^0.78.0 |
| AI (legacy) | OpenAI SDK | ^6.27.0 |
| API Codegen | Orval | ^8.5.2 |
| State | React Query | ^5.90.21 |

## Environment Variables

| Variable | Required By |
|---|---|
| `DATABASE_URL` | api-server, db |
| `JWT_SECRET` | api-server |
| `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` | api-server, anthropic-ai |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | api-server, anthropic-ai |
| `PORT` | api-server |

## Branch & CI

- **Default branch:** `master`
- CI workflows in `.github/workflows/` currently target `main` (needs fixing to `master`)

## Code Conventions

- Drizzle schemas live in `lib/db/src/schema/`, one file per table
- API routes live in `artifacts/api-server/src/routes/`, one file per resource
- Expo screens use file-based routing in `artifacts/marketing-studio/app/`
- Generated code (Orval output) lives in `src/generated/` dirs — don't edit manually
- Brand colors: SA Gold `#BB935B`, Black `#000000`, White `#FFFFFF`, Text `#5C6B7F`

## Known Issues (as of 2026-03-15)

See full audit for details. Top priorities:
1. Most data routes missing `authMiddleware`
2. Content tables missing `userId` foreign keys (no data isolation)
3. PUT routes allow mass assignment via `...req.body`
4. Auto-publish status transition broken (draft → ready never happens)
5. No automated tests exist
6. CI/CD targets wrong branch (`main` vs `master`)
