/**
 * VoteCounter — tallies player votes and determines who (if anyone) is eliminated.
 *
 * Inputs:  votes Record<voterId, targetId>
 * Outputs: VoteResult with eliminatedPlayerId (null on tie), tally, and isTie flag
 * Edge cases:
 *   - Empty votes → no elimination, isTie: false
 *   - Multiple candidates tied at max votes → isTie: true, eliminated: null
 */
import type { VoteResult } from '../types/game'

export function countVotes(votes: Record<string, string>): VoteResult {
  const tally: Record<string, number> = {}

  for (const targetId of Object.values(votes)) {
    tally[targetId] = (tally[targetId] ?? 0) + 1
  }

  const entries = Object.entries(tally)

  if (entries.length === 0) {
    return { eliminatedPlayerId: null, votes: tally, isTie: false }
  }

  const maxVotes = Math.max(...entries.map(([, v]) => v))
  const topCandidates = entries.filter(([, v]) => v === maxVotes)
  const isTie = topCandidates.length > 1

  return {
    eliminatedPlayerId: isTie ? null : (topCandidates[0]?.[0] ?? null),
    votes: tally,
    isTie,
  }
}
