import { motion } from 'framer-motion'
import { GlowButton } from '../components/ui/GlowButton'
import { GlassCard } from '../components/ui/GlassCard'
import { ScoreBoard } from '../components/game/ScoreBoard'
import { useOfflineGame } from '../hooks/useOfflineGame'
import { useUIStore } from '../store/uiStore'

export default function ResultsScreen() {
  const setScreen = useUIStore((s) => s.setScreen)
  const { game, lastResult, resetGame } = useOfflineGame()

  const round = game.rounds.at(-1)
  const impostorIds = new Set(lastResult?.impostorIds ?? [])
  const impostorsCaught = lastResult?.impostorsCaught ?? false
  const eliminated = lastResult?.voteResult.eliminatedPlayerId

  const impostorNames = round?.players
    .filter((p) => impostorIds.has(p.id))
    .map((p) => p.name)
    .join(', ')

  function handleNextRound() {
    setScreen('category')
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 px-6 py-12 overflow-y-auto">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className="text-6xl mb-4">{impostorsCaught ? '🎉' : '😈'}</div>
        <h2 className="font-display text-4xl font-bold">
          {impostorsCaught ? 'Caught!' : 'Escaped!'}
        </h2>
        <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>
          {impostorsCaught
            ? `The impostor was ${impostorNames}`
            : `${impostorNames} fooled everyone`}
        </p>
      </motion.div>

      <GlassCard className="w-full max-w-md p-4">
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          The word was
        </p>
        <p className="font-display text-2xl font-bold text-accent">
          {round?.word}
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {round?.hint}
        </p>
      </GlassCard>

      <ScoreBoard scores={game.scores} players={game.players} />

      <div className="flex flex-col gap-3 w-full max-w-md">
        <GlowButton onClick={handleNextRound}>Next Round</GlowButton>
        <GlowButton variant="secondary" onClick={() => { resetGame(); setScreen('home') }}>
          End Game
        </GlowButton>
      </div>
    </div>
  )
}
