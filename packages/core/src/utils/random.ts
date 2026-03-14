/**
 * Deterministic random utilities used throughout the game engine.
 * All functions are pure — no hidden state.
 */

/** Returns a random integer in the range [min, max] inclusive. */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** Returns a new array with the elements shuffled (Fisher-Yates). */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    const tmp = a[i]!
    a[i] = a[j]!
    a[j] = tmp
  }
  return a
}

/** Picks a single random element from a non-empty array. */
export function pickRandom<T>(arr: T[]): T {
  if (arr.length === 0) throw new Error('Cannot pick from empty array')
  return arr[randomInt(0, arr.length - 1)]!
}

/** Returns n unique random elements from arr, without replacement. */
export function pickN<T>(arr: T[], n: number): T[] {
  if (n > arr.length) throw new Error('n exceeds array length')
  return shuffle(arr).slice(0, n)
}
