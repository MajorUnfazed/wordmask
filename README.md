# WordMask

WordMask is a social deduction party word game with a shared TypeScript game engine powering both offline pass-the-phone play and online realtime multiplayer.

## Features

**Offline (no backend required)**
- guided player setup with editable default names
- curated category selection (17 categories)
- role reveal with hidden impostor hints (Crewmate / Impostor / Jester roles)
- host-controlled discussion flow
- sequential pass-the-phone voting
- final impostor guess and score tracking across rounds

**Online (requires Supabase — see below)**
- realtime lobbies with join codes, presence, and reconnection
- server-enforced role/word secrecy (the server, not the host, picks each round's word)
- in-room chat, join approval, and host moderation (kick)
- spectator mode and a TV-host display mode
- optional in-lobby voice chat via LiveKit
- anonymous profiles and player statistics

**Community packs (work in progress)**
- Pack Creator with guided entry and JSON import/export
- packs are saved locally and can be submitted for community review
- note: custom packs are not yet playable inside your own games — that wiring is still to come

## Tech Stack

- React + Vite + TypeScript, Zustand, Framer Motion, Tailwind CSS (PWA)
- Shared TypeScript game engine in `packages/core` (`@impostor/core`)
- Supabase (Postgres + RLS + realtime + edge functions) for online multiplayer
- LiveKit for optional voice chat
- Expo workspace scaffold in `apps/mobile`

## Repository Structure

```text
apps/
  web/        React client (primary)
  mobile/     Expo client scaffold
packages/
  core/       Shared game engine and word data
docs/
  architecture.md
supabase/
  migrations/ numbered SQL migrations (apply in order; latest is 011)
  functions/  edge functions (e.g. voice-token for LiveKit)
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+

### Install

```bash
pnpm install
```

### Run the Web App (offline mode works with no configuration)

```bash
pnpm --filter web dev
```

### Run Type Checks and Tests

```bash
pnpm -r typecheck
pnpm test        # runs the @impostor/core vitest suite
```

### Build the Web App

```bash
pnpm --filter web build
```

## Enabling Online Multiplayer

Online play is optional; the app runs offline without any of this.

1. Create a Supabase project and apply the migrations in `supabase/migrations/` in order (through `011_server_word_selection.sql`).
2. Configure the web app with:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. (Optional) For voice chat, deploy the `voice-token` edge function with `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` set, and configure the web app with `VITE_LIVEKIT_URL`.
4. If you want to keep the Supabase project warm, deploy the `keepalive` edge function and point cron-job.org at `https://<project-ref>.supabase.co/functions/v1/keepalive`.
  - Use `GET`
  - Schedule it every 5 to 10 minutes
  - If you set `KEEPALIVE_SECRET` in Supabase, send it as `x-keepalive-secret`

The client checks the backend schema version on connect and will tell you to run a pending migration if the versions do not match.

## Deploying to Vercel

- Framework Preset: `Vite`
- Root Directory: `apps/web`
- Install Command: `pnpm install`
- Build Command: `pnpm --filter web build`
- Output Directory: `dist`

The web app includes [apps/web/vercel.json](apps/web/vercel.json) so SPA routes resolve to `index.html`.

## Gameplay Flow

1. Set up players (offline) or create/join a lobby (online).
2. Choose one or more categories.
3. Reveal private roles — the impostor sees only a hint.
4. Discuss the category and suspicious clues.
5. Vote. If an impostor is caught, they get one final guess at the word.
6. Review the result and continue to the next round.

## Project Notes

- The game engine is isolated in `packages/core` to keep game rules out of the UI.
- Each word ships with multiple hints; one is chosen per round for the impostor.
- Online rounds select the word server-side (Supabase RPC) so the host never learns it in advance.
- The mobile app is an Expo scaffold; the web app is the primary playable client.
