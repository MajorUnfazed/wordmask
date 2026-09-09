import { describe, expect, it } from 'vitest'
import { ANIMALS_PACK } from '../data/packs/animals'
import { F1_PACK } from '../data/packs/f1'
import { FASHION_PACK } from '../data/packs/fashion'
import { FOOD_PACK } from '../data/packs/food'
import { GAMING_PACK } from '../data/packs/gaming'
import { GEOGRAPHY_PACK } from '../data/packs/geography'
import { validatePackEntries } from '../hintQuality'
import type { WordEntry } from '../../types/packs'

export const M3_PACKS: Array<{ name: string; entries: WordEntry[] }> = [
  { name: 'Animals', entries: ANIMALS_PACK },
  { name: 'Formula 1', entries: F1_PACK },
  { name: 'Fashion', entries: FASHION_PACK },
  { name: 'Food', entries: FOOD_PACK },
  { name: 'Gaming', entries: GAMING_PACK },
  { name: 'Geography', entries: GEOGRAPHY_PACK },
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
    | 'CATEGORY_COLLISION'
    | 'STRING_HYGIENE'
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  message: string
  recommendation: string
}

export const QUASI_FILLER_WORDS = new Set([
  'commonly', 'frequently', 'typically', 'popularly', 'usually', 'rarely',
  'portion', 'element', 'feature', 'aspect', 'quality', 'factor',
  'piece', 'pieces', 'section', 'sections', 'matter', 'material',
  'somewhat', 'somehow', 'anywhere', 'everywhere', 'nowhere',
])

export function runAdversarialAudit(packs: Array<{ name: string; entries: WordEntry[] }>): AdversarialFinding[] {
  const findings: AdversarialFinding[] = []

  for (const { name, entries } of packs) {
    for (const entry of entries) {
      const wLower = entry.word.toLowerCase()
      const wTokens = wLower.split(/[^a-z0-9]+/).filter(Boolean)

      entry.hints.forEach((hint, slot) => {
        const hLower = hint.toLowerCase()
        const hTokens = hLower.split(/[^a-z0-9]+/).filter(Boolean)

        // 1. Full word containment: hint contains target word verbatim (e.g. Shift -> Upshift click)
        if (hLower.includes(wLower)) {
          findings.push({
            pack: name,
            entryId: entry.id,
            word: entry.word,
            slot,
            hint,
            category: 'LEAK_FULL_WORD',
            severity: 'CRITICAL',
            message: `Hint "${hint}" contains the full secret word "${entry.word}"`,
            recommendation: `Replace clue with an associative non-leaking term (e.g. for Shift: "Paddle click", "Ratio toggle")`,
          })
        }

        // Secret word contains entire hint string (3+ chars)
        if (wLower.includes(hLower) && hLower.length >= 3 && hLower !== wLower) {
          findings.push({
            pack: name,
            entryId: entry.id,
            word: entry.word,
            slot,
            hint,
            category: 'LEAK_FULL_WORD',
            severity: 'CRITICAL',
            message: `Secret word "${entry.word}" contains the entire hint "${hint}"`,
            recommendation: `Replace clue with an associative non-leaking term`,
          })
        }

        // 2. Compound subword containment
        // a. Target compound word contains hint token (e.g. Crankshaft -> Rotational shaft, Blueberry -> Indigo berry)
        for (const ht of hTokens) {
          if (ht.length >= 3 && wLower.includes(ht) && !hLower.includes(wLower) && !wTokens.includes(ht)) {
            findings.push({
              pack: name,
              entryId: entry.id,
              word: entry.word,
              slot,
              hint,
              category: 'LEAK_COMPOUND',
              severity: ht.length >= 4 ? 'HIGH' : 'LOW',
              message: `Target compound word "${entry.word}" contains clue component "${ht}"`,
              recommendation: `Replace component "${ht}" to eliminate clue giveaway`,
            })
          }
        }

        // b. Hint token contains target word token as substring (e.g. clue "Drifting" contains target "Drift")
        for (const wt of wTokens) {
          if (wt.length >= 4) {
            for (const ht of hTokens) {
              if (ht.includes(wt) && ht !== wt) {
                findings.push({
                  pack: name,
                  entryId: entry.id,
                  word: entry.word,
                  slot,
                  hint,
                  category: 'LEAK_COMPOUND',
                  severity: 'HIGH',
                  message: `Clue token "${ht}" contains target word token "${wt}"`,
                  recommendation: `Replace component "${ht}" to eliminate clue giveaway`,
                })
              }
            }
          }
        }

        // 3. Morphological stem derivation (e.g. Turbo -> Turbine, Portugal -> Porto)
        for (const wt of wTokens) {
          for (const ht of hTokens) {
            if (wt.length >= 4 && ht.length >= 4) {
              let cp = 0
              const minL = Math.min(wt.length, ht.length)
              while (cp < minL && wt[cp] === ht[cp]) cp++
              if (cp >= 4 && (cp >= wt.length - 2 || cp >= ht.length - 2)) {
                if (!hLower.includes(wLower) && !wLower.includes(hLower) && !wTokens.includes(ht)) {
                  // Check if this is a known morphological derivation vs accidental phonetic overlap
                  const accidental = (wt === 'shark' && ht === 'sharp')
                  findings.push({
                    pack: name,
                    entryId: entry.id,
                    word: entry.word,
                    slot,
                    hint,
                    category: 'LEAK_STEM',
                    severity: accidental ? 'LOW' : 'HIGH',
                    message: `Clue token "${ht}" shares root "${wt.slice(0, cp)}" with target "${wt}"`,
                    recommendation: `Replace clue token with non-root-sharing association`,
                  })
                }
              }
            }
          }
        }

        // 4. Quasi-fillers
        for (const ht of hTokens) {
          if (QUASI_FILLER_WORDS.has(ht)) {
            findings.push({
              pack: name,
              entryId: entry.id,
              word: entry.word,
              slot,
              hint,
              category: 'STRING_HYGIENE',
              severity: 'HIGH',
              message: `Contains quasi-filler word "${ht}"`,
              recommendation: `Replace quasi-filler "${ht}" with concrete imagery`,
            })
          }
        }

        // 5. String hygiene
        if (hint !== hint.trim() || /\s{2,}/.test(hint)) {
          findings.push({
            pack: name,
            entryId: entry.id,
            word: entry.word,
            slot,
            hint,
            category: 'STRING_HYGIENE',
            severity: 'LOW',
            message: `Whitespace hygiene issue in "${hint}"`,
            recommendation: `Trim whitespace and collapse multiple spaces`,
          })
        }
      })
    }
  }

  return findings
}

