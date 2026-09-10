import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { OnlineRoundHeader } from '../components/game/OnlineRoundHeader'
import { RoomChatPanel } from '../components/lobby/RoomChatPanel'
import { PlayerAvatar } from '../components/game/PlayerAvatar'
import { GlowButton } from '../components/ui/GlowButton'
import { useLobby } from '../hooks/useLobby'
import { useOnlineRoundStore } from '../store/onlineRoundStore'
import { haptics } from '../lib/haptics'

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
  // Client-side abstain: the server has no "no vote" target, so a skip is tracked
  // locally, scoped to this round id (auto-expires when the round changes). An
  // abstaining player simply casts nothing — finish_round tolerates partial votes.
  const voteSkippedForRoundId = useOnlineRoundStore((s) => s.voteSkippedForRoundId)
  const setVoteSkippedForRoundId = useOnlineRoundStore((s) => s.setVoteSkippedForRoundId)
  const isSkipped = round != null && voteSkippedForRoundId === round.id
  const hasSubmittedVote = submittedVoteTargetId != null
  const availableTargets = players

  function selectTarget(targetId: string) {
    // Picking someone always cancels a pending skip — you can't accuse and abstain.
    if (isSkipped) setVoteSkippedForRoundId(null)
    setSelectedTargetId(targetId)
  }

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
          <OnlineRoundHeader
            roundNumber={round?.roundNumber ?? 1}
            phaseLabel="Online Voting"
            categories={round?.sourceCategories ?? []}
          />
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
            const isSelf = target.id === localPlayerId
            const isSelected = !isSkipped && selectedTargetId === target.id

            return (
              <motion.div
                key={target.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isSkipped ? 0.4 : 1, x: 0, scale: isSelected ? 1.05 : 1 }}
                transition={{ delay: index * 0.04, duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="flex w-[180px] justify-center"
              >
                <button
                  type="button"
                  onClick={() => selectTarget(target.id)}
                  className="relative flex w-full justify-center rounded-3xl border p-5 transition-all"
                  style={{
                    background: isSelected
                      ? isSelf
                        ? 'rgba(239,68,68,0.18)'
                        : 'rgba(124,58,237,0.2)'
                      : 'rgba(255,255,255,0.04)',
                    borderColor: isSelected
                      ? isSelf
                        ? 'rgba(239,68,68,0.8)'
                        : 'var(--color-accent)'
                      : 'rgba(255,255,255,0.14)',
                    boxShadow: isSelected
                      ? isSelf
                        ? '0 0 30px rgba(239,68,68,0.35), inset 0 0 0 1px rgba(239,68,68,0.3)'
                        : '0 0 30px var(--color-accent-glow), inset 0 0 0 1px rgba(168,85,247,0.25)'
                      : 'none',
                  }}
                >
                  {isSelected && (
                    <div
                      className="absolute right-3 top-3 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                      style={{
                        background: isSelf ? 'rgba(239,68,68,0.25)' : 'rgba(168,85,247,0.18)',
                        border: isSelf ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(168,85,247,0.35)',
                        color: isSelf ? '#fca5a5' : 'var(--color-accent-light)',
                      }}
                    >
                      {isSelf ? 'Self-Vote 🤡' : 'Selected'}
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-3 text-center">
                    <PlayerAvatar name={target.name} size="lg" />
                    <div className="space-y-1">
                      <p className="font-semibold text-white">
                        {target.name} {isSelf && <span className="text-xs text-white/50">(You)</span>}
                      </p>
                      <p
                        className="text-xs uppercase tracking-[0.2em]"
                        style={{ color: isSelf && isSelected ? '#fca5a5' : 'var(--color-text-muted)' }}
                      >
                        {isSelected
                          ? isSelf
                            ? 'Voting yourself 🤡'
                            : 'Selected'
                          : isSelf
                            ? 'Vote yourself'
                            : 'Tap to vote'}
                      </p>
                    </div>
                  </div>
                </button>
              </motion.div>
            )
          })}
        </div>

        <div className="flex w-full max-w-2xl flex-col gap-3">
          {isSkipped ? (
            <div className="flex flex-col gap-3 rounded-3xl border border-white/12 bg-white/[0.04] p-5 text-center">
              <p className="text-2xl">🙈</p>
              <p className="font-semibold text-white">You're sitting this vote out</p>
              <p className="text-sm text-white/50">
                You won't accuse anyone this round. Change your mind any time before the host reveals.
              </p>
              <GlowButton variant="secondary" onClick={() => setVoteSkippedForRoundId(null)}>
                Actually, let me vote
              </GlowButton>
            </div>
          ) : (
            <>
              <GlowButton
                onClick={() => {
                  if (selectedTargetId) {
                    haptics.medium()
                    void submitVote(selectedTargetId)
                  }
                }}
                disabled={!selectedTargetId}
              >
                {hasSubmittedVote ? 'Update Vote' : 'Submit Vote'}
              </GlowButton>

              {hasSubmittedVote ? (
                <p className="text-sm text-white/50">
                  Your vote is locked locally and can still be changed before the host reveals results.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    haptics.light()
                    setSelectedTargetId(null)
                    if (round) setVoteSkippedForRoundId(round.id)
                  }}
                  className="rounded-2xl border px-4 py-3 text-sm font-semibold transition hover:bg-white/[0.06]"
                  style={{
                    borderColor: 'rgba(255,255,255,0.14)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  🙈 Skip my vote — I'd rather not accuse anyone
                </button>
              )}
            </>
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

        <RoomChatPanel />
      </div>
    </motion.div>
  )
}
