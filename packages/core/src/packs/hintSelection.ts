import type { Difficulty } from '../types/game'
import { pickRandom } from '../utils/random'

/**
 * Chooses the single hint the impostor sees, honouring the requested difficulty.
 *
 * Curated packs ship exactly three hints per word, authored as an ordered
 * difficulty triple:
 *   index 0 = CRYPTIC   (vaguest)
 *   index 1 = BALANCED  (calibrated default)
 *   index 2 = REVEALING (most helpful)
 * For those, difficulty maps straight to the matching slot — deterministic, no
 * randomness, so the tier the player picked is exactly what they get.
 *
 * Custom/community packs carry an arbitrary number of hints with no tier
 * ordering, so any list whose length isn't 3 falls back to a random pick — the
 * historical behaviour — which keeps every existing saved pack working.
 *
 * Always returns a non-empty hint or throws on an empty list (matching pickRandom).
 */
export function selectHint(hints: string[], difficulty: Difficulty = 'BALANCED'): string {
  if (hints.length === 0) {
    throw new Error('Cannot select a hint from an empty list')
  }
  if (hints.length !== 3) {
    return pickRandom(hints)
  }
  const index = difficulty === 'CRYPTIC' ? 0 : difficulty === 'REVEALING' ? 2 : 1
  return hints[index]!
}
