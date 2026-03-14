import { ALL_WORDS } from '@impostor/core'

export type RecommendedCategory = {
  id: string
  name: string
  emoji: string
  engineCategory: string
}

export const RECOMMENDED_CATEGORIES: RecommendedCategory[] = [
  { id: 'animals', name: 'Animals', emoji: '🐘', engineCategory: 'Animals' },
  { id: 'food', name: 'Food', emoji: '🍕', engineCategory: 'Food' },
  { id: 'technology', name: 'Technology', emoji: '💻', engineCategory: 'Technology' },
  { id: 'household', name: 'Household', emoji: '🏠', engineCategory: 'Random Objects' },
  { id: 'nature', name: 'Nature', emoji: '🌿', engineCategory: 'Science' },
  { id: 'geography', name: 'Geography', emoji: '🌍', engineCategory: 'Geography' },
  { id: 'sports', name: 'Sports', emoji: '⚽', engineCategory: 'Sports' },
  { id: 'clothing', name: 'Clothing', emoji: '👕', engineCategory: 'Everyday' },
  { id: 'music', name: 'Music', emoji: '🎵', engineCategory: 'Party Mode' },
  { id: 'movies', name: 'Movies', emoji: '🎬', engineCategory: 'Movies' },
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
