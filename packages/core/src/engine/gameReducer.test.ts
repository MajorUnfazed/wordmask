import { describe, expect, it } from 'vitest'
import { GameEngine } from './GameEngine'
import { chooseReplacementBotVote } from '../systems/ReplacementBot'
import { validateCommunityPack } from '../packs/community'

const players = ['a', 'b', 'c', 'd'].map((id) => ({
  id,
  name: id,
  score: 0,
  isEliminated: false,
}))

describe('v2 game rules', () => {
  it('assigns exactly one Jester without reducing crewmate privacy', () => {
    const engine = new GameEngine()
    engine.setupGame({ playerCount: 4, impostorCount: 1, jesterCount: 1, selectedCategories: ['Everyday'], discussionDuration: 30, maxRounds: 1 }, players)
    engine.startRound(['Everyday'])
    const round = engine.getState().currentRound!
    expect(round.impostorIds).toHaveLength(1)
    expect(round.jesterIds).toHaveLength(1)
    expect(round.impostorIds[0]).not.toBe(round.jesterIds[0])
  })

  it('opens a final guess only after an impostor is uniquely caught', () => {
    const engine = new GameEngine()
    engine.setupGame({ playerCount: 4, impostorCount: 1, selectedCategories: ['Everyday'], discussionDuration: 30, maxRounds: 1 }, players)
    engine.startRound(['Everyday'])
    engine.completeRoleReveal()
    engine.startVoting()
    const impostor = engine.getState().currentRound!.impostorIds[0]!
    for (const player of players.filter((player) => player.id !== impostor)) engine.castVote(player.id, impostor)
    engine.resolveRound()
    expect(engine.getState().phase).toBe('FINAL_IMPOSTOR_GUESS')
    engine.submitFinalImpostorGuess(impostor, 'not the word')
    expect(engine.getState().phase).toBe('RESULTS')
  })

  it('keeps replacement bot decisions reproducible across reconnects', () => {
    const bot = { ...players[0]!, role: 'CREWMATE' as const, isBot: true }
    const candidates = players.slice(1).map((player) => ({ ...player, role: 'CREWMATE' as const }))
    expect(chooseReplacementBotVote({ bot, candidates }, 'round:bot')).toBe(
      chooseReplacementBotVote({ bot, candidates }, 'round:bot'),
    )
  })

  it('rejects duplicate community content before it reaches moderation', () => {
    const result = validateCommunityPack({
      title: 'My pack', description: 'A deliberately valid enough description.', language: 'en', category: 'test', tags: [],
      words: Array.from({ length: 10 }, () => ({ word: 'same', hints: ['same clue'] })),
    })
    expect(result.valid).toBe(false)
    expect(result.errors.some((error) => error.includes('duplicates'))).toBe(true)
  })
})
