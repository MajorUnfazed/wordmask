import type { WordEntry, WordPack } from '../types/packs'

function isDevelopment(): boolean {
  return typeof process === 'undefined' || process.env.NODE_ENV !== 'production'
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function containsWordItself(word: string, hint: string): boolean {
  const normalizedWord = normalize(word).replace(/[^a-z0-9]+/g, ' ')
  const normalizedHint = normalize(hint).replace(/[^a-z0-9]+/g, ' ')
  return normalizedWord
    .split(' ')
    .filter(Boolean)
    .some((token) => normalizedHint.split(' ').includes(token))
}

function looksLikeDefinition(hint: string): boolean {
  return /[.,;:!?]/.test(hint) || /\b(is|are|with|that|which|used|using)\b/i.test(hint)
}

function validateHint(entry: WordEntry, packId: string, hint: string): string[] {
  const issues: string[] = []
  const words = hint.trim().split(/\s+/).filter(Boolean)

  if (words.length < 1 || words.length > 2) {
    issues.push('must be 1-2 words')
  }

  if (containsWordItself(entry.word, hint)) {
    issues.push('must not contain the answer word')
  }

  if (looksLikeDefinition(hint)) {
    issues.push('should not look like a sentence definition')
  }

  if (hint.trim().length === 0) {
    issues.push('must not be empty')
  }

  return issues.map((issue) => `[packs:${packId}] ${entry.id} -> "${hint}" ${issue}`)
}

export function validateWordPack(pack: WordPack): WordPack {
  if (!isDevelopment()) {
    return pack
  }

  for (const entry of pack.words) {
    for (const hint of entry.hints) {
      for (const warning of validateHint(entry, pack.id, hint)) {
        console.warn(warning)
      }
    }
  }

  return pack
}
