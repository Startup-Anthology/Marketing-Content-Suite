# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
Marketing-Content-Suite/
├── artifacts/                  # Deployable applications
│   ├── api-server/             # Express 5 API server (auth, AI, social, scheduling)
│   ├── marketing-studio/       # Expo React Native mobile app
│   └── mockup-sandbox/         # Vite UI prototyping sandbox (brand guide boards)
├── lib/                        # Shared libraries
│   ├── api-spec/               # OpenAPI spec + Orval codegen config
│   ├── api-client-react/       # Generated React Query hooks
│   ├── api-zod/                # Generated Zod schemas from OpenAPI
│   ├── db/                     # Drizzle ORM schema + DB connection
│   └── integrations/
│       └── anthropic-ai/       # Anthropic AI integration (Claude Sonnet)
├── scripts/                    # Utility scripts (single workspace package)
│   └── src/                    # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── .github/workflows/          # CI/CD pipelines (ci.yml, deploy.yml)
├── pnpm-workspace.yaml         # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json          # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json               # Root TS project references
└── package.json                # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `artifacts/mockup-sandbox` (`@workspace/mockup-sandbox`)

Isolated frontend sandbox for UI prototyping. Components are rendered via a Vite dev server, with each component getting a `/preview/{folder}/{ComponentName}` route for canvas iframe embedding.

