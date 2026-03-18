import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../components/ui/GlassCard'
import { GlowButton } from '../components/ui/GlowButton'
import { useLobby } from '../hooks/useLobby'

export default function OnlineResultsScreen() {
  const { round, result, players, error, isHost, loadRoundResult, returnToLobby, startNextRound } = useLobby()

  useEffect(() => {
    if (!result && round?.id) {
      void loadRoundResult(round.id)
    }
  }, [loadRoundResult, result, round?.id])

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-white/60">
        Preparing results…
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 overflow-y-auto px-6 py-12">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className="mb-4 text-6xl">{result.impostorsCaught ? '🎉' : '😈'}</div>
        <h2 className="font-display text-4xl font-bold">
          {result.impostorsCaught ? 'Caught!' : result.isTie ? 'Stalemate' : 'Escaped!'}
        </h2>
        <p className="mt-2 text-white/60">
          {result.impostorsCaught
            ? `The impostor was ${result.impostors.map((player) => player.name).join(', ')}.`
            : result.isTie
              ? 'The room tied and nobody was eliminated.'
              : `${result.impostors.map((player) => player.name).join(', ')} fooled the room.`}
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

      <GlassCard className="w-full max-w-md rounded-3xl p-5 text-center">
        <p className="mb-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          The word was
        </p>
        <p className="font-display text-2xl font-bold text-accent">{result.word}</p>
        <p className="mt-1 text-sm text-white/60">{result.hint}</p>
        <p className="mt-4 text-sm text-white/70">
          {result.eliminatedPlayerName
            ? `Eliminated player: ${result.eliminatedPlayerName}`
            : 'Nobody was eliminated.'}
        </p>
      </GlassCard>

      <GlassCard className="w-full max-w-md rounded-3xl p-5">
        <h3 className="font-display text-xl font-bold">Vote Summary</h3>
        <div className="mt-4 flex flex-col gap-3">
          {result.voteSummary.length === 0 ? (
            <p className="text-sm text-white/50">No votes were recorded.</p>
          ) : (
            result.voteSummary.map((item) => {
              const targetName = players.find((player) => player.id === item.targetId)?.name
              return (
                <div
                  key={item.targetId}
                  className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
                >
                  <span className="text-sm text-white/80">
                    {targetName || item.targetId}
                  </span>
                  <span className="font-display text-lg text-accent">{item.voteCount}</span>
                </div>
              )
            })
          )}
        </div>
      </GlassCard>

      <div className="flex w-full max-w-md flex-col gap-3">
        {isHost && (
          <GlowButton
            onClick={() => {
              void startNextRound()
            }}
          >
            Next Round
          </GlowButton>
        )}
        <GlowButton variant={isHost ? 'secondary' : 'primary'} onClick={returnToLobby}>
          Back to Lobby
        </GlowButton>
      </div>
    </div>
  )
}
