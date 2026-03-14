import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useOfflineGame } from '../hooks/useOfflineGame'
import { useUIStore } from '../store/uiStore'
import { getDisplayCategoryName } from '../lib/categoryUI'

const TRANSITION_DURATION_MS = 1350

export default function RoundTransitionScreen() {
  const setScreen = useUIStore((s) => s.setScreen)
  const { game, currentRound } = useOfflineGame()

  useEffect(() => {
    if (!currentRound) {
      setScreen('role-reveal')
      return
    }

    const timer = window.setTimeout(() => {
      setScreen('role-reveal')
    }, TRANSITION_DURATION_MS)

    return () => window.clearTimeout(timer)
  }, [currentRound, setScreen])

  const roundNumber = game.rounds.length + 1
  const categoryName = getDisplayCategoryName(currentRound?.category)

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <motion.div
        className="w-full max-w-xl rounded-[32px] border border-white/10 px-8 py-14 text-center"
        initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0.9, 1, 1.03, 1.08],
          filter: ['blur(10px)', 'blur(0px)', 'blur(0px)', 'blur(8px)'],
        }}
        transition={{ duration: 1.25, times: [0, 0.28, 0.76, 1], ease: 'easeInOut' }}
        style={{
          background:
            'radial-gradient(circle at top, rgba(168,85,247,0.28), rgba(15,15,25,0.96) 55%)',
          boxShadow: '0 0 40px rgba(168,85,247,0.18), 0 28px 80px rgba(0,0,0,0.35)',
        }}
      >
        <motion.p
          className="text-xs uppercase tracking-[0.45em]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          style={{ color: 'var(--color-text-muted)' }}
        >
          Round Start
        </motion.p>
        <motion.h2
          className="mt-5 font-display text-5xl font-bold"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.18, duration: 0.45 }}
          style={{ textShadow: '0 0 30px rgba(168,85,247,0.35)' }}
        >
          ROUND {roundNumber}
        </motion.h2>
        <motion.div
          className="mt-8 rounded-2xl border border-white/10 px-5 py-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.45 }}
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <p
            className="text-xs uppercase tracking-[0.28em]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Category
          </p>
          <p className="mt-3 font-display text-3xl font-bold">{categoryName}</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
