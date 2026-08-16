import { describe, expect, it } from 'vitest'
import { ALL_WORDS, CATEGORIES } from '../data/wordRegistry'

type Entry = (typeof ALL_WORDS)[number]

describe('pack data quality', () => {
  it('keeps every category at 120+ words with three valid hints each', () => {
    expect(ALL_WORDS.length).toBeGreaterThan(0)

    const byCategory = new Map<string, Entry[]>()
    for (const entry of ALL_WORDS) {
      const bucket = byCategory.get(entry.category) ?? []
      bucket.push(entry)
      byCategory.set(entry.category, bucket)
    }

    // Every declared category is actually represented in the assembled word list.
    for (const category of CATEGORIES) {
      expect(byCategory.has(category), `missing category: ${category}`).toBe(true)
    }

    for (const [category, entries] of byCategory) {
      expect(entries.length, `${category} word count`).toBeGreaterThanOrEqual(120)

      for (const entry of entries) {
        expect(entry.hints, `${category}: ${entry.word} hint count`).toHaveLength(3)
        expect(
          entry.hints.every((hint) => typeof hint === 'string' && hint.trim().length > 0),
          `${category}: ${entry.word} has an empty hint`,
        ).toBe(true)
      }
    }
  })

  it('has globally unique word ids', () => {
    const ids = new Set<string>()
    for (const entry of ALL_WORDS) {
      expect(ids.has(entry.id), `duplicate id: ${entry.id}`).toBe(false)
      ids.add(entry.id)
    }
  })
})
