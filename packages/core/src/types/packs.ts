export interface WordEntry {
  id: string
  word: string
  category: string
  hints: string[]
}

export interface WordPack {
  id: string
  name: string
  emoji: string
  description: string
  words: WordEntry[]
}
