import { motion } from 'framer-motion'
import { CountdownTimer } from '../components/ui/CountdownTimer'
import { GlowButton } from '../components/ui/GlowButton'
import { useOfflineGame } from '../hooks/useOfflineGame'
import { useUIStore } from '../store/uiStore'
import { sounds } from '../lib/sounds'

export default function DiscussionScreen() {
  const setScreen = useUIStore((s) => s.setScreen)
  const { currentRound, beginVoting } = useOfflineGame()
  const duration = currentRound?.discussionDuration ?? 60

  function handleStartVoting() {
    beginVoting()
    setScreen('voting')
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-10 overflow-y-auto px-6 pt-12 text-center"
      style={{ paddingBottom: 'max(80px, env(safe-area-inset-bottom))' }}
    >
      <motion.div
        className="flex flex-col items-center gap-4 mb-4"
        initial={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="font-display text-5xl font-black tracking-wide text-gradient">
          DISCUSS!
        </h2>
        {currentRound?.category && (
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent-blue">
            Category: {currentRound.category}
          </p>
        )}
        <p className="text-lg font-medium tracking-wide text-white/70">
          Talk it out — who's the impostor?
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="scale-75 opacity-80">
          <CountdownTimer seconds={duration} onComplete={() => sounds.timerEnd()} />
        </div>
        <p className="text-xs uppercase tracking-[0.25em]" style={{ color: 'var(--color-text-muted)' }}>
          Optional timer
        </p>
      </motion.div>

      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlowButton onClick={handleStartVoting}>
          Start Voting
        </GlowButton>
      </motion.div>
    </div>
  )
}
