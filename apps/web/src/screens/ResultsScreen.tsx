import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { GlowButton } from '../components/ui/GlowButton'
import { GlassCard } from '../components/ui/GlassCard'
import { ScoreBoard } from '../components/game/ScoreBoard'
import { useOfflineGame } from '../hooks/useOfflineGame'
import { useUIStore } from '../store/uiStore'
import { haptics } from '../lib/haptics'

export default function ResultsScreen() {
  const setScreen = useUIStore((s) => s.setScreen)
  const { game, lastResult, resetGame } = useOfflineGame()

  const round = game.rounds.at(-1)
  const impostorIds = new Set(lastResult?.impostorIds ?? [])
  const impostorsCaught = lastResult?.impostorsCaught ?? false
  const eliminated = lastResult?.voteResult.eliminatedPlayerId
  const jesterWon = lastResult?.winningRole === 'JESTER'
  const eliminatedName = round?.players.find((p: { id: string }) => p.id === eliminated)?.name

  const impostorNames = round?.players
    .filter((p: { id: string }) => impostorIds.has(p.id))
    .map((p: { name: string }) => p.name)
    .join(', ')

  const selfVoterNames = round?.players
    ?.filter((p: { id: string }) => round.votes && round.votes[p.id] === p.id)
    ?.map((p: { name: string }) => p.name) ?? []

  const resultHapticFired = useRef(false)

  // Buzz once when the outcome lands: celebratory pulse on a catch, heavy on an
  // escape. Gated on lastResult so a resume/empty mount never fires a stray buzz,
  // and ref-guarded so it stays single under StrictMode's double-invoke.
  useEffect(() => {
    if (!lastResult || resultHapticFired.current) return
    resultHapticFired.current = true
    if (impostorsCaught || jesterWon) haptics.success()
    else haptics.heavy()
  }, [lastResult, impostorsCaught, jesterWon])

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
        <div className="text-6xl mb-4">{jesterWon ? '🃏' : impostorsCaught ? '🎉' : '😈'}</div>
        <h2 className="font-display text-4xl font-bold">
          {jesterWon ? 'Jester Wins!' : impostorsCaught ? 'Caught!' : 'Escaped!'}
        </h2>
        <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>
          {jesterWon
            ? `${eliminatedName} got voted out — exactly as planned`
            : impostorsCaught
              ? `The impostor was ${impostorNames}`
              : `${impostorNames} fooled everyone`}
        </p>
      </motion.div>

      {selfVoterNames.length > 0 && (
        <motion.div
          className="w-full max-w-md rounded-2xl border px-4 py-3 text-center text-sm font-medium"
          style={{
            borderColor: 'rgba(239,68,68,0.3)',
            background: 'rgba(239,68,68,0.08)',
            color: '#fca5a5',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          🤡 <span className="font-bold">{selfVoterNames.join(', ')}</span> voted for {selfVoterNames.length === 1 ? 'themselves' : 'themselves'}!
        </motion.div>
      )}


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
