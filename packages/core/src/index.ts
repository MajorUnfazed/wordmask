// Public API for @impostor/core

// Core engine (event-driven)
export { GameEngine, createInitialState } from './engine/GameEngine'
export { gameReducer } from './engine/gameReducer'
export type { GameEvent } from './engine/gameEvents'

// Game systems
export * from './systems/RoleAssigner'
export * from './systems/VoteCounter'
export * from './systems/ScoreCalculator'
export * from './systems/ReplacementBot'
export * from './live/LiveStateStore'

// Word packs
export * from './packs/index'
export * from './packs/community'

// Utilities
export * from './utils/random'

// Types
export type * from './types/game'
export type * from './types/packs'

// Backward compatibility - pure function exports
export {
  setupGame,
  startRoleReveal,
  startDiscussion,
  startVoting,
  castVote,
  resolveRound,
  resetToIdle,
} from './engine/GameEngine'
