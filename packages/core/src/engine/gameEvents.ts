/**
 * GameEvents — typed event system for the game engine.
 * Each event represents a discrete action that modifies game state.
 */
import type { GameConfig, Player } from '../types/game'

export type GameEvent =
  | { type: 'GAME_SETUP'; config: GameConfig; players: Player[] }
  | { type: 'PLAYER_JOINED'; player: Player }
  | { type: 'PLAYER_LEFT'; playerId: string }
  | { type: 'ROUND_STARTED'; selectedCategories: string[] }
  | { type: 'ROLE_REVEAL_COMPLETE' }
  | { type: 'DISCUSSION_STARTED' }
  | { type: 'VOTING_STARTED' }
  | { type: 'VOTE_CAST'; voterId: string; targetId: string }
  | { type: 'VOTING_FINISHED' }
  | { type: 'ROUND_RESOLVED' }
  | { type: 'GAME_RESET' }
