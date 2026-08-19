import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlowButton } from '../components/ui/GlowButton'
import { useOfflineGame } from '../hooks/useOfflineGame'
import { useUIStore } from '../store/uiStore'

export default function PassThePhoneResolutionScreen() {
  const setScreen = useUIStore((s) => s.setScreen)
  const { answerPassThePhone, currentRound } = useOfflineGame()
  const [answered, setAnswered] = useState<boolean | null>(null)

  function handleAnswer(impostorCaught: boolean) {
    setAnswered(impostorCaught)
    setTimeout(() => {
      answerPassThePhone(impostorCaught)
      setScreen('results')
    }, 600)
  }

  return (
    <motion.div
      className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 text-center"
      style={{ paddingBottom: 'max(80px, env(safe-area-inset-bottom))' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-col items-center gap-4">
        <motion.div
          className="text-6xl"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          ???
        </motion.div>
        <p className="text-sm uppercase tracking-[0.25em]" style={{ color: 'var(--color-text-muted)' }}>
          {currentRound?.category ? `Category: ${currentRound.category}` : 'Round Complete'}
        </p>
        <h2 className="font-display text-4xl font-bold leading-tight">
          Was the impostor<br />caught?
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Agree as a group, then tap the result.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-4">
        <motion.div
          animate={answered === true ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <GlowButton
            onClick={() => handleAnswer(true)}
            disabled={answered !== null}
          >
            <span className="flex items-center gap-3 justify-center">
              <span className="text-xl">🎉</span>
              Yes — Caught!
            </span>
          </GlowButton>
        </motion.div>

        <motion.div
          animate={answered === false ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <GlowButton
            variant="secondary"
            onClick={() => handleAnswer(false)}
            disabled={answered !== null}
          >
            <span className="flex items-center gap-3 justify-center">
              <span className="text-xl">😈</span>
              No — They escaped
            </span>
          </GlowButton>
        </motion.div>
      </div>
    </motion.div>
  )
}
