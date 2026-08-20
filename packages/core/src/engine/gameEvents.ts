/**
 * GameEvents — typed event system for the game engine.
 * Each event represents a discrete action that modifies game state.
 */
import type { GameConfig, Player } from '../types/game'
import type { WordEntry } from '../types/packs'

export type GameEvent =
  | { type: 'GAME_SETUP'; config: GameConfig; players: Player[] }
  | { type: 'PLAYER_JOINED'; player: Player }
  | { type: 'PLAYER_LEFT'; playerId: string }
  | {
      type: 'ROUND_STARTED'
      selectedCategories: string[]
      /**
       * Extra words merged into the built-in pool for this round only — used to make
       * custom/community packs playable. Their `category` is a synthetic token (e.g.
       * `custom:<packId>`) that must also appear in `selectedCategories` to be drawn.
       */
      extraWords?: WordEntry[]
    }
  | { type: 'ROLE_REVEAL_COMPLETE' }
  | { type: 'DISCUSSION_STARTED' }
  | { type: 'VOTING_STARTED' }
  | { type: 'VOTE_CAST'; voterId: string; targetId: string }
  | { type: 'VOTING_FINISHED' }
  | { type: 'FINAL_IMPOSTOR_GUESS_SUBMITTED'; impostorId: string; guess: string }
  | { type: 'PASS_THE_PHONE_ANSWERED'; impostorCaught: boolean }
  | { type: 'ROUND_RESOLVED' }
  | { type: 'GAME_RESET' }
