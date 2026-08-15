import type { PlayerWithRole } from '../types/game'

export interface BotDecisionContext {
  bot: PlayerWithRole
  candidates: PlayerWithRole[]
  publicVoteCounts?: Record<string, number>
}

/** Deterministic v1 bot policy. A seed derived from player/round IDs keeps reconnects reproducible. */
export function chooseReplacementBotVote(context: BotDecisionContext, seed: string): string | null {
  const candidates = context.candidates.filter((player) =>
    player.id !== context.bot.id && !player.isEliminated && !player.isSpectator,
  )
  if (!candidates.length) return null
  const ranked = [...candidates].sort((a, b) => {
    const votes = (context.publicVoteCounts?.[b.id] ?? 0) - (context.publicVoteCounts?.[a.id] ?? 0)
    return votes || a.id.localeCompare(b.id)
  })
  const hash = [...seed].reduce((value, char) => ((value * 31) + char.charCodeAt(0)) >>> 0, 7)
  return ranked[hash % Math.min(ranked.length, 3)]!.id
}

export function chooseReplacementBotClue(hints: string[], seed: string): string {
  if (!hints.length) return 'Interesting'
  const hash = [...seed].reduce((value, char) => ((value * 33) ^ char.charCodeAt(0)) >>> 0, 5381)
  return hints[hash % hints.length]!
}
