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
import type { PlayerWithRole, RoundResult } from '../types/game'
import { countVotes } from './VoteCounter'

const POINTS = {
  IMPOSTOR_ESCAPES: 10,
  CORRECT_VOTE: 3,
  WRONG_VOTE: -1,
  JESTER_VOTED_OUT: 12,
} as const

/**
 * Computes per-player score deltas from the raw votes map (voterId → targetId).
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
