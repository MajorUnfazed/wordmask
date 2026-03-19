import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GlowButton } from '../components/ui/GlowButton'
import { useUIStore } from '../store/uiStore'
import { useGameStore } from '../store/gameStore'
import { useLobbyStore } from '../store/lobbyStore'

export default function HomeScreen() {
  const setScreen = useUIStore((s) => s.setScreen)
  const savedScreen = useUIStore((s) => s.savedScreen)
  const restoreSavedScreen = useUIStore((s) => s.restoreSavedScreen)
  const onlineLobbyCode = useLobbyStore((s) => s.code)
  const onlineAccessState = useLobbyStore((s) => s.accessState)
  
  const resetGame = useGameStore((s) => s.resetGame)
  const hasOfflineGame = useGameStore((s) => {
    const phase = s.engine?.getState()?.phase
    return phase && phase !== 'IDLE' && phase !== 'SETUP'
  })
  const hasResumeTarget = Boolean(savedScreen && (hasOfflineGame || onlineLobbyCode || savedScreen === 'online-create'))

  // Avoid hydration mismatch flashing
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  function handleNewGame() {
    if (hasOfflineGame) {
      resetGame()
    }
    setScreen('mode')
  }

  function handleResumeGame() {
    if (onlineLobbyCode && onlineAccessState !== 'member') {
      setScreen('online-pending-approval')
    } else if (onlineLobbyCode) {
      setScreen('online-lobby')
    } else if (savedScreen) {
      restoreSavedScreen()
    } else {
      setScreen('mode')
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-10 px-6">
      <motion.div
        className="flex flex-col items-center gap-4 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="font-display text-6xl font-black leading-tight tracking-wider text-accent">
          WordMask
        </h1>
        <p className="text-xl font-medium tracking-wide text-white/80">
          Blend in. Or get exposed.
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col gap-4 w-full max-w-sm mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        {mounted && hasResumeTarget ? (
          <>
            <GlowButton onClick={handleResumeGame}>
              Resume Game
            </GlowButton>
            <GlowButton variant="secondary" onClick={handleNewGame}>
              New Game
            </GlowButton>
          </>
        ) : (
          <GlowButton onClick={handleNewGame}>
            Play
          </GlowButton>
        )}
      </motion.div>
    </div>
  )
}
