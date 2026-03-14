/**
 * GameEngine — event-driven game engine for Impostor Words.
 *
 * Architecture:
 *   - Events represent discrete actions
 *   - Reducer processes events and returns new state
 *   - Engine class wraps reducer and provides convenient API
 *
 * State transitions:
 *   IDLE → SETUP → ROLE_REVEAL → DISCUSSION → VOTING → RESULTS → (repeat or IDLE)
 */
import type { GameState, GameConfig, Player, RoundResult } from '../types/game'
import type { GameEvent } from './gameEvents'
import { gameReducer } from './gameReducer'
import { calculateScoresDetailed } from '../systems/ScoreCalculator'

/**
 * GameEngine — stateful wrapper around the reducer.
 * Maintains current state and dispatches events.
 */
export class GameEngine {
  private state: GameState

  constructor(initialState?: GameState) {
    this.state = initialState ?? createInitialState()
  }

  /** Get current game state (immutable). */
  getState(): Readonly<GameState> {
    return this.state
  }

  /** Dispatch an event and update state. */
  dispatch(event: GameEvent): void {
    this.state = gameReducer(this.state, event)
  }

  // ========== Convenience Methods ==========

  setupGame(config: GameConfig, players: Player[]): void {
    this.dispatch({ type: 'GAME_SETUP', config, players })
  }

  addPlayer(player: Player): void {
    this.dispatch({ type: 'PLAYER_JOINED', player })
  }

  removePlayer(playerId: string): void {
    this.dispatch({ type: 'PLAYER_LEFT', playerId })
  }

  startRound(selectedCategories: string[]): void {
    this.dispatch({ type: 'ROUND_STARTED', selectedCategories })
  }

  completeRoleReveal(): void {
    this.dispatch({ type: 'ROLE_REVEAL_COMPLETE' })
  }

  startDiscussion(): void {
    this.dispatch({ type: 'DISCUSSION_STARTED' })
  }

  startVoting(): void {
    this.dispatch({ type: 'VOTING_STARTED' })
  }

  castVote(voterId: string, targetId: string): void {
    this.dispatch({ type: 'VOTE_CAST', voterId, targetId })
  }

  finishVoting(): void {
    this.dispatch({ type: 'VOTING_FINISHED' })
  }

  resolveRound(): RoundResult | null {
    if (!this.state.currentRound) return null

    const result = calculateScoresDetailed(
      this.state.currentRound.players,
      this.state.currentRound.votes,
      this.state.currentRound.impostorIds,
    )

    this.dispatch({ type: 'ROUND_RESOLVED' })
    return result
  }

  resetGame(): void {
    this.dispatch({ type: 'GAME_RESET' })
  }
}

// ========== Pure Helper Functions (for backward compatibility) ==========

export function createInitialState(): GameState {
  return {
    phase: 'IDLE',
    config: {
      playerCount: 4,
      impostorCount: 1,
      selectedCategories: [],
      discussionDuration: 60,
      maxRounds: 5,
    },
    players: [],
    rounds: [],
    currentRound: null,
    scores: {},
    usedWordIds: new Set<string>(),
  }
}

export function setupGame(
  state: GameState,
  config: GameConfig,
  players: Player[],
): GameState {
  return gameReducer(state, { type: 'GAME_SETUP', config, players })
}

export function startRoleReveal(
  state: GameState,
  selectedCategories: string[],
): GameState {
  return gameReducer(state, {
    type: 'ROUND_STARTED',
    selectedCategories,
  })
}

export function startDiscussion(state: GameState): GameState {
  return gameReducer(state, { type: 'DISCUSSION_STARTED' })
}

export function startVoting(state: GameState): GameState {
  return gameReducer(state, { type: 'VOTING_STARTED' })
}

export function castVote(
  state: GameState,
  voterId: string,
  targetId: string,
): GameState {
  return gameReducer(state, { type: 'VOTE_CAST', voterId, targetId })
}

export function resolveRound(
  state: GameState,
): { state: GameState; result: RoundResult } {
  if (!state.currentRound) throw new Error('No active round')

  const result = calculateScoresDetailed(
    state.currentRound.players,
    state.currentRound.votes,
    state.currentRound.impostorIds,
  )

  const newState = gameReducer(state, { type: 'ROUND_RESOLVED' })

  return { state: newState, result }
}

export function resetToIdle(state: GameState): GameState {
  return gameReducer(state, { type: 'GAME_RESET' })
}
