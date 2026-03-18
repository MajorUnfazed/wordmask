import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PlayerAvatar } from '../components/game/PlayerAvatar'
import { GlowButton } from '../components/ui/GlowButton'
import { useLobby } from '../hooks/useLobby'

export default function OnlineVotingScreen() {
  const {
    players,
    localPlayerId,
    round,
    submittedVoteTargetId,
    isHost,
    isBusy,
    error,
    submitVote,
    finishRound,
  } = useLobby()
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(
    submittedVoteTargetId,
  )
  const availableTargets = useMemo(
    () => players.filter((player) => player.id !== localPlayerId),
    [localPlayerId, players],
  )

  return (
    <motion.div
      className="flex min-h-screen items-start justify-center overflow-y-auto px-6 pt-12 md:items-center"
      style={{ paddingBottom: 'max(80px, env(safe-area-inset-bottom))' }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex w-full max-w-[900px] flex-col items-center justify-center gap-8 text-center">
        <motion.div className="flex flex-col items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-sm uppercase tracking-[0.25em]" style={{ color: 'var(--color-text-muted)' }}>
            Online Voting
          </p>
          <h2 className="font-display text-3xl font-bold">
            Choose the player you suspect
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            You can change your vote until the host reveals the result.
          </p>
          {round?.voteProgress && (
            <p className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/55">
              {round.voteProgress.submitted}/{round.voteProgress.total} votes submitted
            </p>
          )}
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

        <div className="flex w-full flex-wrap items-center justify-center gap-5">
          {availableTargets.map((target, index) => {
            const isSelected = selectedTargetId === target.id

            return (
              <motion.div
                key={target.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0, scale: isSelected ? 1.05 : 1 }}
                transition={{ delay: index * 0.04, duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="flex w-[180px] justify-center"
              >
                <button
                  type="button"
                  onClick={() => setSelectedTargetId(target.id)}
                  className="relative flex w-full justify-center rounded-3xl border p-5 transition-all"
                  style={{
                    background: isSelected ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                    borderColor: isSelected
                      ? 'var(--color-accent)'
                      : 'rgba(255,255,255,0.14)',
                    boxShadow: isSelected
                      ? '0 0 30px var(--color-accent-glow), inset 0 0 0 1px rgba(168,85,247,0.25)'
                      : 'none',
                  }}
                >
                  <div className="flex flex-col items-center gap-3 text-center">
                    <PlayerAvatar name={target.name} size="lg" />
                    <div className="space-y-1">
                      <p className="font-semibold text-white">{target.name}</p>
                      <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
                        {isSelected ? 'Selected' : 'Tap to vote'}
                      </p>
                    </div>
                  </div>
                </button>
              </motion.div>
            )
          })}
        </div>

        <div className="flex w-full max-w-2xl flex-col gap-3">
          <GlowButton
            onClick={() => {
              if (selectedTargetId) {
                void submitVote(selectedTargetId)
              }
            }}
            disabled={!selectedTargetId}
          >
            {submittedVoteTargetId ? 'Update Vote' : 'Submit Vote'}
          </GlowButton>

          {submittedVoteTargetId && (
            <p className="text-sm text-white/50">
              Your vote is locked locally and can still be changed before the host reveals results.
            </p>
          )}

          {isHost ? (
            round?.voteProgress &&
            round.voteProgress.submitted >= round.voteProgress.total ? (
              <GlowButton
                variant="secondary"
                onClick={() => {
                  void finishRound()
                }}
                disabled={isBusy}
              >
                {isBusy ? 'Revealing…' : 'Reveal Results'}
              </GlowButton>
            ) : (
              <GlowButton
                variant="secondary"
                onClick={() => {
                  void finishRound()
                }}
                disabled={isBusy}
              >
                {isBusy ? 'Revealing…' : 'Reveal Anyway'}
              </GlowButton>
            )
          ) : (
            <p className="text-sm text-white/50">
              Waiting for the host to reveal the results…
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
