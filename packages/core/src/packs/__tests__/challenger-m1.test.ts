import { describe, expect, it } from 'vitest'
import { PROFESSIONS_PACK } from '../data/packs/professions'
import { RANDOM_OBJECTS_PACK } from '../data/packs/randomObjects'
import { SCIENCE_PACK } from '../data/packs/science'
import { SPORTS_PACK } from '../data/packs/sports'
import { TECHNOLOGY_PACK } from '../data/packs/technology'
import { validatePackEntries } from '../hintQuality'
import type { WordEntry } from '../../types/packs'

const M1_PACKS: Array<{ name: string; entries: WordEntry[] }> = [
  { name: 'Professions', entries: PROFESSIONS_PACK },
  { name: 'Random Objects', entries: RANDOM_OBJECTS_PACK },
  { name: 'Science', entries: SCIENCE_PACK },
  { name: 'Sports', entries: SPORTS_PACK },
  { name: 'Technology', entries: TECHNOLOGY_PACK },
]

export interface AdversarialFinding {
  pack: string
  entryId: string
  word: string
  slot: number
  hint: string
  category: 'LEAK_FULL_WORD' | 'LEAK_COMPOUND' | 'LEAK_STEM' | 'INAPPROPRIATE' | 'MONOTONICITY' | 'ACRONYM_GIVEAWAY'
  message: string
}

export function runAdversarialAudit(packs: Array<{ name: string; entries: WordEntry[] }>): AdversarialFinding[] {
  const findings: AdversarialFinding[] = []

  for (const { name, entries } of packs) {
    for (const entry of entries) {
      const wLower = entry.word.toLowerCase()
      const wTokens = wLower.split(/[^a-z0-9]+/).filter(Boolean)

      entry.hints.forEach((hint, slot) => {
        const hLower = hint.toLowerCase()
        const hTokens = hLower.split(/[^a-z0-9]+/).filter(Boolean)

        // 1. Full word containment: hint contains target word (e.g. Writer -> Typewriter, Bed -> Bedroom, Light -> Flashlight beam)
        if (hLower.includes(wLower)) {
          findings.push({
            pack: name,
            entryId: entry.id,
            word: entry.word,
            slot,
            hint,
            category: 'LEAK_FULL_WORD',
            message: `Hint "${hint}" contains the full secret word "${entry.word}"`,
          })
        }

        // 2. Compound / token containment: secret word contains hint token (e.g. Bathtub -> Bubble bath, Racquetball -> Blue ball, Waterpolo -> Deep water)
        for (const ht of hTokens) {
          if (ht.length >= 3 && wLower.includes(ht) && !hLower.includes(wLower)) {
            findings.push({
              pack: name,
              entryId: entry.id,
              word: entry.word,
              slot,
              hint,
              category: 'LEAK_COMPOUND',
              message: `Target compound word "${entry.word}" contains clue component "${ht}"`,
            })
          }
        }

        // 3. Morphological stem derivation (e.g. Magnet -> Magnetic poles)
        for (const wt of wTokens) {
          for (const ht of hTokens) {
            if (wt.length >= 4 && ht.length >= 4) {
              if (ht.startsWith(wt) && ht !== wt && !hLower.includes(wLower)) {
                findings.push({
                  pack: name,
                  entryId: entry.id,
                  word: entry.word,
                  slot,
                  hint,
                  category: 'LEAK_STEM',
                  message: `Clue token "${ht}" directly derives from target root "${wt}"`,
                })
              }
            }
          }
        }
      })

      // 4. Inappropriate double entendre
      if (entry.word === 'Racquetball' && entry.hints[1] === 'Blue ball') {
        findings.push({
          pack: name,
          entryId: entry.id,
          word: entry.word,
          slot: 1,
          hint: 'Blue ball',
          category: 'INAPPROPRIATE',
          message: 'Widely recognized vulgar slang / double entendre inappropriate for 15-20 demographic',
        })
      }

      // 5. Monotonicity inversion: Technology TV (Slot 1 "Remote control" is highly revealing, Slot 2 "Living room" is broad)
      if (entry.word === 'TV' && entry.hints[1] === 'Remote control' && entry.hints[2] === 'Living room') {
        findings.push({
          pack: name,
          entryId: entry.id,
          word: entry.word,
          slot: 2,
          hint: 'Living room',
          category: 'MONOTONICITY',
          message: 'Helpfulness inverted: Slot 1 "Remote control" is far more revealing than Slot 2 "Living room"',
        })
      }

      // 6. Monotonicity inversion: Technology Pixel (Slot 0 "Subpixel" is a direct giveaway at Cryptic)
      if (entry.word === 'Pixel' && entry.hints[0] === 'Subpixel') {
        findings.push({
          pack: name,
          entryId: entry.id,
          word: entry.word,
          slot: 0,
          hint: 'Subpixel',
          category: 'MONOTONICITY',
          message: 'Slot 0 (Cryptic) clue "Subpixel" is a direct giveaway and more revealing than Slot 1 or 2',
        })
      }

      // 7. Acronym expansion giveaway: Technology ROM (Slot 1 "Read only")
      if (entry.word === 'ROM' && entry.hints[1] === 'Read only') {
        findings.push({
          pack: name,
          entryId: entry.id,
          word: entry.word,
          slot: 1,
          hint: 'Read only',
          category: 'ACRONYM_GIVEAWAY',
          message: 'Direct acronym definition: "Read only" expands the literal initials of ROM',
        })
      }
    }
  }

  return findings
}

describe('M1 Challenger Adversarial Suite', () => {
  it('passes baseline mechanical validator', () => {
    for (const pack of M1_PACKS) {
      const { errors } = validatePackEntries(pack.entries)
      expect(errors, `${pack.name} had baseline mechanical errors`).toEqual([])
    }
  })

  it('verifies string hygiene (no un-trimmed whitespace or non-standard characters)', () => {
    const issues: string[] = []
    for (const pack of M1_PACKS) {
      for (const entry of pack.entries) {
        entry.hints.forEach((hint, slot) => {
          if (hint !== hint.trim()) {
            issues.push(`${pack.name}: ${entry.word} slot ${slot} untrimmed whitespace: "${hint}"`)
          }
          if (/\s{2,}/.test(hint)) {
            issues.push(`${pack.name}: ${entry.word} slot ${slot} multiple spaces: "${hint}"`)
          }
        })
      }
    }
    expect(issues).toEqual([])
  })

  it('runs adversarial stress audit and catalogs all anti-patterns', () => {
    const findings = runAdversarialAudit(M1_PACKS)
    console.log(`\nAdversarial stress audit identified ${findings.length} issues across the 5 M1 packs:`)
    for (const f of findings) {
      console.log(`- [${f.pack}] ${f.word} (id: ${f.entryId}, slot: ${f.slot}, hint: "${f.hint}") [${f.category}]: ${f.message}`)
    }
    expect(findings.length).toBe(0)
  })
})
