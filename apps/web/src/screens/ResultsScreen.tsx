import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlowButton } from '../components/ui/GlowButton'
import { GlassCard } from '../components/ui/GlassCard'
import { ScoreBoard } from '../components/game/ScoreBoard'
import { Confetti } from '../components/ui/Confetti'
import { useOfflineGame } from '../hooks/useOfflineGame'
import { useUIStore } from '../store/uiStore'
import { sounds } from '../lib/sounds'

export default function ResultsScreen() {
  const setScreen = useUIStore((s) => s.setScreen)
  const { game, lastResult, resetGame } = useOfflineGame()

  const round = game.rounds.at(-1)
  const impostorIds = new Set(lastResult?.impostorIds ?? [])
  const impostorsCaught = lastResult?.impostorsCaught ?? false

  const impostorNames = round?.players
    .filter((p) => impostorIds.has(p.id))
    .map((p) => p.name)
    .join(', ')

  useEffect(() => {
    if (impostorsCaught) {
      sounds.victory()
    } else {
      sounds.impostorReveal()
    }
  }, [impostorsCaught])

  function handleNextRound() {
    setScreen('category')
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 px-6 py-12 overflow-y-auto">
      <Confetti sad={!impostorsCaught} />

      <motion.div
        className="text-center mt-4"
        initial={{ opacity: 0, scale: 0.8, filter: 'blur(8px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-7xl mb-6 drop-shadow-2xl">{impostorsCaught ? '🎉' : '😈'}</div>
        <h2 className={`font-display text-5xl font-black tracking-wide ${impostorsCaught ? 'text-success' : 'text-danger'}`}>
          {impostorsCaught ? 'CAUGHT!' : 'ESCAPED!'}
        </h2>
        <p className="mt-4 text-lg font-medium tracking-wide text-white/80">
          {impostorsCaught
            ? <span className="text-white">The impostor was <span className="font-bold text-accent-blue">{impostorNames}</span></span>
            : <span className="text-white"><span className="font-bold text-danger">{impostorNames}</span> fooled everyone</span>}
        </p>
      </motion.div>

      <GlassCard className="glass-panel w-full max-w-md p-6 flex flex-col items-center text-center rounded-[24px]">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50 mb-3">
          The word was
        </p>
        <p className="font-display text-3xl font-black text-white drop-shadow-md">
          {round?.word}
        </p>
        <p className="text-sm mt-3 font-medium text-white/60">
          Hint: {round?.hint}
        </p>
      </GlassCard>

      <ScoreBoard scores={game.scores} players={game.players} />

      <div className="flex flex-col gap-4 w-full max-w-md mt-4 pb-8">
        <GlowButton onClick={handleNextRound}>NEXT ROUND</GlowButton>
        <GlowButton variant="secondary" onClick={() => { resetGame(); setScreen('home') }}>
          END GAME
        </GlowButton>
      </div>
    </div>
  )
}
