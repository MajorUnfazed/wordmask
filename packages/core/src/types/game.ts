// Game phase state machine: IDLE → SETUP → ROLE_REVEAL → DISCUSSION → VOTING → RESULTS
export type GamePhase =
  | 'IDLE'
  | 'SETUP'
  | 'ROLE_REVEAL'
  | 'DISCUSSION'
  | 'VOTING'
  | 'FINAL_IMPOSTOR_GUESS'
  | 'RESULTS'

export type PlayerRole = 'CREWMATE' | 'IMPOSTOR' | 'JESTER'
export type GameMode = 'STANDARD' | 'PASS_THE_PHONE'

/**
 * Difficulty controls how much the impostor's single hint reveals about the
 * secret word. Curated packs author exactly three hints per word as an ordered
 * difficulty triple that maps directly to these tiers:
 *   CRYPTIC   → hint[0]  (vaguest — hardest for the impostor to blend in)
 *   BALANCED  → hint[1]  (calibrated default)
 *   REVEALING → hint[2]  (most helpful — easiest for the impostor)
 */
export type Difficulty = 'REVEALING' | 'BALANCED' | 'CRYPTIC'

export interface Player {
  id: string
  name: string
  avatar?: string
  score: number
  isEliminated: boolean
  isBot?: boolean
  isSpectator?: boolean
}

export interface PlayerWithRole extends Player {
  role: PlayerRole
}

export interface Round {
  id: string
  word: string
  hint: string
  category: string
  impostorIds: string[]
  jesterIds: string[]
  players: PlayerWithRole[]
  /** Map of voterId → targetId */
  votes: Record<string, string>
  startedAt: number
  discussionDuration: number
  finalGuess?: { impostorId: string; guess: string | null; correct?: boolean }
  passThePhoneImpostorCaught?: boolean
}

export interface GameConfig {
  playerCount: number
  /** Must be >= 1 and < playerCount */
  impostorCount: number
  jesterCount?: number
  mode?: GameMode
  wordHistoryLimit?: number
  selectedCategories: string[]
  /** Discussion timer in seconds */
  discussionDuration: number
  maxRounds: number
  /** How revealing the impostor's hint is. Defaults to BALANCED. */
  difficulty?: Difficulty
}

export interface GameState {
  phase: GamePhase
  config: GameConfig
  players: Player[]
  rounds: Round[]
  currentRound: Round | null
  /** Cumulative scores: playerId → total points */
  scores: Record<string, number>
  usedWordIds: Set<string>
}

export interface VoteResult {
  /** null when there is a tie */
  eliminatedPlayerId: string | null
  /** Map of targetId → vote count */
  votes: Record<string, number>
  isTie: boolean
}

export interface RoundResult {
  impostorsCaught: boolean
  impostorIds: string[]
  voteResult: VoteResult
  /** Score change per player for this round */
  scoreDeltas: Record<string, number>
  winningRole?: PlayerRole | 'CREW'
  finalGuessRequired?: boolean
  finalGuessSucceeded?: boolean
}
