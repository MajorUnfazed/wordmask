import { describe, expect, it } from 'vitest'
import { validatePackEntries } from '../hintQuality'
import type { WordEntry } from '../../types/packs'
import { ANIMALS_PACK } from '../data/packs/animals'
import { CAMPUS_LIFE_PACK } from '../data/packs/campusLife'
import { EVERYDAY_PACK } from '../data/packs/everyday'
import { F1_PACK } from '../data/packs/f1'
import { FASHION_PACK } from '../data/packs/fashion'
import { FOOD_PACK } from '../data/packs/food'
import { GAMING_PACK } from '../data/packs/gaming'
import { GEOGRAPHY_PACK } from '../data/packs/geography'
import { INTERNET_CULTURE_PACK } from '../data/packs/internetCulture'
import { MOVIES_PACK } from '../data/packs/movies'
import { MUSIC_PACK } from '../data/packs/music'
import { PARTY_MODE_PACK } from '../data/packs/partyMode'
import { PROFESSIONS_PACK } from '../data/packs/professions'
import { RANDOM_OBJECTS_PACK } from '../data/packs/randomObjects'
import { SCIENCE_PACK } from '../data/packs/science'
import { SPORTS_PACK } from '../data/packs/sports'
import { TECHNOLOGY_PACK } from '../data/packs/technology'

/**
 * Whole-collection mechanical hint gate. Every built-in pack must satisfy
 * HINT_RUBRIC.md's objective rules (count / length / charset / leak / category /
 * filler / dupes) AND the per-pack reuse caps. Validated *per pack* so reuse is
 * measured within a pack rather than diluted across the whole collection.
 */
const PACKS: Array<{ name: string; entries: WordEntry[] }> = [
  { name: 'Animals', entries: ANIMALS_PACK },
  { name: 'Campus Life', entries: CAMPUS_LIFE_PACK },
  { name: 'Everyday', entries: EVERYDAY_PACK },
  { name: 'Formula 1', entries: F1_PACK },
  { name: 'Fashion', entries: FASHION_PACK },
  { name: 'Food', entries: FOOD_PACK },
  { name: 'Gaming', entries: GAMING_PACK },
  { name: 'Geography', entries: GEOGRAPHY_PACK },
  { name: 'Internet Culture', entries: INTERNET_CULTURE_PACK },
  { name: 'Movies', entries: MOVIES_PACK },
  { name: 'Music', entries: MUSIC_PACK },
  { name: 'Party Mode', entries: PARTY_MODE_PACK },
  { name: 'Professions', entries: PROFESSIONS_PACK },
  { name: 'Random Objects', entries: RANDOM_OBJECTS_PACK },
  { name: 'Science', entries: SCIENCE_PACK },
  { name: 'Sports', entries: SPORTS_PACK },
  { name: 'Technology', entries: TECHNOLOGY_PACK },
]

describe('pack hint quality', () => {
  for (const pack of PACKS) {
    it(`${pack.name}: no mechanical hint violations`, () => {
      const { errors, reuse } = validatePackEntries(pack.entries)

      if (errors.length > 0) {
        const lines = errors
          .slice(0, 80)
          .map((e) => `  ${e.word} [slot ${e.slot}] "${e.hint}" — ${e.message}`)
        console.error(`\n${pack.name}: ${errors.length} issue(s)\n${lines.join('\n')}`)
      }

      const top = reuse.slice(0, 15).map((r) => `${r.hint}(${r.count})`).join(', ')
      console.log(`${pack.name} top reused hints: ${top || '(none reused)'}`)

      expect(errors).toEqual([])
    })
  }
})
