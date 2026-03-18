// Game phase state machine: IDLE → SETUP → ROLE_REVEAL → DISCUSSION → VOTING → RESULTS
export type GamePhase =
  | 'IDLE'
  | 'SETUP'
  | 'ROLE_REVEAL'
  | 'DISCUSSION'
  | 'VOTING'
  | 'RESULTS'

export type PlayerRole = 'CREWMATE' | 'IMPOSTOR'

export interface Player {
  id: string
  name: string
  avatar?: string
  emoji?: string
  color?: string
  score: number
  isEliminated: boolean
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
  players: PlayerWithRole[]
  /** Map of voterId → targetId */
  votes: Record<string, string>
  startedAt: number
  discussionDuration: number
}

export interface GameConfig {
  playerCount: number
  /** Must be >= 1 and < playerCount */
  impostorCount: number
  selectedCategories: string[]
  /** Discussion timer in seconds */
  discussionDuration: number
  maxRounds: number
  mutators?: {
    bluffMode?: boolean | undefined
    anonymousVoting?: boolean | undefined
  }
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
}
