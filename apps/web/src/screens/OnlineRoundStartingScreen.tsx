import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ONLINE_START_COUNTDOWN_SECONDS } from '../lib/online'
import { useLobby } from '../hooks/useLobby'
import { useUIStore } from '../store/uiStore'

function getRemainingSeconds(startedAt: string) {
  const startedAtValue = Date.parse(startedAt)
  if (Number.isNaN(startedAtValue)) {
    return 0
  }

  const endsAt = startedAtValue + ONLINE_START_COUNTDOWN_SECONDS * 1000
  const remaining = Math.ceil((endsAt - Date.now()) / 1000)
  return Math.max(0, remaining)
}

export default function OnlineRoundStartingScreen() {
  const { round } = useLobby()
  const setScreen = useUIStore((state) => state.setScreen)
  const [remaining, setRemaining] = useState(() =>
    round ? getRemainingSeconds(round.startedAt) : 0,
  )

  useEffect(() => {
    if (!round) {
      return
    }

    const updateRemaining = () => {
      const nextRemaining = getRemainingSeconds(round.startedAt)
      setRemaining(nextRemaining)

      if (nextRemaining <= 0) {
        setScreen('online-role-reveal')
      }
    }

    updateRemaining()
    const timer = window.setInterval(updateRemaining, 250)

    return () => {
      window.clearInterval(timer)
    }
  }, [round, setScreen])

  const categoryLabel = useMemo(() => {
    if (!round) {
      return ''
    }

    return round.packId
  }, [round])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <p className="text-sm uppercase tracking-[0.25em]" style={{ color: 'var(--color-text-muted)' }}>
          Round Starting
        </p>
        <h2 className="font-display text-5xl font-bold">Get ready</h2>
        <p className="mx-auto max-w-md text-white/60">
          The next round is about to begin. Keep your screen private when the card appears.
        </p>
      </motion.div>

      <motion.div
        className="flex h-48 w-48 items-center justify-center rounded-full border border-accent/40 bg-accent/10"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <span className="font-display text-7xl font-bold text-accent">
          {Math.max(1, remaining || 1)}
        </span>
      </motion.div>

      {categoryLabel && (
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.2em] text-white/55">
          Category pool: {categoryLabel}
        </div>
      )}
    </div>
  )
}
