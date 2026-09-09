import { describe, expect, it } from 'vitest'
import { MOVIES_PACK } from '../data/packs/movies'
import { MUSIC_PACK } from '../data/packs/music'
import { PARTY_MODE_PACK } from '../data/packs/partyMode'
import { validatePackEntries } from '../hintQuality'
import type { WordEntry } from '../../types/packs'

describe('Reviewer M2-2 Independent Verification Suite', () => {
  const packs = [
    { name: 'Movies', entries: MOVIES_PACK },
    { name: 'Music', entries: MUSIC_PACK },
    { name: 'Party Mode', entries: PARTY_MODE_PACK },
  ]

  it('verifies each pack has exactly 120 words', () => {
    for (const pack of packs) {
      expect(pack.entries.length, `${pack.name} entry count`).toBe(120)
    }
  })

  it('verifies 0 mechanical validation errors via validatePackEntries', () => {
    for (const pack of packs) {
      const { errors } = validatePackEntries(pack.entries)
      expect(errors, `${pack.name} errors`).toEqual([])
    }
  })

  it('checks for compound/morpheme leaks and stem leaks', () => {
    const leaks: string[] = []

    for (const pack of packs) {
      for (const entry of pack.entries) {
        const wordTokens = entry.word.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
        
        entry.hints.forEach((hint, slot) => {
          const hintTokens = hint.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)

          // 1. Direct token leak: hint contains word token of length >= 3
          for (const wt of wordTokens) {
            if (wt.length >= 3) {
              for (const ht of hintTokens) {
                // If exact match or ht starts with wt or wt starts with ht
                if (ht === wt) {
                  leaks.push(`[EXACT] ${pack.name}: "${entry.word}" [slot ${slot}] "${hint}" (token: "${ht}")`)
                } else if (ht.length >= 4 && wt.length >= 4 && (ht.startsWith(wt) || wt.startsWith(ht))) {
                  leaks.push(`[PREFIX] ${pack.name}: "${entry.word}" [slot ${slot}] "${hint}" (root: "${wt}" ~ "${ht}")`)
                } else if (ht.length >= 3 && wt.includes(ht) && wt.length <= ht.length + 3) {
                  // e.g. Bartender contains bar
                  leaks.push(`[SUBSTRING] ${pack.name}: "${entry.word}" [slot ${slot}] "${hint}" ("${wt}" contains "${ht}")`)
                }
              }
            }
          }
        })
      }
    }

    console.log('Detected potential leaks:\n' + leaks.join('\n'))
  })
})
