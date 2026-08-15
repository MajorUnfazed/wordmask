# WordMask
**Full Architecture & Code Scaffold**  
v1.0 · Hackathon Edition · 2025

---

# 1. Project Overview

**WordMask** is a social deduction party game with two modes:

- **Offline Mode** – pass-the-phone
- **Online Mode** – multi-device using Supabase realtime

Platforms:

- Web (React + Vite + TypeScript)
- Android (Expo React Native)

Game logic is shared through a **core TypeScript engine** used by both platforms.

---

# 2. Monorepo Folder Structure

The project uses a **pnpm workspace monorepo** with three main packages.

```
impostor-words/
├── packages/
│   ├── core/                   # Shared game logic
│   │   ├── src/
│   │   │   ├── engine/
│   │   │   │   ├── GameEngine.ts
│   │   │   │   ├── RoleAssigner.ts
│   │   │   │   ├── VoteCounter.ts
│   │   │   │   └── ScoreCalculator.ts
│   │   │   ├── packs/
│   │   │   │   ├── index.ts
│   │   │   │   ├── SmartShuffle.ts
│   │   │   │   └── data/
│   │   │   │       ├── food.json
│   │   │   │       ├── animals.json
│   │   │   │       ├── movies.json
│   │   │   │       ├── technology.json
│   │   │   │       ├── f1.json
│   │   │   │       ├── memes.json
│   │   │   │       └── ... (16 packs total)
│   │   │   ├── types/
│   │   │   │   ├── game.ts
│   │   │   │   └── packs.ts
│   │   │   └── utils/
│   │   │       └── random.ts
│   │   └── package.json
│   │
│   ├── web/                    # React + Vite client
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── router.tsx
│   │   │   ├── store/
│   │   │   │   ├── gameStore.ts
│   │   │   │   └── lobbyStore.ts
│   │   │   ├── screens/
│   │   │   │   ├── HomeScreen.tsx
│   │   │   │   ├── ModeSelectScreen.tsx
│   │   │   │   ├── OfflineSetupScreen.tsx
│   │   │   │   ├── RoleRevealScreen.tsx
│   │   │   │   ├── DiscussionScreen.tsx
│   │   │   │   ├── VotingScreen.tsx
│   │   │   │   ├── ResultsScreen.tsx
│   │   │   │   ├── LobbyScreen.tsx
│   │   │   │   └── CategorySelectScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── GlowButton.tsx
│   │   │   │   │   ├── GlassCard.tsx
│   │   │   │   │   ├── AnimatedBackground.tsx
│   │   │   │   │   ├── ParticleField.tsx
│   │   │   │   │   └── CountdownTimer.tsx
│   │   │   │   ├── game/
│   │   │   │   │   ├── RoleCard.tsx
│   │   │   │   │   ├── PlayerAvatar.tsx
│   │   │   │   │   ├── VoteBar.tsx
│   │   │   │   │   ├── SuspicionGraph.tsx
│   │   │   │   │   └── ScoreBoard.tsx
│   │   │   │   └── lobby/
│   │   │   │       ├── LobbyCode.tsx
│   │   │   │       └── PlayerList.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useSupabase.ts
│   │   │   │   ├── useLobby.ts
│   │   │   │   ├── useGameRound.ts
│   │   │   │   └── useHaptics.ts
│   │   │   ├── lib/
│   │   │   │   ├── supabase.ts
│   │   │   │   └── sounds.ts
│   │   │   └── styles/
│   │   │       ├── globals.css
│   │   │       └── tokens.css
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── mobile/                 # Expo React Native app
│       ├── app/
│       │   ├── _layout.tsx
│       │   ├── index.tsx
│       │   ├── (game)/
│       │   │   ├── offline-setup.tsx
│       │   │   ├── role-reveal.tsx
│       │   │   ├── discussion.tsx
│       │   │   ├── voting.tsx
│       │   │   └── results.tsx
│       │   └── (lobby)/
│       │       ├── create.tsx
│       │       ├── join.tsx
│       │       └── [code].tsx
│       ├── components/
│       │   ├── RoleCard.native.tsx
│       │   └── HapticButton.tsx
│       └── package.json
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_lobbies.sql
│   │   ├── 002_players.sql
│   │   ├── 003_rounds.sql
│   │   └── 004_votes.sql
│
├── pnpm-workspace.yaml
└── package.json
```

---

# 3. Supabase Database Schema

The multiplayer state is stored in four tables:

- `lobbies`
- `players`
- `rounds`
- `votes`

Row Level Security (RLS) protects sensitive fields like:

- `rounds.word`
- `rounds.impostor_ids`

Players only access their role through the RPC function:

```
get_my_role(round_id)
```

This prevents cheating via network inspection.

---

# 4. Game State Machine

```
IDLE
↓
SETUP
↓
ROLE_REVEAL
↓
DISCUSSION
↓
VOTING
↓
RESULTS
```

Transitions occur through:

- host actions
- timers
- vote completion

---

# 5. RoleCard Interaction

The most important UX moment.

