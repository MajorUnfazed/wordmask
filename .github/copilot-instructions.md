# Copilot Project Instructions

You are helping implement the project described in `/docs/architecture.md`.

This repository follows a strict architecture. Follow these rules when generating code.

---

# 1. Project Structure

This project is a **pnpm monorepo**.

Structure:

apps/
  web/
  mobile/

packages/
  core/
  ui-system/
  word-packs/
  utils/

supabase/

docs/

Never place business logic inside UI components.

---

# 2. Core Game Engine

All game logic must live in:

packages/core

This includes:

- role assignment
- voting logic
- score calculation
- round state machine
- SmartShuffle word system

The core package must:

- be pure TypeScript
- contain **no React imports**
- contain **no Supabase imports**
- export deterministic functions

The UI must call the engine instead of reimplementing logic.

---

# 3. UI Architecture

UI code exists only inside:

apps/web
apps/mobile

UI responsibilities:

- rendering
- animation
- user interaction

UI must never contain game logic.

---

# 4. State Management

Web uses:

Zustand

State should be stored in:

apps/web/src/store

Game state must mirror the **GameEngine state machine** defined in the architecture document.

---

# 5. Multiplayer

Multiplayer uses:

Supabase

Use:

- Supabase Realtime
- Supabase RPC functions
- Row Level Security

Never expose sensitive data such as:

- round word
- impostor IDs

Clients should fetch roles through RPC functions.

---

# 6. Word Pack System

Word packs live in:

packages/core/src/packs/data

Each pack must contain:

- 100+ words
- one hint per word

Words must be selected using the **SmartShuffle algorithm** to prevent repetition.

---

# 7. Code Style

Follow these rules:

- Use TypeScript everywhere
- Prefer small focused files
- Avoid functions longer than ~40 lines
- Prefer pure functions over classes when possible
- Use clear descriptive names

Example:

GOOD
assignRoles()

BAD
doGameStuff()

---

# 8. UI Design Principles

The UI must feel like a **cinematic party game**, not a CRUD app.

Use:

- glow effects
- animated backgrounds
- smooth transitions
- large typography
- particle effects

Avoid:

- default Tailwind component layouts
- plain HTML forms
- generic card grids

---

# 9. Signature Interaction

The most important interaction is the **RoleCard reveal**.

Behavior:

Idle:
- glowing card back

Press and hold:
- background blur
- card flip animation

Hold:
- role text visible

Release:
- card flips back

This interaction should feel dramatic.

---

# 10. File Naming

Use clear feature-based structure.

Example:

features/
  lobby/
  round/
  voting/

Avoid dumping everything into a generic `components` folder.

---

# 11. Testing

Core logic should be testable.

Prefer pure functions so unit tests can be written for:

- SmartShuffle
- RoleAssigner
- VoteCounter

---

# 12. Documentation

When creating major modules, include comments explaining:

- purpose
- inputs
- outputs
- edge cases

---

# Goal

The final repository should look like a **well-designed production project**, not a quick hackathon prototype.