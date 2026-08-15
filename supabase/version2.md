# Wordmask v2.0 Master Implementation Specification

## Objective

This document serves as the **single source of truth** for implementing the next major version of Wordmask.

This is **not** a brainstorming document. Every feature described below is an implementation requirement unless explicitly marked as optional.

The implementation should prioritize:

1. Maintainability
2. Performance
3. Scalability
4. Cross-platform compatibility
5. Clean architecture
6. Backward compatibility where practical

The final result should feel like a polished commercial product rather than a prototype.

---

# High-Level Goals

This update has four primary objectives:

1. **Improve the core gameplay experience**
2. **Increase long-term player retention**
3. **Create a significantly better online multiplayer experience**
4. **Prepare the architecture for future scalability**

Every implementation decision should align with one or more of these goals.

---

# General Engineering Requirements

These requirements apply to **every feature**.

## Code Quality

- Follow existing project architecture where appropriate.
- Avoid duplicated logic.
- Prefer reusable components.
- Avoid hardcoded values.
- Use descriptive naming.
- Keep functions focused and modular.
- Remove obsolete code instead of leaving dead paths.

---

## Performance

The update must not introduce noticeable lag.

Requirements:

- minimize unnecessary React re-renders
- memoize expensive components
- optimize selectors
- lazy load where appropriate
- avoid excessive object recreation
- batch state updates
- optimize animations
- avoid unnecessary network traffic

---

## Mobile First

Every feature must work correctly on:

- Android
- iOS
- Desktop
- Mobile browsers

Battery usage must be considered during implementation.

---

## Networking

Avoid excessive database writes.

Use event-driven synchronization whenever possible.

Avoid polling.

---

## Testing

Every feature should be tested for:

- reconnects
- refreshes
- unexpected exits
- slow internet
- packet loss
- multiple simultaneous players

---

# Feature 1 — Mobile Battery Optimization

## Goal

Reduce battery consumption during gameplay.

Current reports indicate that the game consumes excessive battery for a relatively simple game.

This should be treated as a high priority.

---

## Investigate

Agent should audit:

- animation loops
- timers
- intervals
- requestAnimationFrame usage
- unnecessary rerenders
- websocket update frequency
- background listeners
- SuspicionGraph rendering
- SVG redraw frequency
- expensive calculations
- image loading
- CPU spikes
- memory leaks

---

## Requirements

Optimize until:

- CPU usage is significantly reduced
- heat generation decreases
- idle battery drain is minimized
- gameplay remains visually identical

The optimization should not reduce gameplay quality.

---

# Feature 2 — User Generated Content Packs

## Goal

Allow players to create and publish custom word packs.

---

## Creator Flow

Player creates:

Category

↓

Words

↓

Clues

↓

Preview

↓

Submit

---

## Pack Metadata

Each pack should contain:

- title
- description
- creator
- language
- category
- tags
- creation date
- version
- downloads
- likes
- reports

---

## Validation

Before submission:

Validate:

- profanity
- duplicate words
- duplicate clues
- empty clues
- unsupported characters
- word length
- clue length
- malformed packs

Reject invalid submissions.

---

## Moderation

Implement a moderation pipeline.

Stage 1

Automatic

- profanity filtering
- spam detection
- duplicate detection
- rate limiting

Stage 2

Community

- reporting
- reputation score
- moderation queue

Design moderation so it can be expanded later.

---

# Feature 3 — New Role: Jester

## Goal

Introduce new strategic gameplay.

---

## Win Condition

The Jester wins if the group votes them out.

If eliminated by vote:

- Jester wins immediately.

If the game ends normally without the Jester being voted out:

- Jester loses.

---

## Requirements

The role should integrate seamlessly into:

- matchmaking
- role assignment
- victory screen
- statistics
- achievements

Future roles should be easy to add using the same architecture.

Avoid hardcoding role logic.

---

# Feature 4 — Live Voice Chat

Integrate LiveKit (preferred) or another production-ready WebRTC solution.

Requirements:

- lobby voice chat
- automatic reconnect
- mute
- deafen
- microphone selection
- speaker selection where supported
- echo cancellation
- noise suppression
- mobile optimization

Voice must automatically disconnect when leaving the lobby.

---

# Feature 5 — Spectator Mode