describe('Milestone M3 Challenger Adversarial Suite', () => {
  it('verifies all 6 packs pass baseline mechanical validator', () => {
    for (const pack of M3_PACKS) {
      const { errors } = validatePackEntries(pack.entries)
      expect(errors, `${pack.name} had mechanical errors: ${JSON.stringify(errors)}`).toEqual([])
    }
  })

  it('verifies pack sizing: exactly 120 words per pack (720 total) and exactly 3 hints per word (2,160 total)', () => {
    let wordCount = 0
    let hintCount = 0
    for (const pack of M3_PACKS) {
      expect(pack.entries.length, `${pack.name} entry count`).toBe(120)
      wordCount += pack.entries.length
      for (const entry of pack.entries) {
        expect(entry.hints.length, `${pack.name}: ${entry.word} hint count`).toBe(3)
        hintCount += entry.hints.length
      }
    }
    expect(wordCount).toBe(720)
    expect(hintCount).toBe(2160)
  })

  it('verifies slot reuse cap adherence ([12, 6, 3]) and reports dilution', () => {
    for (const pack of M3_PACKS) {
      const { reuse } = validatePackEntries(pack.entries)
      for (const r of reuse) {
        expect(r.slotCounts[0]).toBeLessThanOrEqual(12)
        expect(r.slotCounts[1]).toBeLessThanOrEqual(6)
        expect(r.slotCounts[2]).toBeLessThanOrEqual(3)
      }
    }
  })

  it('runs adversarial stress audit and reports defects requiring remediation', () => {
    const findings = runAdversarialAudit(M3_PACKS)
    console.log(`\nAdversarial audit produced ${findings.length} findings across M3 packs:`)
    for (const f of findings) {
      console.log(`[${f.severity}] [${f.category}] [${f.pack}] ${f.word} (slot ${f.slot}): "${f.hint}" -> ${f.message}`)
    }

    const criticalOrHigh = findings.filter((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH')
    if (criticalOrHigh.length > 0) {
      console.error(`\nFound ${criticalOrHigh.length} CRITICAL/HIGH adversarial defect(s) requiring changes:`)
      for (const c of criticalOrHigh) {
        console.error(`  - ${c.pack} :: ${c.word} [slot ${c.slot}] "${c.hint}": ${c.message} (${c.recommendation})`)
      }
    }

    expect(criticalOrHigh, `Critical/High leaks detected in M3 packs`).toEqual([])
  })
})
