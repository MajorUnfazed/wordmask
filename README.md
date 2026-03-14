# WordMask

WordMask is a social deduction word game built for quick local play and designed to support a shared game engine across web and mobile clients.

The current web build focuses on a polished offline pass-the-phone experience:

- guided player setup with editable default names
- curated category selection
- role reveal with hidden impostor hints
- host-controlled discussion flow
- sequential pass-the-phone voting
- results and score tracking across rounds

## Tech Stack

- React + Vite + TypeScript
- Framer Motion
- Zustand
- Tailwind CSS
- Shared TypeScript game engine in `packages/core`
- Expo workspace scaffold in `apps/mobile`

## Repository Structure

```text
apps/
  web/        React client
  mobile/     Expo client scaffold
packages/
  core/       Shared game engine and word data
docs/
  architecture.md
supabase/
  migrations and backend groundwork
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Install

```bash
pnpm install
```

### Run the Web App

```bash
pnpm --filter web dev
```

### Run Type Checks

```bash
pnpm -r typecheck
```

### Build the Web App

```bash
pnpm --filter web build
```

## Gameplay Flow

1. Set up players and round settings.
2. Choose one or more categories.
3. Pass the device for private role reveal.
4. Discuss the category and suspicious clues.
5. Vote sequentially, one player at a time.
6. Review the result and continue to the next round.

## Project Notes

- The game engine is isolated in `packages/core` to keep game rules out of the UI.
- Word data includes multiple hint options, with one hint selected per round for the impostor.
- The mobile app and Supabase-backed multiplayer foundation are present as workspace scaffolding, while the web offline mode is the primary playable experience in this version.

## Status

WordMask v1.0 is positioned as a playable web-first release with shared-core architecture for future expansion.
