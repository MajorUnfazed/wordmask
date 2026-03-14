/**
 * gameReducer — pure reducer that processes GameEvents and returns new state.
 * All state transitions are enforced here.
 */
import type { GameState, Round, RoundResult } from '../types/game'
import type { GameEvent } from './gameEvents'
import { assignRoles, getImpostorIds } from '../systems/RoleAssigner'
import { calculateScoresDetailed } from '../systems/ScoreCalculator'
import { pickRandom } from '../utils/random'
import { ALL_WORDS } from '../packs/data/wordRegistry'

export function gameReducer(state: GameState, event: GameEvent): GameState {
  switch (event.type) {
    case 'GAME_SETUP':
      return handleGameSetup(state, event)

    case 'PLAYER_JOINED':
      return handlePlayerJoined(state, event)

    case 'PLAYER_LEFT':
      return handlePlayerLeft(state, event)

    case 'ROUND_STARTED':
      return handleRoundStarted(state, event)

    case 'ROLE_REVEAL_COMPLETE':
      return handleRoleRevealComplete(state)

    case 'DISCUSSION_STARTED':
      return handleDiscussionStarted(state)

    case 'VOTING_STARTED':
      return handleVotingStarted(state)

    case 'VOTE_CAST':
      return handleVoteCast(state, event)

    case 'VOTING_FINISHED':
      return handleVotingFinished(state)

    case 'ROUND_RESOLVED':
      return handleRoundResolved(state)

    case 'GAME_RESET':
      return handleGameReset(state)

    default:
      return state
  }
}

// ========== Event Handlers ==========

function handleGameSetup(
  state: GameState,
  event: Extract<GameEvent, { type: 'GAME_SETUP' }>,
): GameState {
  if (state.phase !== 'IDLE') {
    throw new Error(`Cannot setup from phase ${state.phase}`)
  }

  const scores: Record<string, number> = {}
  for (const p of event.players) scores[p.id] = 0

  return {
    ...state,
    phase: 'SETUP',
    config: event.config,
    players: event.players,
    rounds: [],
    scores,
    usedWordIds: new Set<string>(),
  }
}

function handlePlayerJoined(
  state: GameState,
  event: Extract<GameEvent, { type: 'PLAYER_JOINED' }>,
): GameState {
  if (state.phase !== 'IDLE' && state.phase !== 'SETUP') {
    throw new Error('Can only join during IDLE or SETUP phase')
  }

  if (state.players.some((p) => p.id === event.player.id)) {
    return state // Player already exists
  }

  return {
    ...state,
    players: [...state.players, event.player],
    scores: { ...state.scores, [event.player.id]: 0 },
  }
}

function handlePlayerLeft(
  state: GameState,
  event: Extract<GameEvent, { type: 'PLAYER_LEFT' }>,
): GameState {
  return {
    ...state,
    players: state.players.filter((p) => p.id !== event.playerId),
  }
}

function handleRoundStarted(
  state: GameState,
  event: Extract<GameEvent, { type: 'ROUND_STARTED' }>,
): GameState {
  if (state.phase !== 'SETUP' && state.phase !== 'RESULTS') {
    throw new Error(`Cannot start round from phase ${state.phase}`)
  }

  const selectedCategories =
    event.selectedCategories.length > 0 ? event.selectedCategories : state.config.selectedCategories
  const categoryWords = ALL_WORDS.filter((entry) => selectedCategories.includes(entry.category))

  if (categoryWords.length === 0) {
    throw new Error('No words available for the selected categories')
  }

  const availableWords = categoryWords.filter((entry) => !state.usedWordIds.has(entry.id))
  const wordPool = availableWords.length > 0 ? availableWords : categoryWords
  const usedWordIds = availableWords.length > 0 ? new Set(state.usedWordIds) : new Set<string>()
  const entry = pickRandom(wordPool)

  const playersWithRoles = assignRoles(state.players, state.config.impostorCount)
  const impostorIds = getImpostorIds(playersWithRoles)
  const hint = pickRandom(entry.hints)
  usedWordIds.add(entry.id)

  const round: Round = {
    id: crypto.randomUUID(),
    word: entry.word,
    hint,
    category: entry.category,
    impostorIds,
    players: playersWithRoles,
    votes: {},
    startedAt: Date.now(),
    discussionDuration: state.config.discussionDuration,
  }

  return {
    ...state,
    phase: 'ROLE_REVEAL',
    currentRound: round,
    usedWordIds,
  }
}

function handleRoleRevealComplete(state: GameState): GameState {
  if (state.phase !== 'ROLE_REVEAL') {
    throw new Error(`Cannot complete role reveal from phase ${state.phase}`)
  }
  // For now, transition directly to discussion
  return { ...state, phase: 'DISCUSSION' }
}

function handleDiscussionStarted(state: GameState): GameState {
  if (state.phase !== 'ROLE_REVEAL') {
    throw new Error(`Cannot start discussion from phase ${state.phase}`)
  }
  return { ...state, phase: 'DISCUSSION' }
}

function handleVotingStarted(state: GameState): GameState {
  if (state.phase !== 'DISCUSSION') {
    throw new Error(`Cannot start voting from phase ${state.phase}`)
  }
  return { ...state, phase: 'VOTING' }
}

function handleVoteCast(
  state: GameState,
  event: Extract<GameEvent, { type: 'VOTE_CAST' }>,
): GameState {
  if (state.phase !== 'VOTING') {
    throw new Error('Votes can only be cast during VOTING phase')
  }
  if (!state.currentRound) {
    throw new Error('No active round')
  }

  const updatedRound: Round = {
    ...state.currentRound,
    votes: {
      ...state.currentRound.votes,
      [event.voterId]: event.targetId,
    },
  }

  return { ...state, currentRound: updatedRound }
}

function handleVotingFinished(state: GameState): GameState {
  if (state.phase !== 'VOTING') {
    throw new Error('Cannot finish voting outside VOTING phase')
  }
  // Voting finished, ready to resolve
  return state
}

function handleRoundResolved(state: GameState): GameState {
  if (state.phase !== 'VOTING') {
    throw new Error('Cannot resolve outside VOTING phase')
  }
  if (!state.currentRound) {
    throw new Error('No active round')
  }

  const result = calculateScoresDetailed(
    state.currentRound.players,
    state.currentRound.votes,
    state.currentRound.impostorIds,
  )

  const newScores = { ...state.scores }
  for (const [id, delta] of Object.entries(result.scoreDeltas)) {
    newScores[id] = (newScores[id] ?? 0) + delta
  }

  const completedRound: Round = { ...state.currentRound }

  return {
    ...state,
    phase: 'RESULTS',
    rounds: [...state.rounds, completedRound],
    scores: newScores,
    currentRound: null,
  }
}

function handleGameReset(state: GameState): GameState {
  return {
    phase: 'IDLE',
    config: state.config,
    players: state.players,
    rounds: [],
    currentRound: null,
    scores: Object.fromEntries(state.players.map((p) => [p.id, 0])),
    usedWordIds: new Set<string>(),
  }
}