Late joiners should be able to join ongoing games as spectators.

Spectators may:

- watch timer
- view Suspicion Graph
- view voting
- view public game state
- watch results

Spectators may NOT:

- vote
- chat privately
- reveal roles
- influence gameplay
- receive hidden information

Permissions should be enforced server-side.

---

# Feature 6 — Persistent Profiles

Use Supabase authentication and database.

Track lifetime statistics including:

- Games Played
- Wins
- Losses
- Win Rate
- Impostor Win Rate
- Crew Win Rate
- Jester Win Rate
- Correct Votes
- Incorrect Votes
- Words Guessed
- Average Survival Time
- Longest Win Streak
- Total Play Time

---

## Cosmetics

Support unlockable:

- titles
- profile borders
- avatar decorations
- badges

Cosmetics must never provide gameplay advantages.

---

# Feature 7 — TV Host Mode

This is one of the flagship features.

---

## Goal

Transform Wordmask into a living-room party game.

---

## Flow

Host starts room.

Host enables:

TV Host Mode

Host opens:

TV / Laptop

Players join using phones.

---

## TV Displays

- lobby code
- timer
- public clues
- countdown
- voting progress
- results
- celebrations

---

## Phones Display

- secret role
- private information
- voting controls
- chat
- clue submission

---

## Architecture

Introduce a synchronized flag:

is_host_screen

The host display should render public components only.

Players render controller UI.

The host must have the option to disable TV Mode before the game begins.

---

# Feature 8 — AI Replacement Players

When a player disconnects:

Wait configurable timeout.

If reconnect fails:

Spawn AI.

The AI should:

- continue gameplay
- submit clues
- cast votes
- behave naturally

Version 1 should use deterministic heuristics.

Architecture should allow future replacement with LLM-powered bots via Supabase Edge Functions.

---

# Feature 9 — Memory-First Live State

Move transient gameplay state away from PostgreSQL.

---

## Examples

Store in memory:

- votes
- typing indicators
- suspicion levels
- timers
- temporary chat state
- ready states
- live lobby state

Persist only:

- completed matches
- statistics
- achievements
- player progression
- historical data

---

## Requirements

The architecture should support Redis or an edge key-value store without requiring major rewrites.

Separate:

Persistent State

from

Live State

---

# Feature 10 — Final Impostor Guess

If the Impostor is voted out:

Do NOT immediately end the game.

Instead:

Display

"You've been caught."

"You have one final chance."

"Guess the Secret Word."

If correct:

Impostor steals victory.

Otherwise:

Crew wins.

This mechanic should integrate cleanly into the game state machine.

---

# Feature 11 — Simplified Pass-the-Phone

Remove the voting interface.

Instead ask:

"Was the impostor caught?"

Options:

- Yes
- No

Continue directly to results.

This mode should remain intentionally lightweight.

---

# Feature 12 — Expanded Word Database

Significantly increase every category.

Requirements:

- substantially more words per category
- balanced difficulty
- improved clue quality
- category consistency

---

## Anti-Repetition System

Implement history-aware selection.

Requirement:

The same word should not appear within approximately the previous 100 rounds for a given lobby/profile history (configurable).

Do not rely on simple random selection.

Design the selector so future weighting algorithms can be added.

---

# Architecture Expectations

Avoid tightly coupling gameplay logic.

Separate:

- UI
- networking
- state
- persistence
- gameplay rules

Gameplay rules should be extensible so additional roles and modes can be added without rewriting core systems.

---

# Deliverables

The implementation should include:

- fully implemented features
- migrations
- backend changes
- frontend updates
- reusable components
- documentation updates
- tests where appropriate
- configuration changes
- performance improvements

No placeholder implementations.

No TODO stubs.

No mock logic unless explicitly required.

---

# Acceptance Criteria

The update will be considered complete only if:

- all listed features are fully functional
- no existing functionality is broken
- online gameplay remains stable
- mobile battery usage is significantly improved
- networking remains responsive under load
- the implementation is modular and maintainable
- code quality meets production standards
- future expansion (additional roles, game modes, statistics, cosmetics, and networking improvements) can be implemented without major architectural rewrites

The agent should treat this document as a production implementation specification and make engineering decisions consistent with shipping a polished, scalable commercial release rather than the minimum implementation necessary to satisfy the feature list.