# Marketing Content Suite

A full-stack marketing content platform by [Startup Anthology](https://startupanthology.com). Built for founders to create social content, storyboards, ad creatives, conduct SEO/AEO research, and schedule posts — all styled with the Startup Anthology brand.

## Architecture

This is a **pnpm monorepo** with three main artifacts:

| Artifact | Stack | Description |
|----------|-------|-------------|
| **API Server** | Express 5 + TypeScript + PostgreSQL | REST API with JWT auth, AI content generation, social OAuth, Google Calendar sync |
| **Marketing Studio** | Expo (React Native) | Mobile-first app with 4-tab navigation, day/night mode, brand-aware AI |
| **Mockup Sandbox** | Vite + React | UI prototyping sandbox with 6 interactive brand guide boards |

## Features

### Marketing Studio (Mobile App)
- **AI Content Generation** — social posts, newsletters, captions, blog posts powered by Claude Sonnet
- **Storyboard Builder** — scene-by-scene storyboards and ad creatives
- **SEO/AEO Research** — keyword analysis, People Also Ask questions, talking points
- **Post Scheduling** — weekly calendar view with swipe-to-delete, auto-publish
- **Podcast Generator** — AI-powered episode scripts (solo, duo, interview, debate, narrative)
- **Interview Prep** — structured questions, follow-ups, run-of-show timelines
- **Social OAuth** — connect LinkedIn, X/Twitter, Instagram, TikTok, YouTube
- **Google Calendar Sync** — auto-sync scheduled posts to calendar events
- **Day/Night Mode** — instant theme toggle with persistence
- **Brand Guide** — define brand identity that auto-injects into all AI prompts
- **Admin Panel** — user management, role assignment

### Brand Guide (Canvas Boards)
- Brand Voice & Overview
- Audience & Positioning
- Color System with WCAG contrast audit
- Typography specimens & font pairings
- Logo & Identity variants
- Design Patterns & brand applications

## Brand

| Element | Value |
|---------|-------|
| Primary | SA Gold `#BB935B` |
| Background | Black `#000000` |
| Font | Inter (400/500/600/700) |

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL database

### Install

```bash
pnpm install
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT authentication |
| `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` | Anthropic AI proxy URL |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | Anthropic AI proxy key |

### Development

```bash
# API Server
pnpm --filter @workspace/api-server run dev

# Marketing Studio (Expo)
pnpm --filter @workspace/marketing-studio run dev

# Mockup Sandbox
pnpm --filter @workspace/mockup-sandbox run dev
```

### Build

```bash
# Build everything (typecheck + build all packages)
pnpm run build

# Build individual artifacts
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/marketing-studio run build
```

### Typecheck

```bash
pnpm run typecheck
```

## Project Structure

```
Marketing-Content-Suite/
├── artifacts/
│   ├── api-server/          # Express API (auth, AI, social, scheduling)
│   ├── marketing-studio/    # Expo mobile app
│   └── mockup-sandbox/      # Vite UI prototyping sandbox
├── lib/
│   ├── api-spec/            # OpenAPI spec + Orval codegen
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod schemas
│   ├── db/                  # Drizzle ORM schema + migrations
│   └── integrations/        # Anthropic AI integration
├── scripts/                 # Utility scripts
├── .github/workflows/       # CI/CD pipelines
│   ├── ci.yml               # Typecheck + build on push/PR
│   └── deploy.yml           # Deploy pipeline
└── package.json
```

## CI/CD

GitHub Actions pipelines run on every push and PR to `master`:

- **Typecheck** — validates TypeScript across all packages
- **Build API** — compiles the API server
- **Build Expo** — builds the Marketing Studio web bundle

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Current user |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/ai/generate-draft` | AI content generation |
| POST | `/api/ai/seo-research` | SEO/AEO research |
| POST | `/api/ai/podcast-script` | Podcast script generation |
| POST | `/api/ai/interview-prep` | Interview prep generation |
| GET/PUT | `/api/brand-guide` | Brand identity CRUD |
| GET/POST/PUT/DELETE | `/api/social-accounts` | Social platform connections |
| GET/POST/PUT/DELETE | `/api/scheduled-posts` | Post scheduling |
| GET/POST/DELETE | `/api/podcast-scripts` | Saved podcast scripts |
| GET/POST/DELETE | `/api/interview-preps` | Saved interview preps |
| GET/PUT | `/api/admin/users` | User management (admin) |

## License

Proprietary — Startup Anthology
