import { describe, expect, it } from 'vitest'
import type { WordEntry } from '../../types/packs'
import { validateEntry, validatePackEntries, BANNED_GENERIC_HINTS } from '../hintQuality'

function entry(word: string, hints: string[], category = 'Food'): WordEntry {
  return { id: `t_${word.toLowerCase()}`, word, category, hints }
}

function rules(word: string, hints: string[], category?: string): string[] {
  return validateEntry(entry(word, hints, category)).map((i) => i.rule)
}

describe('validateEntry', () => {
  it('passes a clean, well-formed triple', () => {
    expect(validateEntry(entry('Pizza', ['Italy', 'Oven', 'Pepperoni']))).toEqual([])
  })

  it('flags the wrong number of hints', () => {
    expect(rules('Pizza', ['Italy', 'Oven'])).toContain('count')
    expect(rules('Pizza', ['Italy', 'Oven', 'Pepperoni', 'Slice'])).toContain('count')
  })

  it('flags empty and over-long hints', () => {
    expect(rules('Pizza', ['   ', 'Oven', 'Pepperoni'])).toContain('empty')
    expect(rules('Pizza', ['Italy', 'Oven', 'Round thin pie'])).toContain('length')
  })

  it('flags punctuation and digits', () => {
    expect(rules('Pizza', ['Italy!', 'Oven', 'Pepperoni'])).toContain('charset')
    expect(rules('Pizza', ['Italy', 'Oven', '90s'])).toContain('charset')
  })

  it('allows internal hyphens and apostrophes', () => {
    expect(validateEntry(entry('Owl', ["Who's", 'Night', 'Hoot']))).toEqual([])
    expect(validateEntry(entry('Soda', ['Fizzy', 'Sugar-free', 'Can']))).toEqual([])
  })

  it('detects leaks including simple plurals', () => {
    expect(rules('Pizza', ['Pizza', 'Oven', 'Pepperoni'])).toContain('leak')
    expect(rules('Bean', ['Green', 'Pod', 'Beans'])).toContain('leak')
    expect(rules('Ice Cream', ['Cold', 'Cone', 'Cream'])).toContain('leak')
  })

  it('flags a hint that is just the category name', () => {
    expect(rules('Pizza', ['Food', 'Oven', 'Pepperoni'], 'Food')).toContain('category')
  })

  it('flags duplicate hints on the same word', () => {
    expect(rules('Pizza', ['Oven', 'Oven', 'Pepperoni'])).toContain('duplicate')
  })

  it('flags contentless filler', () => {
    expect(rules('Pizza', ['Thing', 'Oven', 'Pepperoni'])).toContain('generic')
    expect(rules('Pizza', ['Italy', 'Nice', 'Pepperoni'])).toContain('generic')
    for (const banned of ['stuff', 'good', 'common', 'used']) {
      expect(BANNED_GENERIC_HINTS.has(banned)).toBe(true)
    }
  })

  it('does not flag legitimate short descriptors as filler', () => {
    expect(validateEntry(entry('Carrot', ['Root', 'Orange', 'Rabbit']))).toEqual([])
    expect(validateEntry(entry('Snow', ['Cold', 'White', 'Winter']))).toEqual([])
  })
})

describe('validatePackEntries', () => {
  it('aggregates errors and builds a reuse report', () => {
    const entries = [
      entry('Cake', ['Bake', 'Sweet', 'Frosting']),
      entry('Cookie', ['Bake', 'Sweet', 'Chip']),
      entry('Pie', ['Bake', 'Fruit', 'Crust']),
    ]
    const { errors, reuse } = validatePackEntries(entries)
    expect(errors).toEqual([])

    const bake = reuse.find((r) => r.hint === 'bake')
    expect(bake?.count).toBe(3)
    expect(bake?.slotCounts).toEqual([3, 0, 0])
    // Most-reused first.
    expect(reuse[0]!.hint).toBe('bake')
    // Singletons are omitted from the report.
    expect(reuse.some((r) => r.hint === 'frosting')).toBe(false)
  })

  it('flags a hint reused past its per-slot cap', () => {
    // Four words share the same Revealing (slot 2) hint; the cap there is 3.
    const entries = [
      entry('Wolf', ['Howl', 'Pack', 'Moon']),
      entry('Bat', ['Cave', 'Wing', 'Moon']),
      entry('Tide', ['Sea', 'Pull', 'Moon']),
      entry('Owl', ['Night', 'Hoot', 'Moon']),
    ]
    const reuseErrors = validatePackEntries(entries).errors.filter((e) => e.rule === 'reuse')
    expect(reuseErrors).toHaveLength(1)
    expect(reuseErrors[0]!.slot).toBe(2)
    expect(reuseErrors[0]!.hint).toBe('moon')
  })

  it('does not flag reuse within the per-slot cap', () => {
    // Three words share a Revealing hint; the cap is 3, so this is allowed.
    const entries = [
      entry('Wolf', ['Howl', 'Pack', 'Moon']),
      entry('Bat', ['Cave', 'Wing', 'Moon']),
      entry('Tide', ['Sea', 'Pull', 'Moon']),
    ]
    expect(validatePackEntries(entries).errors.filter((e) => e.rule === 'reuse')).toEqual([])
  })

  it('tolerates broad overlap at the Cryptic slot', () => {
    // The same Cryptic hint on many words is fine (cap 12); slots 1/2 stay unique.
    const mids = ['alpha', 'bravo', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'india', 'juliet', 'kilo']
    const revs = ['lima', 'mike', 'november', 'oscar', 'papa', 'quebec', 'romeo', 'sierra', 'tango', 'victor']
    const entries = mids.map((mid, i) =>
      entry(`word${String.fromCharCode(97 + i)}`, ['Green', mid, revs[i]!]),
    )
    expect(validatePackEntries(entries).errors.filter((e) => e.rule === 'reuse')).toEqual([])
  })
})
