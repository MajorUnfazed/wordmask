import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../components/ui/GlassCard'
import { GlowButton } from '../components/ui/GlowButton'
import { useLobby } from '../hooks/useLobby'
import { useUIStore } from '../store/uiStore'

export default function OnlineSpectatorScreen() {
  const setScreen = useUIStore((s) => s.setScreen)
  const { code, round, players, error } = useLobby()

  const phase = round?.phase ?? null
  const phaseLabel: Record<string, string> = {
    role_reveal: 'Role Reveal',
    discussion: 'Discussion',
    voting: 'Voting',
    final_impostor_guess: 'Final Guess',
    results: 'Results',
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 overflow-y-auto px-6 py-12">
      <motion.div
        className="w-full max-w-md text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm uppercase tracking-[0.25em]" style={{ color: 'var(--color-text-muted)' }}>
          Spectating · {code ?? '…'}
        </p>
        <h2 className="mt-2 font-display text-4xl font-bold">
          {phase ? phaseLabel[phase] ?? phase : 'Waiting for game…'}
        </h2>
        <p className="mt-2 text-white/50 text-sm">You are watching. You cannot vote or see private roles.</p>
      </motion.div>

      {error && (
        <div
          className="w-full max-w-md rounded-2xl border px-4 py-3 text-sm"
          style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: 'rgb(252,165,165)' }}
        >
          {error}
        </div>
      )}

      {round?.voteProgress && (
        <GlassCard className="w-full max-w-md rounded-3xl p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-white/40">Vote Progress</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="font-display text-5xl font-bold text-accent">
              {round.voteProgress.submitted}
            </span>
            <span className="mb-2 text-xl text-white/50">/ {round.voteProgress.total}</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-2 rounded-full"
              style={{ background: 'var(--color-accent)' }}
              animate={{ width: `${(round.voteProgress.submitted / Math.max(round.voteProgress.total, 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </GlassCard>
      )}

      <GlassCard className="w-full max-w-md rounded-3xl p-5">
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/40">Players</p>
        <div className="flex flex-col gap-3">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: player.presenceStatus === 'active' ? '#22c55e'
                      : player.presenceStatus === 'away' ? '#ef4444'
                      : '#f59e0b',
                  }}
                />
                <span className="text-sm font-medium text-white/90">{player.name}</span>
                {player.isHost && (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">
                    Host
                  </span>
                )}
              </div>
              <span className="font-display text-lg font-bold text-accent">
                {player.score ?? 0}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlowButton variant="secondary" onClick={() => setScreen('home')}>
        Leave
      </GlowButton>
    </div>
  )
}
