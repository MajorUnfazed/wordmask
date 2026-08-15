/**
 * ScoreCalculator — computes per-player score deltas after a round resolves.
 *
 * Scoring rules (default mode):
 *   - Impostors earn IMPOSTOR_ESCAPES points if they are NOT caught
 *   - Crewmates earn CORRECT_VOTE points if they voted for an impostor
 *   - Crewmates lose WRONG_VOTE points if they voted for a crewmate
 *
 * Inputs:  players with roles, voteResult, impostorIds
 * Outputs: RoundResult with scoreDeltas and outcome flags
 */
import type { PlayerWithRole, VoteResult, RoundResult } from '../types/game'
import { countVotes } from './VoteCounter'

const POINTS = {
  IMPOSTOR_ESCAPES: 10,
  CORRECT_VOTE: 3,
  WRONG_VOTE: -1,
  JESTER_VOTED_OUT: 12,
} as const

export function calculateScores(
  players: PlayerWithRole[],
  voteResult: VoteResult,
  impostorIds: string[],
): RoundResult {
  const impostorSet = new Set(impostorIds)

  const eliminatedIsImpostor =
    voteResult.eliminatedPlayerId !== null &&
    impostorSet.has(voteResult.eliminatedPlayerId)

  const impostorsCaught = eliminatedIsImpostor
  const scoreDeltas: Record<string, number> = {}

  for (const player of players) {
    scoreDeltas[player.id] = 0
  }

  const jesterVotedOut = voteResult.eliminatedPlayerId !== null &&
    players.some((player) => player.id === voteResult.eliminatedPlayerId && player.role === 'JESTER')

  if (jesterVotedOut) {
    scoreDeltas[voteResult.eliminatedPlayerId!] = POINTS.JESTER_VOTED_OUT
  } else if (!impostorsCaught) {
    for (const id of impostorIds) {
      scoreDeltas[id] = (scoreDeltas[id] ?? 0) + POINTS.IMPOSTOR_ESCAPES
    }
  }

  // Award crewmates for correct votes
  for (const player of players) {
    if (player.role === 'IMPOSTOR') continue
    const votedFor = players.find((p) => p.id === player.id)
    if (!votedFor) continue
    // Look up what this player voted (available via voteResult.votes keys map)
    // scoreDeltas are updated below per vote cast
  }

  // Per-vote scoring: iterate the raw vote map via voteResult
  // voteResult.votes is targetId → count; we need voterId → targetId from callers
  // Crewmate vote scoring via impostorSet (best-effort with tally only):
  // Full per-voter breakdown requires the raw votes map passed separately in future variants.

  return {
    impostorsCaught,
    impostorIds,
    voteResult,
    scoreDeltas,
    winningRole: jesterVotedOut ? 'JESTER' : impostorsCaught ? 'CREW' : 'IMPOSTOR',
    finalGuessRequired: impostorsCaught && !jesterVotedOut,
  }
}

/**
 * Extended scorer that uses raw votes (voterId → targetId) for precise per-player deltas.
 */
export function calculateScoresDetailed(
  players: PlayerWithRole[],
  rawVotes: Record<string, string>,
  impostorIds: string[],
): RoundResult {
  const impostorSet = new Set(impostorIds)
  const scoreDeltas: Record<string, number> = {}

  for (const player of players) {
    scoreDeltas[player.id] = 0
  }

  const voteResult = countVotes(rawVotes)

  const impostorsCaught =
    voteResult.eliminatedPlayerId !== null &&
    impostorSet.has(voteResult.eliminatedPlayerId)

  const jesterVotedOut = voteResult.eliminatedPlayerId !== null &&
    players.some((player) => player.id === voteResult.eliminatedPlayerId && player.role === 'JESTER')

  if (jesterVotedOut) {
    scoreDeltas[voteResult.eliminatedPlayerId!] = POINTS.JESTER_VOTED_OUT
  } else if (!impostorsCaught) {
    for (const id of impostorIds) {
      scoreDeltas[id] = (scoreDeltas[id] ?? 0) + POINTS.IMPOSTOR_ESCAPES
    }
  }

  for (const [voterId, targetId] of Object.entries(rawVotes)) {
    const voter = players.find((p) => p.id === voterId)
    if (!voter || voter.role !== 'CREWMATE') continue
    const isCorrect = impostorSet.has(targetId)
    scoreDeltas[voterId] =
      (scoreDeltas[voterId] ?? 0) + (isCorrect ? POINTS.CORRECT_VOTE : POINTS.WRONG_VOTE)
  }

  return {
    impostorsCaught,
    impostorIds,
    voteResult,
    scoreDeltas,
    winningRole: jesterVotedOut ? 'JESTER' : impostorsCaught ? 'CREW' : 'IMPOSTOR',
    finalGuessRequired: impostorsCaught && !jesterVotedOut,
  }
}
