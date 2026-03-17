import { ALL_WORDS } from '@impostor/core'

export type RecommendedCategory = {
  id: string
  name: string
  emoji: string
  engineCategory: string
}

export const RECOMMENDED_CATEGORIES: RecommendedCategory[] = [
  { id: 'animals', name: 'Animals', emoji: '🐘', engineCategory: 'Animals' },
  { id: 'campus_life', name: 'Campus Life', emoji: '🎓', engineCategory: 'Campus Life' },
  { id: 'everyday', name: 'Everyday', emoji: '🏠', engineCategory: 'Everyday' },
  { id: 'f1', name: 'Formula 1', emoji: '🏎️', engineCategory: 'Formula 1' },
  { id: 'fashion', name: 'Fashion', emoji: '👗', engineCategory: 'Fashion' },
  { id: 'food', name: 'Food', emoji: '🍕', engineCategory: 'Food' },
  { id: 'gaming', name: 'Gaming', emoji: '🎮', engineCategory: 'Gaming' },
  { id: 'geography', name: 'Geography', emoji: '🌍', engineCategory: 'Geography' },
  { id: 'internet_culture', name: 'Internet Culture', emoji: '💀', engineCategory: 'Internet Culture' },
  { id: 'movies', name: 'Movies', emoji: '🎬', engineCategory: 'Movies' },
  { id: 'music', name: 'Music', emoji: '🎵', engineCategory: 'Music' },
  { id: 'party_mode', name: 'Party Mode', emoji: '🎉', engineCategory: 'Party Mode' },
  { id: 'professions', name: 'Professions', emoji: '👨‍⚕️', engineCategory: 'Professions' },
  { id: 'random_objects', name: 'Random Objects', emoji: '🎲', engineCategory: 'Random Objects' },
  { id: 'science', name: 'Science', emoji: '🔬', engineCategory: 'Science' },
  { id: 'sports', name: 'Sports', emoji: '⚽', engineCategory: 'Sports' },
  { id: 'technology', name: 'Technology', emoji: '💻', engineCategory: 'Technology' },
] as const

const categoryNameByEngineCategory = new Map(
  RECOMMENDED_CATEGORIES.map((category) => [category.engineCategory, category.name]),
)

export const wordCountByEngineCategory = new Map<string, number>()

for (const entry of ALL_WORDS) {
  wordCountByEngineCategory.set(
    entry.category,
    (wordCountByEngineCategory.get(entry.category) ?? 0) + 1,
  )
}

export function getDisplayCategoryName(engineCategory: string | undefined): string {
  if (!engineCategory) return 'Unknown'
  return categoryNameByEngineCategory.get(engineCategory) ?? engineCategory
}
