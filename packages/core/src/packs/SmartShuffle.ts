/**
 * SmartShuffle — deck-of-cards word selector that prevents repeats.
 *
 * Behaviour: every word in the pool appears exactly once before any word repeats.
 * When the pool is exhausted, the used words are reshuffled into a new pool.
 *
 * Inputs:  words[] — the full word list for a category
 * Outputs: next() → next unique (within the cycle) word
 * Edge cases:
 *   - Single-word list will always return the same word (only option)
 *   - Empty list throws on construction
 */
import { shuffle } from '../utils/random'
import type { WordEntry } from '../types/packs'

export class SmartShuffle {
  private pool: WordEntry[]
  private used: WordEntry[] = []

  constructor(private readonly words: WordEntry[]) {
    if (words.length === 0) throw new Error('Word list must not be empty')
    this.pool = shuffle([...words])
  }

  next(): WordEntry {
    if (this.pool.length === 0) {
      this.pool = shuffle(this.used)
      this.used = []
    }

    const word = this.pool.pop()!
    this.used.push(word)
    return word
  }

  /** Remaining words in the current cycle before a repeat could occur. */
  get remaining(): number {
    return this.pool.length
  }
}
