# RejeXion Workspace

## Overview

pnpm workspace monorepo using TypeScript. RejeXion is a private, structured reflection tool for academic and career rejection.

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
- **Auth**: Session-based (express-session + connect-pg-simple)
- **Frontend**: React + Vite + Tailwind CSS v4 + shadcn/ui
- **Routing**: wouter
- **API client**: TanStack React Query (generated from OpenAPI)

## Artifacts

- `artifacts/api-server` — Express API server (port 8080, preview at `/api`)
- `artifacts/rejexion` — React/Vite web app (port 24065, preview at `/`)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Features (MVP)

- Email/password auth with session cookies
- Password reset via token
- Rejection entry creation (academic or career)
- Category-based prompt templates (4 prompts per category)
- Entry timeline with filter by category
- Entry detail with reflection responses
- Growth notes (timestamped, multiple per entry)
- Points system (+5 per entry, +2 per growth note)
- Single-entry plain text export
- Profile management + account deletion
- Privacy-safe (no text in analytics)

## DB Schema

- `users` — id (uuid), email, name, passwordHash, createdAt, updatedAt
- `sessions` — express-session store table
- `password_resets` — token, userId, expiresAt, used
- `prompt_templates` — id, category, promptText, orderIndex
- `entries` — id, userId, category, title, rejectionDate, description, createdAt
- `entry_responses` — id, entryId, promptId, responseText, createdAt
- `growth_notes` — id, entryId, content, createdAt
- `points_events` — id, userId, eventType, referenceId, points, createdAt

## Design

- Warm sand/terracotta palette (primary: `hsl(13 58% 51%)`)
- Fonts: Fraunces (serif headings), DM Sans (body)
- Calm, supportive tone — private by design