- **Brand Guide Boards** (`src/components/mockups/brand-guide/`):
  - `BrandVoice.tsx` — Brand Overview & Voice (tagline, mission, voice characteristics, tone spectrum, do/don't)
  - `AudiencePositioning.tsx` — Audience & Positioning (B2C/B2B segments, brand principles)
  - `ColorSystem.tsx` — Color System (core palette, UI colors, shade ramps, WCAG contrast audit)
  - `Typography.tsx` — Typography (type hierarchy with live specimens, font pairing rationale, licensing)
  - `LogoIdentity.tsx` — Logo & Identity (all logo variants on light/dark backgrounds, usage rules)
  - `DesignPatterns.tsx` — Design Patterns & Brand in Action (buttons, spacing, radius, mockup applications)
  - `_group.css` — Shared CSS variables and font imports for brand guide components

- **Brand Assets** (`public/images/logos/`): 9 logo files (vertical/horizontal, black/white/gold variants)
- **Fonts loaded in index.html**: Hanken Grotesk, Lato, League Spartan, Lora, Montserrat, Inter (+ 20+ bundled fonts)
- **Brand Colors**: SA Gold #BB935B, Black #000000, White #FFFFFF, Gray #64748B

### `artifacts/marketing-studio` (`@workspace/marketing-studio`)

Expo React Native mobile app — Marketing Content Studio for Startup Anthology founders. Styled with SA brand colors (Black #000000, SA Gold #BB935B).

- **Tabs** (4): Create, Studio, Research, Schedule — each has a gear icon + sun/moon theme toggle in the header
- **Modals**: create-content, create-storyboard, create-post, podcast-generator, interview-prep, settings
- **Features**:
  - AI-powered content generation (social posts, newsletters, captions, blog posts)
  - Storyboard & ad creative builder with scene management
  - SEO/AEO research with keyword analysis, PAA questions, talking points
  - Post scheduling with weekly calendar view
  - Edit scheduled posts: tapping a post opens edit mode with pre-filled fields; delete with confirmation
  - Swipe-to-delete on schedule post cards
  - Google Calendar integration: connect/disconnect via Settings, auto-sync post CRUD to calendar events
  - Login/Signup screen gates unauthenticated access
  - Settings modal with 6 sub-sections: About, Brand Guide, Profile, Sync (Google Calendar), Admin (admin only), Help
    - Brand Guide — define brand identity (name, voice, tone, colors, fonts, logo, story); auto-injected into AI prompts
    - Help — searchable FAQ, feature summaries
    - About — brand palette, version info, supported platforms
  - Podcast Generator: AI-powered episode script generation (solo, duo, interview, debate, narrative formats) with structured output (cold open, setup, segments, takeaways, outro), speaker tag rendering, per-section copy, and draft saving
  - Interview Prep: AI-powered interview preparation (guest brief, 15-20 structured questions by segment, follow-up suggestions, run-of-show timeline), with tabbed output view, export/share, and draft saving
  - **Day/Night Mode Toggle**: Sun/moon icon in all tab headers; instant theme switching across entire app with AsyncStorage persistence; defaults to dark mode
- **Theming Architecture**:
  - `contexts/ThemeContext.tsx` — provides `useTheme()` hook returning `{ colors, spacing, radius, fonts, isDark, toggleTheme }`
  - `constants/colors.ts` — exports `Colors.dark` and `Colors.light` palettes + `ColorPalette` type
  - All screens use `const { colors: c } = useTheme()` + `useMemo(() => createStyles(c), [c])` factory pattern
  - Dark palette: bg #000000, surface #111111/#1A1A1A/#2A2A2A, SA Gold #BB935B accents
  - Light palette: bg #FFFFFF, surface #F5F5F7, text #1A1A1A
- **API**: Uses `lib/api.ts` helper to call `@workspace/api-server` endpoints
- **DB Tables**: users, social_accounts, content_pieces, storyboards, research_notes, scheduled_posts (with google_calendar_event_id), brand_guide, podcast_scripts, interview_preps
- **Authentication**: JWT-based auth with bcryptjs password hashing; first user auto-assigned admin role; session persistence via AsyncStorage; requires `JWT_SECRET` env var
- **Auth Routes**: POST /api/auth/signup, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me, PUT /api/auth/profile
- **Social Accounts API**: GET/POST/PUT/DELETE /api/social-accounts — per-user platform credentials (LinkedIn, X/Twitter, Instagram, Email, TikTok, YouTube)
- **Admin API**: GET /api/admin/users, PUT /api/admin/users/:id — user management, role assignment (admin/editor/viewer), account deactivation
- **Auth Middleware**: `src/middleware/auth.ts` — authMiddleware, optionalAuthMiddleware, adminMiddleware
- **AI Routes**: POST /api/ai/generate-draft, POST /api/ai/seo-research, POST /api/ai/podcast-script, POST /api/ai/interview-prep — powered by Claude Sonnet 4.6 (Anthropic) via Replit AI Integrations; all inject brand context from saved brand guide
- **Brand Guide API**: GET /api/brand-guide, PUT /api/brand-guide — singleton brand identity CRUD
- **CRUD Routes**: /podcast-scripts, /interview-preps (GET list, POST create, GET/:id, DELETE/:id)
- **Google Calendar Routes**: GET /api/google-calendar/status, GET /api/google-calendar/auth-url, GET /api/google-calendar/callback, POST /api/google-calendar/disconnect
- **Social Accounts Routes**: GET /api/social-accounts, GET /api/social-accounts/status/:platform, GET /api/social-accounts/auth-url/:platformKey, GET /api/social-accounts/callback/:platform, POST /api/social-accounts/disconnect/:platform, POST /api/social-accounts/validate, POST /api/social-accounts/publish
- **Social OAuth**: OAuth flows for LinkedIn, X/Twitter, Instagram, TikTok, YouTube with token exchange and secure storage
- **Auto-publish**: Background job (60s interval) auto-publishes "ready" posts at their scheduled time when platform is connected
- **Platform Validation**: Character limits enforced per platform (X/Twitter 280, LinkedIn 3000, Instagram/TikTok 2200, YouTube 5000)
- **Fonts**: Inter (400/500/600/700)
- **Port**: 23704 (via $PORT)

### `lib/integrations-anthropic-ai` (`@workspace/integrations-anthropic-ai`)

Anthropic AI integration via Replit AI Integrations proxy. Pre-configured SDK client using `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` and `AI_INTEGRATIONS_ANTHROPIC_API_KEY` env vars. Exports `anthropic` client and batch processing utilities.

- Model: `claude-sonnet-4-6`
- Max tokens: 8192 (16384 for long-form content like podcast scripts)

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

## GitHub Integration

- **Repository**: `git@github.com:Startup-Anthology/Marketing-Content-Suite.git`
- **Branch**: `master` (both Replit and GitHub)
- **Push**: `git push origin master` or use the Replit Git tab button
- **CI/CD**: GitHub Actions workflows in `.github/workflows/`
  - `ci.yml` — typecheck + build on push/PR to master
  - `deploy.yml` — deploy pipeline on push to master (deploy step is a placeholder)

## Skills (CI/CD)

- `deployment-pipeline-design` — multi-stage pipeline architecture with approval gates
- `gitlab-ci-patterns` — GitLab CI/CD templates
- `github-actions-templates` — GitHub Actions workflow templates tailored to this monorepo
