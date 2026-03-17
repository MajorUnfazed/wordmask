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
    <GlassCard className="glass-panel w-full max-w-md p-6 flex flex-col gap-5 rounded-[24px]">
      <h3 className="font-display text-xl font-bold tracking-wide text-white">Leaderboard</h3>
      <div className="flex flex-col gap-3">
        {ranked.map((player, index) => (
          <motion.div
            key={player.id}
            className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07 }}
          >
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold uppercase text-white/40 w-4 text-center">
                #{index + 1}
              </span>
              <span className="font-semibold text-white/90 text-base">{player.name}</span>
            </div>
            <span
              className="font-display font-black text-xl text-accent-blue"
            >
              {scores[player.id] ?? 0}
            </span>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  )
}
