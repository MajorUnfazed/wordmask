import { describe, expect, it } from 'vitest'
import { CAMPUS_LIFE_PACK } from '../data/packs/campusLife'
import { EVERYDAY_PACK } from '../data/packs/everyday'
import { INTERNET_CULTURE_PACK } from '../data/packs/internetCulture'
import { MOVIES_PACK } from '../data/packs/movies'
import { MUSIC_PACK } from '../data/packs/music'
import { PARTY_MODE_PACK } from '../data/packs/partyMode'
import { validatePackEntries } from '../hintQuality'
import type { WordEntry } from '../../types/packs'

const M2_PACKS: Array<{ name: string; entries: WordEntry[] }> = [
  { name: 'Campus Life', entries: CAMPUS_LIFE_PACK },
  { name: 'Everyday', entries: EVERYDAY_PACK },
  { name: 'Internet Culture', entries: INTERNET_CULTURE_PACK },
  { name: 'Movies', entries: MOVIES_PACK },
  { name: 'Music', entries: MUSIC_PACK },
  { name: 'Party Mode', entries: PARTY_MODE_PACK },
]

export interface AdversarialFinding {
  pack: string
  entryId: string
  word: string
  slot: number
  hint: string
  category:
    | 'LEAK_FULL_WORD'
    | 'LEAK_COMPOUND'
    | 'LEAK_STEM'
    | 'INVERTED_GRADIENT'
    | 'DEAD_GIVEAWAY'
    | 'DEMOGRAPHIC'
    | 'STRING_HYGIENE'
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

        // 1. Full word containment: hint contains target word
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

        // 2. Compound / token containment: secret word contains hint token (e.g. Toothpaste -> Morning paste)
        for (const ht of hTokens) {
          // Check if a hint token of 3+ chars is a substring of the target word
          // excluding trivial substrings if any
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

        // 3. Morphological stem derivation
        for (const wt of wTokens) {
          for (const ht of hTokens) {
            if (wt.length >= 4 && ht.length >= 4) {
              // Check prefixes: e.g. Direct -> Director, Animate -> Animation, Cinema -> Cinematic
              const minLen = Math.min(wt.length, ht.length)
              // Common prefix of at least 4 chars
              let commonPrefix = 0
              while (commonPrefix < minLen && wt[commonPrefix] === ht[commonPrefix]) {
                commonPrefix++
              }
              if (commonPrefix >= 4 && (commonPrefix >= wt.length - 2 || commonPrefix >= ht.length - 2)) {
                if (!hLower.includes(wLower) && !wLower.includes(ht)) {
                  findings.push({
                    pack: name,
                    entryId: entry.id,
                    word: entry.word,
                    slot,
                    hint,
                    category: 'LEAK_STEM',
                    message: `Clue token "${ht}" shares morphological root "${wt.slice(0, commonPrefix)}" with target "${wt}"`,
                  })
                }
              }
            }
          }
        }

        // 4. String hygiene: extra spaces, untrimmed
        if (hint !== hint.trim() || /\s{2,}/.test(hint)) {
          findings.push({
            pack: name,
            entryId: entry.id,
            word: entry.word,
            slot,
            hint,
            category: 'STRING_HYGIENE',
            message: `Whitespace hygiene issue in "${hint}"`,
          })
        }
      })
    }
  }

  return findings
}

describe('M2 Challenger Adversarial Suite', () => {
  it('passes baseline mechanical validator with 0 errors across all 6 packs', () => {
    for (const pack of M2_PACKS) {
      const { errors } = validatePackEntries(pack.entries)
      expect(errors, `${pack.name} had mechanical errors: ${JSON.stringify(errors)}`).toEqual([])
    }
  })

  it('verifies all 6 packs have exactly 120 entries with valid 3-element hints', () => {
    for (const pack of M2_PACKS) {
      expect(pack.entries.length, `${pack.name} should have 120 entries`).toBe(120)
      for (const entry of pack.entries) {
        expect(entry.hints.length, `${pack.name} ${entry.word} hints length`).toBe(3)
      }
    }
  })

  it('runs algorithmic adversarial scan across all 720 words', () => {
    const findings = runAdversarialAudit(M2_PACKS)
    console.log(`\nAdversarial audit produced ${findings.length} findings:`)
    for (const f of findings) {
      console.log(`[${f.category}] [${f.pack}] ${f.word} (slot ${f.slot}): "${f.hint}" -> ${f.message}`)
    }
  })
})
