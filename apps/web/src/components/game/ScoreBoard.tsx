import { motion } from 'framer-motion'
import type { Player } from '@impostor/core'
import { GlassCard } from '../ui/GlassCard'

interface ScoreBoardProps {
  scores: Record<string, number>
  players: Player[]
}

export function ScoreBoard({ scores, players }: ScoreBoardProps) {
  const ranked = [...players].sort(
    (a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0),
  )

  return (
    <GlassCard className="w-full max-w-md p-4 flex flex-col gap-3">
      <h3 className="font-display text-lg font-bold">Scores</h3>
      <div className="flex flex-col gap-2">
        {ranked.map((player, index) => (
          <motion.div
            key={player.id}
            className="flex items-center justify-between"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07 }}
          >
            <div className="flex items-center gap-3">
              <span className="w-5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {index + 1}
              </span>
              <div className="flex items-center gap-2">
                {player.emoji && <span className="text-xl">{player.emoji}</span>}
                <span className="font-medium text-sm" style={{ color: player.color || 'var(--color-text)' }}>
                  {player.name}
                </span>
              </div>
            </div>
            <span
              className="font-display font-bold text-lg"
              style={{ color: 'var(--color-accent-light)' }}
            >
              {scores[player.id] ?? 0}
            </span>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  )
}
