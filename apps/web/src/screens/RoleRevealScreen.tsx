import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RoleCard } from '../components/game/RoleCard'
import { GlowButton } from '../components/ui/GlowButton'
import { useOfflineGame } from '../hooks/useOfflineGame'
import { useUIStore } from '../store/uiStore'
import { sounds } from '../lib/sounds'

const CARD_FLIP_BACK_MS = 650

/**
 * RoleRevealScreen — offline pass-the-phone role reveal flow.
 *
 * Flow per player:
 *   1. Show the current player
 *   2. Player holds the card to reveal their role
 *   3. Overlay prompts the user to tap anywhere to continue
 *   4. Card flips back before the store advances to the next player
 */
export default function RoleRevealScreen() {
  const setScreen = useUIStore((s) => s.setScreen)
  const {
    currentRound,
    currentRevealPlayer,
    currentPlayerIndex,
    allRolesSeen,
    advanceToNextPlayer,
    completeRoleReveal,
  } = useOfflineGame()

  const [revealed, setRevealed] = useState(false)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { sounds.roundStart() }, [])

  const players = currentRound?.players ?? []

  useEffect(() => {
    if (!allRolesSeen) {
      return
    }

    completeRoleReveal()
    setScreen('discussion')
  }, [allRolesSeen, completeRoleReveal, setScreen])

  useEffect(() => {
    setRevealed(false)
    setIsAdvancing(false)
  }, [currentPlayerIndex])

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current)
      }
    }
  }, [])

  function handleReveal() {
    if (isAdvancing) {
      return
    }

    setRevealed(true)
  }

  function handleContinue() {
    if (!revealed || isAdvancing) {
      return
    }

    setIsAdvancing(true)
    setRevealed(false)

    advanceTimeoutRef.current = setTimeout(() => {
      advanceToNextPlayer()
      setIsAdvancing(false)
    }, CARD_FLIP_BACK_MS)
  }

  if (!currentRound) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 overflow-y-auto px-6"
        style={{ paddingBottom: 'max(80px, env(safe-area-inset-bottom))' }}
      >
        <p style={{ color: 'var(--color-text-muted)' }}>No round in progress.</p>
        <GlowButton variant="secondary" onClick={() => setScreen('home')}>
          Back to Home
        </GlowButton>
      </div>
    )
  }

  if (!currentRevealPlayer) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-3 overflow-y-auto px-6"
        style={{ paddingBottom: 'max(80px, env(safe-area-inset-bottom))' }}
      >
        <p className="font-display text-2xl font-bold">Preparing discussion</p>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Passing control to the next phase.
        </p>
      </div>
    )
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-y-auto px-6 pt-8"
      style={{ paddingBottom: 'max(80px, env(safe-area-inset-bottom))' }}
      onClick={revealed ? handleContinue : undefined}
    >
      <motion.div
        key={currentRevealPlayer.id}
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="flex flex-col items-center gap-2 text-center mb-4"
          initial={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent-blue">
            Player {currentPlayerIndex + 1} of {players.length}
          </p>
          <h2 className="font-display text-4xl font-black tracking-wide text-gradient">
            {currentRevealPlayer.name}
          </h2>
          <p className="text-sm font-medium tracking-wide text-white/50">
            {revealed ? 'ROLE REVEALED' : 'HOLD TO REVEAL ROLE'}
          </p>
        </motion.div>

        <RoleCard
          playerName={currentRevealPlayer.name}
          role={currentRevealPlayer.role}
          word={currentRound.word}
          hint={currentRound.hint}
          revealed={revealed}
          disabled={revealed || isAdvancing}
          onReveal={handleReveal}
        />

        <AnimatePresence>
          {revealed && (
            <motion.p
              className="pointer-events-none text-center text-sm uppercase tracking-[0.32em]"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.05, 1],
                y: 0,
              }}
              exit={{ opacity: 0, y: 8 }}
              transition={{
                opacity: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                y: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
              }}
              style={{ color: 'var(--color-text-secondary)' }}
            >
              TAP ANYWHERE TO CONTINUE
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
