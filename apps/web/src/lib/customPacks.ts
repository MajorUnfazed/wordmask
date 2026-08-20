/**
 * customPacks — bridge between locally-saved custom/community packs (localStorage)
 * and the game engine's word pool.
 *
 * A pack authored in PackCreatorScreen is stored under `wordmask_custom_packs` as
 * `{ id, title, description, language, category, tags, words: [{word, hints[]}], createdAt }`
 * with its full word list inline, so offline play needs no network. To make a pack
 * playable we expose each pack as a synthetic engine category token `custom:<packId>`:
 * selecting that token draws only from the pack's words. The same tokens flow through
 * the online path (the host builds the round word pool from these words client-side).
 */
import type { WordEntry } from '@impostor/core'

const STORAGE_KEY = 'wordmask_custom_packs'
export const CUSTOM_CATEGORY_PREFIX = 'custom:'

/** A pack exactly as persisted by PackCreatorScreen. */
export interface StoredCustomPack {
  id: string
  title: string
  description: string
  language: string
  category: string
  tags: string[]
  words: Array<{ word: string; hints: string[] }>
  createdAt: string
}

/** Lightweight metadata for pickers — the full word list is loaded lazily. */
export interface CustomPackMeta {
  id: string
  title: string
  description: string
  category: string
  wordCount: number
}

/** `custom:<packId>` — the synthetic engine category token for a pack. */
export function customCategoryToken(packId: string): string {
  return `${CUSTOM_CATEGORY_PREFIX}${packId}`
}

export function isCustomCategory(token: string | undefined): boolean {
  return !!token && token.startsWith(CUSTOM_CATEGORY_PREFIX)
}

/** Extract the pack id from a `custom:<packId>` token (empty string if not one). */
export function customPackIdFromToken(token: string): string {
  return isCustomCategory(token) ? token.slice(CUSTOM_CATEGORY_PREFIX.length) : ''
}

function readRawPacks(): StoredCustomPack[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null)
      .map((entry) => ({
        id: String(entry['id'] ?? ''),
        title: String(entry['title'] ?? 'Custom Pack'),
        description: String(entry['description'] ?? ''),
        language: String(entry['language'] ?? 'en'),
        category: String(entry['category'] ?? 'Custom'),
        tags: Array.isArray(entry['tags']) ? (entry['tags'] as unknown[]).map(String) : [],
        words: normalizeWords(entry['words']),
        createdAt: String(entry['createdAt'] ?? ''),
      }))
      .filter((pack) => pack.id)
  } catch {
    return []
  }
}

function normalizeWords(raw: unknown): Array<{ word: string; hints: string[] }> {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null)
    .map((entry) => ({
      word: String(entry['word'] ?? '').trim(),
      hints: Array.isArray(entry['hints'])
        ? (entry['hints'] as unknown[]).map((hint) => String(hint).trim()).filter(Boolean)
        : [],
    }))
    .filter((entry) => entry.word.length > 0)
}

/** Count of words that could actually be drawn (non-empty word). */
function playableWordCount(pack: StoredCustomPack): number {
  return pack.words.length
}

/**
 * Pack metadata for pickers. Only packs with at least one playable word are returned,
 * so the UI never offers a pack that would throw "No words available" on start.
 */
export function loadCustomPacks(): CustomPackMeta[] {
  return readRawPacks()
    .filter((pack) => playableWordCount(pack) > 0)
    .map((pack) => ({
      id: pack.id,
      title: pack.title,
      description: pack.description,
      category: pack.category,
      wordCount: playableWordCount(pack),
    }))
}

/** Full pack (with words) by id, or null if not found / unplayable. */
export function loadCustomPack(packId: string): StoredCustomPack | null {
  const pack = readRawPacks().find((entry) => entry.id === packId)
  if (!pack || playableWordCount(pack) === 0) return null
  return pack
}

/** Display title for a `custom:<id>` token (or a raw pack id), null if unknown. */
export function customPackTitleById(packId: string): string | null {
  const id = isCustomCategory(packId) ? customPackIdFromToken(packId) : packId
  const pack = readRawPacks().find((entry) => entry.id === id)
  return pack ? pack.title : null
}

/**
 * Convert a stored pack to engine WordEntry[] under the synthetic `custom:<id>` category.
 * Guarantees every entry has at least one hint — `pickRandom` throws on an empty hint
 * array — by falling back to the pack's own category label when a word shipped no clues.
 */
export function customPackToWordEntries(pack: StoredCustomPack): WordEntry[] {
  const category = customCategoryToken(pack.id)
  const fallbackHint = pack.category.trim() || 'Custom pack'
  return pack.words.map((entry, index) => ({
    id: `${category}:${index}`,
    word: entry.word,
    category,
    hints: entry.hints.length > 0 ? entry.hints : [fallbackHint],
  }))
}

/** Convenience: WordEntry[] for a pack id, or [] if the pack is missing/unplayable. */
export function customPackWordEntries(packId: string): WordEntry[] {
  const pack = loadCustomPack(packId)
  return pack ? customPackToWordEntries(pack) : []
}

/**
 * Gather engine WordEntry[] for every `custom:<id>` token in a selection. Used to build
 * the `extraWords` merged into the offline round pool for a mixed built-in/custom round.
 */
export function collectExtraWordsForCategories(selectedCategories: string[]): WordEntry[] {
  const extraWords: WordEntry[] = []
  for (const token of selectedCategories) {
    if (isCustomCategory(token)) {
      extraWords.push(...customPackWordEntries(customPackIdFromToken(token)))
    }
  }
  return extraWords
}
