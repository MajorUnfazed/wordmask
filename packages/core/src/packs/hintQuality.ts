import type { WordEntry } from '../types/packs'

/**
 * Mechanical quality gate for curated impostor hints. Enforces the *objective*
 * rules from HINT_RUBRIC.md (count, length, leaks, filler, category, dupes) and
 * produces a reuse report for the one soft rule a machine can measure —
 * dilution across a pack. Semantic quality (relevance, obviousness, the
 * difficulty gradient) is the author's job; see HINT_RUBRIC.md.
 *
 * Pure and side-effect free so it can back both a vitest and a CLI script.
 */

export interface HintIssue {
  entryId: string
  word: string
  /** The offending hint, or null for an entry-level issue (e.g. wrong count). */
  hint: string | null
  /** Index in the triple (0/1/2), or null for entry-level issues. */
  slot: number | null
  /** Short machine-readable rule code. */
  rule:
    | 'count'
    | 'empty'
    | 'length'
    | 'charset'
    | 'leak'
    | 'category'
    | 'duplicate'
    | 'generic'
    | 'reuse'
  message: string
}

export interface HintReuseRow {
  hint: string
  count: number
  /** How many times this hint appears at slot 0 / 1 / 2. */
  slotCounts: [number, number, number]
  words: string[]
}

export interface PackValidationResult {
  errors: HintIssue[]
  /** Hints used by 2+ words, most-reused first. Informational, not an error. */
  reuse: HintReuseRow[]
}

/**
 * Contentless words that carry no signal as a standalone clue. Deliberately
 * conservative — only truly empty filler, never real descriptors (colours,
 * sizes, materials, textures are all legitimate hints).
 */
export const BANNED_GENERIC_HINTS: ReadonlySet<string> = new Set([
  'thing', 'things', 'thingy', 'stuff', 'stuffs', 'item', 'items',
  'object', 'objects', 'good', 'bad', 'nice', 'great', 'cool', 'fun',
  'fine', 'okay', 'ok', 'type', 'kind', 'sort', 'form', 'way', 'part',
  'very', 'really', 'quite', 'some', 'any', 'more', 'most', 'lots',
  'many', 'common', 'popular', 'normal', 'regular', 'generic', 'basic',
  'simple', 'usual', 'used', 'use', 'useful', 'misc', 'various',
  'general', 'other', 'stuffed', 'etc',
])

/**
 * Per-slot reuse caps. A hint may appear at most this many times *within a
 * single pack* at each difficulty slot. Revealing (slot 2) must stay
 * distinctive or the tier is meaningless; Cryptic (slot 0) overlap is tolerated
 * (HINT_RUBRIC.md soft-rule 9). Tunable — loosen or tighten against real data.
 */
export const REUSE_CAPS_BY_SLOT: readonly [number, number, number] = [12, 6, 3]

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

/** Light singular stem so "Pizza"/"Pizzas" and "Bean"/"Beans" collide. */
function stem(token: string): string {
  return token.length > 3 && token.endsWith('s') ? token.slice(0, -1) : token
}

function tokens(value: string): string[] {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
}

/** True if the hint shares a (stemmed) word-stem with the answer — a leak. */
function leaksWord(word: string, hint: string): boolean {
  const wordStems = new Set(tokens(word).map(stem))
  return tokens(hint).map(stem).some((t) => wordStems.has(t))
}

/** Validate one word's hints against the objective rules. */
export function validateEntry(entry: WordEntry): HintIssue[] {
  const issues: HintIssue[] = []
  const push = (
    hint: string | null,
    slot: number | null,
    rule: HintIssue['rule'],
    message: string,
  ) => issues.push({ entryId: entry.id, word: entry.word, hint, slot, rule, message })

  if (entry.hints.length !== 3) {
    push(null, null, 'count', `has ${entry.hints.length} hints, expected exactly 3`)
  }

  const seen = new Set<string>()
  entry.hints.forEach((hint, slot) => {
    const trimmed = hint.trim()

    if (trimmed.length === 0) {
      push(hint, slot, 'empty', 'is empty')
      return
    }

    const wordCount = trimmed.split(/\s+/).filter(Boolean).length
    if (wordCount < 1 || wordCount > 2) {
      push(hint, slot, 'length', `is ${wordCount} words, expected 1-2`)
    }

    // Letters plus internal apostrophes/hyphens only — no digits or punctuation.
    if (!/^[a-z]+(?:['-][a-z]+)*(?: [a-z]+(?:['-][a-z]+)*)?$/i.test(trimmed)) {
      push(hint, slot, 'charset', 'contains punctuation, digits, or non-letters')
    }

    if (leaksWord(entry.word, hint)) {
      push(hint, slot, 'leak', `shares a word-stem with the answer "${entry.word}"`)
    }

    if (normalize(trimmed) === normalize(entry.category)) {
      push(hint, slot, 'category', 'is just the category name')
    }

    if (tokens(trimmed).some((t) => BANNED_GENERIC_HINTS.has(t))) {
      push(hint, slot, 'generic', 'is contentless filler')
    }

    const key = normalize(trimmed)
    if (seen.has(key)) {
      push(hint, slot, 'duplicate', 'duplicates another hint on the same word')
    }
    seen.add(key)
  })

  return issues
}

interface ReuseAccumulator extends HintReuseRow {
  /** Words using this hint, split by slot, for actionable cap messages. */
  slotWords: [string[], string[], string[]]
}

/** Validate a whole pack (or category slice) and build the reuse report. */
export function validatePackEntries(entries: WordEntry[]): PackValidationResult {
  const errors: HintIssue[] = []
  const reuseMap = new Map<string, ReuseAccumulator>()

  for (const entry of entries) {
    errors.push(...validateEntry(entry))

    entry.hints.forEach((hint, slot) => {
      const key = normalize(hint)
      if (!key) return
      const row =
        reuseMap.get(key) ??
        {
          hint: key,
          count: 0,
          slotCounts: [0, 0, 0] as [number, number, number],
          words: [],
          slotWords: [[], [], []] as [string[], string[], string[]],
        }
      row.count += 1
      if (slot >= 0 && slot <= 2) {
        row.slotCounts[slot]! += 1
        row.slotWords[slot]!.push(entry.word)
      }
      row.words.push(entry.word)
      reuseMap.set(key, row)
    })
  }

  const rows = [...reuseMap.values()]

  // Hard gate: a hint over its per-slot cap dilutes that tier. One error per
  // (hint, slot) that exceeds, naming the colliding words so it's actionable.
  const SLOT_LABELS = ['Cryptic', 'Balanced', 'Revealing'] as const
  for (const row of rows) {
    for (let slot = 0; slot < 3; slot++) {
      const cap = REUSE_CAPS_BY_SLOT[slot]!
      const n = row.slotCounts[slot]!
      if (n > cap) {
        const words = row.slotWords[slot]!
        const shown = words.slice(0, 8).join(', ')
        const more = words.length > 8 ? `, +${words.length - 8} more` : ''
        errors.push({
          entryId: '',
          word: row.hint,
          hint: row.hint,
          slot,
          rule: 'reuse',
          message: `used ${n}x at ${SLOT_LABELS[slot]} slot (cap ${cap}): ${shown}${more}`,
        })
      }
    }
  }

  const reuse: HintReuseRow[] = rows
    .filter((row) => row.count >= 2)
    .map((row) => ({
      hint: row.hint,
      count: row.count,
      slotCounts: row.slotCounts,
      words: row.words,
    }))
    .sort((a, b) => b.count - a.count || a.hint.localeCompare(b.hint))

  return { errors, reuse }
}
