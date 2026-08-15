import type { WordEntry } from '../types/packs'

export interface CommunityPackDraft {
  title: string
  description: string
  language: string
  category: string
  tags: string[]
  words: Array<Pick<WordEntry, 'word' | 'hints'>>
}

export interface CommunityPackValidation {
  valid: boolean
  errors: string[]
  normalized?: CommunityPackDraft | undefined
}

const WORD_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} '\-]{0,39}$/u
const PROFANITY = new Set(['fuck', 'shit', 'bitch', 'cunt', 'nigger'])

function normalized(value: string): string {
  return value.trim().normalize('NFKC').toLocaleLowerCase()
}

function containsProfanity(value: string): boolean {
  return normalized(value).split(/[^\p{L}\p{N}]+/u).some((token) => PROFANITY.has(token))
}

/** Client-side preflight. Server moderation remains authoritative. */
export function validateCommunityPack(draft: CommunityPackDraft): CommunityPackValidation {
  const errors: string[] = []
  const title = draft.title.trim()
  const description = draft.description.trim()
  const language = draft.language.trim()
  const category = draft.category.trim()
  if (title.length < 3 || title.length > 80) errors.push('Title must be 3–80 characters.')
  if (description.length < 10 || description.length > 500) errors.push('Description must be 10–500 characters.')
  if (!language) errors.push('Language is required.')
  if (!category) errors.push('Category is required.')
  if (draft.words.length < 10 || draft.words.length > 500) errors.push('A pack needs 10–500 words.')

  const seenWords = new Set<string>()
  const seenClues = new Set<string>()
  const words = draft.words.map((entry) => ({ word: entry.word.trim(), hints: entry.hints.map((hint) => hint.trim()) }))
  for (const [index, entry] of words.entries()) {
    const word = normalized(entry.word)
    if (!WORD_PATTERN.test(entry.word)) errors.push(`Word ${index + 1} uses unsupported characters or is too long.`)
    if (containsProfanity(entry.word)) errors.push(`Word ${index + 1} contains prohibited language.`)
    if (seenWords.has(word)) errors.push(`Word ${index + 1} duplicates another word.`)
    seenWords.add(word)
    if (!entry.hints.length || entry.hints.some((hint) => !hint)) errors.push(`Word ${index + 1} needs at least one clue.`)
    for (const clue of entry.hints) {
      const key = normalized(clue)
      if (clue.length > 120) errors.push(`A clue for word ${index + 1} is too long.`)
      if (containsProfanity(clue)) errors.push(`A clue for word ${index + 1} contains prohibited language.`)
      if (seenClues.has(key)) errors.push(`A clue for word ${index + 1} duplicates another clue.`)
      seenClues.add(key)
    }
  }
  return {
    valid: errors.length === 0,
    errors,
    normalized: errors.length === 0
      ? { title, description, language, category, tags: [...new Set(draft.tags.map(normalized).filter(Boolean))].slice(0, 10), words }
      : undefined,
  }
}
