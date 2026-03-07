# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the repo root unless noted otherwise.

```sh
# Code quality (whole repo)
npm run typecheck        # tsgo --noEmit
npm run lint             # oxlint
npm run lint:fix         # oxlint --fix
npm run format           # oxfmt --write .
npm run format:check     # oxfmt --check .

# Scoped to a workspace (scripts live in each workspace's package.json)
npm -w frontend run typecheck
npm -w frontend run lint
npm -w frontend run format
npm -w api run typecheck
npm -w api run lint
npm -w api run format

# Frontend dev server (port 3000)
npm run -w frontend dev

# Tests (frontend only, uses vitest + jsdom)
npm -w frontend run test -- run            # all tests
npm -w frontend run test -- run src/path   # single file or directory
```

## Architecture

**Monorepo** using npm workspaces with two packages: `frontend/` (`@consiglio/frontend`) and `api/` (`@consiglio/api`).

TypeScript is checked with `tsgo` (native TS from `@typescript/native-preview`), not `tsc`. The root `tsconfig.json` uses project references to delegate to each workspace.

### Frontend

- **React 19** + **Vite** + **TanStack Router** (file-based routing)
- **Tailwind CSS v4** configured via `@tailwindcss/vite` plugin, with `@theme inline` in `frontend/src/index.css`
- Path alias: `@` maps to `frontend/src/`
- CSS utility helper: `classnames` (not clsx/twMerge)
- Tests: Vitest with `@testing-library/react`, globals enabled, jsdom environment

**Routing**: Routes live in `frontend/src/routes/` and are auto-wired via `routeTree.gen.ts` (generated, do not edit). `__root.tsx` defines the root layout. Route files render page components from `frontend/src/pages/`.

**Theme**: Tokyo Night (night variant). Semantic color aliases (`bg`, `fg`, `accent`, `fg-muted`, `border-muted`, etc.) are defined in `index.css` and should be used instead of raw palette colors. Font: "Berkeley Mono" for both display and body.

**Component structure**:

- `frontend/src/components/ui/` — reusable UI primitives (Button, Card, Label, NumberStepper)
- `frontend/src/components/layout/` — layout shells and headers (PageShell, PageHeader)
- `frontend/src/pages/` — page-level components composed from the above

## Pre-commit Checklist

Always run the following from the repo root **before** committing:

```sh
npm run lint
npm run format
npm run typecheck
npm -w frontend run test -- run
```

All must pass before creating a commit.

## Design Principles

- Styles belong in `components/`, pages should compose components rather than define raw styles.
- Business logic belongs in `pages/`.
- Match existing layouts' structure, spacing, and patterns when building new ones.
- Use TDD: write tests first, then implement.
