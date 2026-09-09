import { describe, expect, it } from 'vitest'
import { selectHint } from '../hintSelection'

describe('selectHint', () => {
  const triple = ['vague', 'balanced', 'obvious']

  it('maps each difficulty to its curated slot for three-hint words', () => {
    expect(selectHint(triple, 'CRYPTIC')).toBe('vague')
    expect(selectHint(triple, 'BALANCED')).toBe('balanced')
    expect(selectHint(triple, 'REVEALING')).toBe('obvious')
  })

  it('defaults to the balanced slot when no difficulty is given', () => {
    expect(selectHint(triple)).toBe('balanced')
  })

  it('selection is deterministic for three-hint words', () => {
    for (let i = 0; i < 20; i++) {
      expect(selectHint(triple, 'CRYPTIC')).toBe('vague')
    }
  })

  it('falls back to a valid random pick when the hint count is not three', () => {
    const two = ['a', 'b']
    const four = ['a', 'b', 'c', 'd']
    for (let i = 0; i < 20; i++) {
      expect(two).toContain(selectHint(two, 'CRYPTIC'))
      expect(four).toContain(selectHint(four, 'REVEALING'))
    }
  })

  it('returns the single hint when only one is available', () => {
    expect(selectHint(['only'], 'REVEALING')).toBe('only')
  })

  it('throws on an empty hint list', () => {
    expect(() => selectHint([], 'BALANCED')).toThrow()
  })
})
