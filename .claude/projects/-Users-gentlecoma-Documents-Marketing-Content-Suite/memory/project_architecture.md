---
name: Project Architecture
description: Marketing Content Suite is a pnpm monorepo with Express API, Expo mobile app, Vite sandbox, and shared libs (Drizzle, Orval, AI integrations)
type: project
---

Marketing Content Suite — full-stack marketing platform for Startup Anthology brand.

**Architecture:** pnpm workspace monorepo with 3 deployable artifacts and shared libraries.
- API: Express 5 + PostgreSQL (Drizzle ORM) + Claude AI
- Mobile: Expo 54 / React Native 0.81.5 with file-based routing
- Sandbox: Vite 7.3 + React 19 + shadcn/ui for brand guide mockups
- Shared: DB schemas, OpenAPI spec, generated React Query hooks + Zod schemas, AI SDK wrappers

**Key patterns:**
- Orval generates API client and Zod schemas from OpenAPI spec
- Drizzle ORM with typed schemas, one file per table
- Express routes in one file per resource
- Brand: SA Gold #BB935B, Black #000, uses League Spartan + Hanken Grotesk fonts

**Why:** Understanding architecture prevents incorrect assumptions about project structure.

**How to apply:** Always use pnpm (not npm/yarn). Check which workspace a file belongs to before making changes. Don't manually edit generated files in `src/generated/` directories.
