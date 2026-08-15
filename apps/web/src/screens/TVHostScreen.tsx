import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../components/ui/GlassCard'
import { GlowButton } from '../components/ui/GlowButton'
import { useLobby } from '../hooks/useLobby'
import { useUIStore } from '../store/uiStore'

const PHASE_EMOJI: Record<string, string> = {
  role_reveal: '🎭',
  discussion: '💬',
  voting: '🗳️',
  final_impostor_guess: '🤫',
  results: '🎉',
}

const PHASE_LABEL: Record<string, string> = {
  role_reveal: 'Role Reveal',
  discussion: 'Discussion',
  voting: 'Vote Now',
  final_impostor_guess: 'Final Guess',
  results: 'Results',
}

export default function TVHostScreen() {
  const setScreen = useUIStore((s) => s.setScreen)
  const { code, round, players } = useLobby()
  const [showControls, setShowControls] = useState(true)

  // Auto-hide controls after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  const phase = round?.phase
  const sortedPlayers = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center gap-12 px-12 py-16"
      onMouseMove={() => setShowControls(true)}
      onTouchStart={() => setShowControls(true)}
    >
      {/* Exit button - fades out */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="absolute left-6 top-6 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GlowButton variant="secondary" onClick={() => setScreen('online-lobby')}>
              ← Back to Lobby
            </GlowButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lobby code badge */}
      <motion.div
        className="absolute right-8 top-8 flex flex-col items-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-sm uppercase tracking-[0.3em] text-white/40">Join Code</p>
        <p className="font-display text-5xl font-black tracking-[0.25em] text-accent">
          {code ?? '——'}
        </p>
      </motion.div>

      {/* Phase display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase ?? 'waiting'}
          className="flex flex-col items-center gap-4 text-center"
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -20 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="text-[100px] leading-none">
            {phase ? PHASE_EMOJI[phase] ?? '🎮' : '⏳'}
          </div>
          <h1 className="font-display text-7xl font-black tracking-wide">
            {phase ? PHASE_LABEL[phase] ?? phase : 'Waiting…'}
          </h1>
          {round && (
            <p className="text-2xl text-white/50">
              Round {round.roundNumber} · {round.sourceCategories.join(', ')}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Vote progress bar */}
      {round?.voteProgress && (
        <motion.div
          className="w-full max-w-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="mb-3 flex justify-between text-xl text-white/60">
            <span>Votes cast</span>
            <span className="font-bold text-white">
              {round.voteProgress.submitted} / {round.voteProgress.total}
            </span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-4 rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--color-accent), #ec4899)' }}
              animate={{
                width: `${(round.voteProgress.submitted / Math.max(round.voteProgress.total, 1)) * 100}%`,
              }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </motion.div>
      )}

      {/* Leaderboard */}
      <div className="w-full max-w-3xl">
        <p className="mb-4 text-center text-sm uppercase tracking-[0.3em] text-white/30">Scores</p>
        <div className="grid gap-3">
          {sortedPlayers.slice(0, 8).map((player, index) => (
            <motion.div
              key={player.id}
              className="flex items-center justify-between rounded-2xl bg-white/5 px-6 py-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center gap-4">
                <span className="w-8 text-2xl font-bold text-white/30">{index + 1}</span>
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    background: player.presenceStatus === 'active' ? '#22c55e' : '#ef4444',
                  }}
                />
                <span className="text-2xl font-semibold text-white">{player.name}</span>
                {player.isHost && (
                  <span className="rounded-full bg-accent/20 px-3 py-1 text-xs uppercase tracking-wider text-accent">
                    Host
                  </span>
                )}
              </div>
              <span className="font-display text-3xl font-black text-accent">
                {player.score ?? 0}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
