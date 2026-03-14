import { motion } from 'framer-motion'

interface VoteBarProps {
  playerName: string
  votes: number
  total: number
  isEliminated?: boolean
}

export function VoteBar({ playerName, votes, total, isEliminated = false }: VoteBarProps) {
  const pct = total === 0 ? 0 : (votes / total) * 100

  return (
    <div className="flex items-center gap-3">
      <span
        className="w-24 text-sm truncate shrink-0"
        style={{ color: isEliminated ? 'var(--color-danger)' : 'var(--color-text-primary)' }}
      >
        {playerName}
      </span>
      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{
            background: isEliminated ? 'var(--color-danger)' : 'var(--color-accent)',
            boxShadow: isEliminated ? '0 0 8px var(--color-danger-glow)' : '0 0 8px var(--color-accent-glow)',
          }}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="w-6 text-xs text-right" style={{ color: 'var(--color-text-muted)' }}>
        {votes}
      </span>
    </div>
  )
}
