import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { OnlineRoleCard } from '../components/game/OnlineRoleCard'
import { GlassCard } from '../components/ui/GlassCard'
import { GlowButton } from '../components/ui/GlowButton'
import { useLobby } from '../hooks/useLobby'

export default function OnlineRoleRevealScreen() {
  const {
    players,
    localPlayerId,
    role,
    round,
    isHost,
    isBusy,
    error,
    loadRole,
    startDiscussion,
  } = useLobby()
  const [revealed, setRevealed] = useState(false)
  const playerName = useMemo(
    () => players.find((player) => player.id === localPlayerId)?.name ?? 'Player',
    [localPlayerId, players],
  )

  useEffect(() => {
    if (!role) {
      void loadRole()
    }
  }, [loadRole, role])

  if (!round) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-white/60">
        Loading round…
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm uppercase tracking-[0.25em]" style={{ color: 'var(--color-text-muted)' }}>
          Round {round.roundNumber}
        </p>
        <h2 className="mt-2 font-display text-4xl font-bold">Private Role Reveal</h2>
        <p className="mt-3 text-white/60">
          Swipe up to reveal your role on your device. Nobody else should be looking.
        </p>
      </motion.div>

      {error && (
        <div
          className="w-full max-w-md rounded-2xl border px-4 py-3 text-sm"
          style={{
            borderColor: 'rgba(239,68,68,0.3)',
            background: 'rgba(239,68,68,0.08)',
            color: 'rgb(252,165,165)',
          }}
        >
          {error}
        </div>
      )}

      <GlassCard className="w-full max-w-md rounded-[32px] p-8 text-center">
        {role ? (
          <div className="flex flex-col items-center gap-5">
            <OnlineRoleCard
              playerName={playerName}
              role={role.role}
              word={role.word}
              hint={role.hint}
              revealed={revealed}
              onReveal={() => setRevealed(true)}
            />
            {!revealed && (
              <p className="text-sm text-white/60">
                Drag the card upward until it flips.
              </p>
            )}
          </div>
        ) : (
          <div className="py-8 text-white/60">Loading your role…</div>
        )}
      </GlassCard>

      {revealed && (
        <div className="w-full max-w-md">
          {isHost ? (
            <GlowButton
              onClick={() => {
                void startDiscussion()
              }}
              disabled={isBusy}
            >
              {isBusy ? 'Starting…' : 'Open Discussion'}
            </GlowButton>
          ) : (
            <p className="text-center text-sm text-white/50">
              Waiting for the host to start the discussion…
            </p>
          )}
        </div>
      )}
    </div>
  )
}