| Event | Animation |
|------|-----------|
Idle | subtle glow pulse |
Press | card flips with rotateY |
Hold | word or hint visible |
Release | card flips back |

Implementation:

- CSS perspective
- rotateY transform
- Framer Motion animation
- background blur
- haptic feedback on mobile

---

# 6. Smart Shuffle Algorithm

Prevents word repetition.

```ts
export class SmartShuffle {
  private used = new Set<string>()
  private pool: string[]
  private reserve: string[] = []

  constructor(private words: string[]) {
    this.pool = this.shuffle([...words])
  }

  next(): string {
    if (this.pool.length === 0) {
      this.pool = this.shuffle(this.reserve)
      this.reserve = []
      this.used.clear()
    }

    const word = this.pool.pop()!
    this.used.add(word)
    this.reserve.push(word)

    return word
  }
}
```

Acts like a deck of cards — every word appears once before repeats.

---

# 7. Supabase Realtime Architecture

Two channels per lobby:

```
lobby:{code}
round:{lobby_id}
```

Realtime events include:

| Event | Effect |
|------|--------|
player join | update player list |
round start | show role reveal |
vote cast | animate vote bars |
results ready | show results screen |

Clients remain reactive and subscribe to DB updates.

---

# 8. Word Pack Format

Each category contains 100+ words.

Example:

```json
{
  "id": "food",
  "name": "Food",
  "emoji": "🍔",
  "description": "Cuisines and dishes",
  "words": [
    { "word": "Pizza", "hint": "Italian baked dish" },
    { "word": "Sushi", "hint": "Japanese rice rolls" },
    { "word": "Croissant", "hint": "Flaky French pastry" }
  ]
}
```

Total packs:

- Everyday
- Animals
- Food
- Movies
- Technology
- Science
- Geography
- Professions
- Internet Culture
- Memes
- Campus Life
- Random Objects
- Party Mode
- Sports
- Gaming
- F1 Motorsport

≈ 1800 total words.

---

# 9. Offline Mode Flow

1. Setup screen
2. Category selection
3. Role reveal
4. Discussion timer
5. Voting
6. Results
7. Next round

All state stored locally.

---

# 10. Online Mode Flow

1. Host creates lobby
2. Players join via code
3. Host starts round
4. Roles assigned server-side
5. Discussion timer
6. Players vote
7. Results broadcast

---

# 11. Supabase RPC Functions

| Function | Purpose |
|--------|--------|
create_lobby | create lobby |
join_lobby | add player |
start_round | assign roles |
get_my_role | secure role fetch |
submit_vote | record vote |
end_game | finalize scores |

---

# 12. Design System Tokens

```
:root {
  --color-void: #0A0A14;
  --color-accent: #7C3AED;
  --color-danger: #EF4444;

  --font-display: "Cinzel Decorative";
  --font-body: "DM Sans";

  --duration-normal: 300ms;
  --duration-slow: 600ms;
}
```

All colors and spacing must use tokens.

---

# 13. Setup Instructions

```bash
git clone repo
pnpm install

npx supabase db push

pnpm --filter web dev
pnpm --filter mobile start
```

---

# 14. Recommended Build Order

| Phase | Task |
|------|------|
1 | core engine |
2 | offline web mode |
3 | Supabase schema |
4 | multiplayer lobby |
5 | animations |
6 | mobile version |
7 | word packs |

Offline mode ensures a demoable build early.

---

# 15. Game Variants

Variants supported:

- Double Impostor
- Bluff Mode
- Silent Round
- Hidden Ally Mode

---

---

# 16. LiveStateStore & Ephemeral State Architecture (v2)

To maintain ultra-low latency and battery efficiency during live gameplay, WordMask decouples **durable state** (stored in PostgreSQL/Supabase DB) from **ephemeral state** (stored in-memory or transient storage).

### State Classification

| State Type | Storage Location | Examples |
|------------|------------------|----------|
| **Durable** | Supabase DB (`lobbies`, `players`, `rounds`, `profiles`) | Player accounts, lobby codes, round outcomes, cumulative scores, word history |
| **Ephemeral** | `LiveStateStore` (Memory / Realtime Presence / Redis) | Player connected status, typing indicators, live vote progress, suspicion graphs, timer sync |

### LiveStateStore Interface (`@impostor/core`)

```typescript
export interface LivePlayerState {
  playerId: string
  connected: boolean
  typing: boolean
  suspicion: number
  ready: boolean
  updatedAt: number
}

export interface LiveRoundState {
  lobbyId: string
  roundId: string | null
  phase: string
  endsAt: number | null
  players: Record<string, LivePlayerState>
}

export interface LiveStateStore {
  read(lobbyId: string): Promise<LiveRoundState | null>
  write(state: LiveRoundState): Promise<void>
  remove(lobbyId: string): Promise<void>
}
```

Implementation details:
- **Client/Dev**: `MemoryLiveStateStore` stores transient state in memory.
- **Production**: Supabase Realtime Presence or a Redis/Edge KV adapter implements `LiveStateStore` without altering core engine game rules.

---

**WordMask Architecture Document**  
Hackathon Project v2.0
