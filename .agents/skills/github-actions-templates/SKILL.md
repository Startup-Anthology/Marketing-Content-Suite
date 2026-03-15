---
name: github-actions-templates
description: Reusable GitHub Actions workflow templates for CI/CD automation. Use when setting up GitHub Actions, creating CI pipelines, configuring automated testing, building deploy workflows, or when the user mentions "github actions," "CI/CD," "workflows," "automated testing," "deploy pipeline," or "continuous integration" for GitHub-hosted repos.
---

# GitHub Actions Templates

Reusable GitHub Actions workflow templates for Node.js/TypeScript monorepos, Expo mobile apps, and Express API servers.

## When to Use

- Set up CI/CD for a GitHub-hosted repository
- Create or update GitHub Actions workflows
- Configure automated typecheck, lint, test, build, or deploy steps
- Implement branch protection with required status checks
- Build Expo apps (web, iOS, Android) in CI
- Deploy Node.js API servers

## Project Context

This workspace is a **pnpm monorepo** with:
- **API Server**: Express + TypeScript at `artifacts/api-server`
- **Marketing Studio**: Expo (React Native) app at `artifacts/marketing-studio`
- **Mockup Sandbox**: Vite preview server at `artifacts/mockup-sandbox`
- **Shared libs**: `lib/` directory with shared packages

Package manager: `pnpm` (v9+), Node 20+.

## Workflow File Location

All workflows go in `.github/workflows/`.

## Template: CI Pipeline

Runs on every push and PR to `main`. Typechecks and builds each artifact in parallel.

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  typecheck:
    name: Typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm run typecheck:libs
      - run: pnpm --filter @workspace/api-server run typecheck

  build-api:
    name: Build API Server
    runs-on: ubuntu-latest
    needs: typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @workspace/api-server run build

  build-expo:
    name: Build Expo (Web)
    runs-on: ubuntu-latest
    needs: typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @workspace/marketing-studio run build
```

## Template: Deploy Pipeline

Triggered on push to `main` or manually. Replace the final deploy step with your hosting target.

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: deploy-production
  cancel-in-progress: false

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
      - name: Deploy
        run: echo "Configure deployment target here"
```

## Template: Expo EAS Build (iOS & Android)

Builds native binaries using Expo Application Services. Requires `EXPO_TOKEN` secret.

```yaml
name: Expo EAS Build

on:
  push:
    branches: [main]
    paths:
      - 'artifacts/marketing-studio/**'
  workflow_dispatch:
    inputs:
      platform:
        description: 'Platform to build'
        required: true
        default: 'all'
        type: choice
        options: [all, ios, android]
      profile:
        description: 'Build profile'
        required: true
        default: 'preview'
        type: choice
        options: [development, preview, production]

jobs:
  eas-build:
    name: EAS Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: pnpm install --frozen-lockfile
      - name: Build
        working-directory: artifacts/marketing-studio
        run: |
          PLATFORM="${{ github.event.inputs.platform || 'all' }}"
          PROFILE="${{ github.event.inputs.profile || 'preview' }}"
          if [ "$PLATFORM" = "all" ]; then
            eas build --platform all --profile "$PROFILE" --non-interactive
          else
            eas build --platform "$PLATFORM" --profile "$PROFILE" --non-interactive
          fi
```

## Template: PR Checks with Labels

Adds labels based on changed paths and enforces PR conventions.

```yaml
name: PR Checks

on:
  pull_request:
    types: [opened, synchronize, labeled, unlabeled]

jobs:
  label:
    name: Auto-label
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: actions/labeler@v5
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}

  size-check:
    name: PR Size
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Check PR size
        run: |
          CHANGED=$(git diff --stat origin/main...HEAD | tail -1)
          echo "Changes: $CHANGED"
```

## Template: Scheduled Database Backup

Runs nightly to back up the database.

```yaml
name: Scheduled DB Backup

on:
  schedule:
    - cron: '0 3 * * *'
  workflow_dispatch:

jobs:
  backup:
    name: Backup Database
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run backup
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: echo "Add pg_dump or backup script here"
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: db-backup-${{ github.run_number }}
          path: backup/
          retention-days: 30
```

## Key Patterns

### pnpm Setup (reusable snippet)
Every job that installs dependencies should use:
```yaml
- uses: pnpm/action-setup@v4
  with:
    version: 9
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: pnpm
- run: pnpm install --frozen-lockfile
```

### Filter by Artifact
Run jobs only when specific artifacts change:
```yaml
on:
  push:
    paths:
      - 'artifacts/api-server/**'
      - 'lib/**'
```

### Concurrency Control
Prevent parallel runs on the same branch:
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### Environment Secrets
Use GitHub Environments for deployment secrets:
```yaml
jobs:
  deploy:
    environment: production
    steps:
      - run: echo ${{ secrets.API_KEY }}
```

### Matrix Builds
Test across multiple Node versions:
```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```

## Branch Protection Recommendations

Configure in GitHub Settings > Branches > Branch protection rules for `main`:
- Require status checks: `Typecheck`, `Build API Server`, `Build Expo (Web)`
- Require branches to be up to date
- Require pull request reviews (1+ approvals)
- Do not allow force pushes
