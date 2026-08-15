import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

type PackEntry = {
  word: string
  hints: string[]
}

type PackFile = {
  id: string
  words: PackEntry[]
}

const dataDir = path.resolve(__dirname, '../data')

function loadPackFiles(): PackFile[] {
  return readdirSync(dataDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => {
      const filePath = path.join(dataDir, file)
      const pack = JSON.parse(readFileSync(filePath, 'utf8')) as PackFile
      return pack
    })
}

describe('pack data quality', () => {
  it('keeps every category pack at 120 words with three valid hints each', () => {
    const packs = loadPackFiles()

    expect(packs.length).toBeGreaterThan(0)

    for (const pack of packs) {
      expect(pack.words.length, `${pack.id} word count`).toBeGreaterThanOrEqual(120)

      for (const entry of pack.words) {
        expect(entry.hints, `${pack.id}: ${entry.word}`).toHaveLength(3)
        expect(entry.hints.every((hint) => typeof hint === 'string' && hint.trim().length > 0)).toBe(true)
      }
    }
  })
})
