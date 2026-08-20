import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { PlayerAvatar } from '../components/game/PlayerAvatar'
import { GlowButton } from '../components/ui/GlowButton'
import { useOfflineGame } from '../hooks/useOfflineGame'
import { useUIStore } from '../store/uiStore'
import { haptics } from '../lib/haptics'

const VOTE_CONFIRM_MS = 550

function formatPlayerName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return 'Player'
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`
}

export default function VotingScreen() {
  const setScreen = useUIStore((s) => s.setScreen)
  const {
    currentRound,
    currentVoter,
    currentVoterIndex,
    castVote,
    advanceToNextVoter,
    finishVoting,
    skipVoteGroupAccusation,
    hasVoted,
  } = useOfflineGame()
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null)
  const [confirmedTargetId, setConfirmedTargetId] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const players = currentRound?.players ?? []
  const totalVotes = players.length
  const votedCount = players.filter((player: { id: string }) => hasVoted(player.id)).length
  const currentPlayerName = formatPlayerName(currentVoter?.name ?? '')
  const selectedTarget = players.find(
    (player: { id: string; name: string }) => player.id === selectedTargetId,
  )
  const selectedTargetName = formatPlayerName(selectedTarget?.name ?? '')

  useEffect(() => {
    setSelectedTargetId(null)
    setConfirmedTargetId(null)
    setIsTransitioning(false)
  }, [currentVoterIndex])

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [])

  function handleConfirmVote() {
    if (!currentVoter || !selectedTargetId || isTransitioning) {
      return
    }

    setConfirmedTargetId(selectedTargetId)
    setIsTransitioning(true)
    haptics.medium()

    transitionTimeoutRef.current = setTimeout(() => {
      castVote(currentVoter.id, selectedTargetId)
      const isVotingComplete = advanceToNextVoter()

      if (isVotingComplete) {
        finishVoting()
        setScreen('results')
      }
    }, VOTE_CONFIRM_MS)
  }

  // Skip the one-by-one round-robin: the whole table has agreed on a suspect, so
  // record a group accusation against the current selection and jump to results.
  function handleSkipVote() {
    if (!selectedTargetId || isTransitioning) {
      return
    }

    setConfirmedTargetId(selectedTargetId)
    setIsTransitioning(true)
    haptics.heavy()

    transitionTimeoutRef.current = setTimeout(() => {
      skipVoteGroupAccusation(selectedTargetId)
      setScreen('results')
    }, VOTE_CONFIRM_MS)
  }

  if (!currentRound || !currentVoter) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 overflow-y-auto px-6 text-center"
        style={{ paddingBottom: 'max(80px, env(safe-area-inset-bottom))' }}
      >
        <h2 className="font-display text-3xl font-bold">Voting unavailable</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          There is no active round to vote on.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      key={currentVoter.id}
      className="flex min-h-screen items-start justify-center overflow-y-auto px-6 pt-12 md:items-center"
      style={{ paddingBottom: 'max(80px, env(safe-area-inset-bottom))' }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: isTransitioning ? 0 : 1, y: isTransitioning ? -12 : 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex w-full max-w-[900px] flex-col items-center justify-center gap-8 text-center">
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-sm uppercase tracking-[0.25em]" style={{ color: 'var(--color-text-muted)' }}>
            Vote {currentVoterIndex + 1} of {totalVotes}
          </p>
          <h2 className="font-display text-3xl font-bold">
            {currentPlayerName}, choose who you suspect
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Pass the phone after confirming your vote.
          </p>
        </motion.div>

        <div className="flex w-full max-w-xl flex-col items-center gap-2">
          <div
            className="flex w-full items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <span className="h-px flex-1 bg-white/10" />
            {votedCount} of {totalVotes} locked in
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {players.map((player: { id: string; name: string }) => {
              const voted = hasVoted(player.id)
              const isCurrent = player.id === currentVoter.id
              return (
                <span
                  key={player.id}
                  className="rounded-full border px-2.5 py-1 text-xs font-medium transition"
                  style={{
                    borderColor: voted
                      ? 'rgba(34,197,94,0.4)'
                      : isCurrent
                        ? 'var(--color-accent)'
                        : 'rgba(255,255,255,0.12)',
                    background: voted
                      ? 'rgba(34,197,94,0.12)'
                      : isCurrent
                        ? 'rgba(168,85,247,0.14)'
                        : 'rgba(255,255,255,0.03)',
                    color: voted
                      ? 'var(--color-success)'
                      : isCurrent
                        ? 'var(--color-accent-light)'
                        : 'var(--color-text-muted)',
                  }}
                >
                  {voted ? '✓ ' : isCurrent ? '• ' : ''}
                  {formatPlayerName(player.name)}
                </span>
              )
            })}
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-center gap-5">
          {players.map((target: { id: string; name: string }, index: number) => {
            const isSelf = target.id === currentVoter.id
            const isSelected = selectedTargetId === target.id
            const isConfirmed = confirmedTargetId === target.id

            return (
              <motion.div
                key={target.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: isTransitioning && !isConfirmed ? 0.35 : 1,
                  x: 0,
                  scale: isConfirmed ? [1, 1.04, 0.99, 1.02] : isSelected ? 1.05 : 1,
                }}
                transition={{
                  delay: index * 0.04,
                  duration: isConfirmed ? 0.38 : 0.24,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex w-[180px] justify-center"
              >
                <button
                  type="button"
                  disabled={isSelf || isTransitioning}
                  onClick={() => setSelectedTargetId(target.id)}
                  className="relative flex w-full justify-center rounded-3xl border p-5 transition-all disabled:cursor-not-allowed"
                  style={{
                    background: isSelected ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                    borderColor: isConfirmed
                      ? 'var(--color-success)'
                      : isSelected
                        ? 'var(--color-accent)'
                        : isSelf
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(255,255,255,0.14)',
                    boxShadow: isConfirmed
                      ? '0 0 26px rgba(34,197,94,0.35)'
                      : isSelected
                        ? '0 0 30px var(--color-accent-glow), inset 0 0 0 1px rgba(168,85,247,0.25)'
                        : 'none',
                    opacity: isSelf ? 0.45 : 1,
                  }}
                >
                  {isConfirmed && (
                    <motion.div
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        background: 'rgba(34,197,94,0.16)',
                        border: '1px solid rgba(34,197,94,0.45)',
                        color: 'var(--color-success)',
                      }}
                    >
                      ✓
                    </motion.div>
                  )}

                  {isSelected && !isConfirmed && (
                    <div
                      className="absolute right-3 top-3 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                      style={{
                        background: 'rgba(168,85,247,0.18)',
                        border: '1px solid rgba(168,85,247,0.35)',
                        color: 'var(--color-accent-light)',
                      }}
                    >
                      Selected
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-3 text-center">
                    <PlayerAvatar name={target.name} size="lg" />
                    <div className="space-y-1">
                      <p className="font-semibold text-white">{target.name}</p>
                      <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
                        {isSelf ? 'You' : isConfirmed ? 'Locked in' : isSelected ? 'Ready' : 'Tap to select'}
                      </p>
                    </div>
                  </div>
                </button>
              </motion.div>
            )
          })}
        </div>

        <div className="flex w-full flex-col items-center gap-4">
          <div className="w-full max-w-sm">
            <GlowButton onClick={handleConfirmVote} disabled={!selectedTargetId || isTransitioning}>
              {isTransitioning ? 'Confirming...' : 'Confirm Vote'}
            </GlowButton>
          </div>

          <div className="flex w-full max-w-sm flex-col items-center gap-2">
            <div className="flex w-full items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/25">
              <span className="h-px flex-1 bg-white/10" />
              or
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <button
              type="button"
              onClick={handleSkipVote}
              disabled={!selectedTargetId || isTransitioning}
              className="w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                borderColor: 'rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.03)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {selectedTargetId
                ? `⏭ Skip votes — accuse ${selectedTargetName}`
                : '⏭ Skip votes — tap a suspect first'}
            </button>
            <p className="text-center text-xs text-white/35">
              Everyone already pointing at the same person? Accuse them together and skip the round-robin.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
