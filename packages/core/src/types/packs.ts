export interface WordEntry {
  id: string
  word: string
  category: string
  hints: string[]
  /**
   * Words from the same category that are semantically close but distinct enough
   * to reveal a mismatch during discussion. Used by Blind Impostor mode to assign
   * the impostor a near-neighbour word instead of a hint clue.
   * - Should share obvious surface traits with `word` (same domain, similar feel)
   * - Should NOT be near-synonyms — there must be a clear difference if noticed
   * - 1–3 siblings is enough; the engine picks one at random
   */
  siblings?: string[]
}

export interface WordPack {
  id: string
  name: string
  emoji: string
  description: string
  words: WordEntry[]
}
