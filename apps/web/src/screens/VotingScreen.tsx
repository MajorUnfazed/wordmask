import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { PlayerAvatar } from '../components/game/PlayerAvatar'
import { GlowButton } from '../components/ui/GlowButton'
import { useOfflineGame } from '../hooks/useOfflineGame'
import { useUIStore } from '../store/uiStore'
import { sounds } from '../lib/sounds'

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
  } = useOfflineGame()
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null)
  const [confirmedTargetId, setConfirmedTargetId] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const players = currentRound?.players ?? []
  const totalVotes = players.length
  const currentPlayerName = formatPlayerName(currentVoter?.name ?? '')

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
    sounds.voteConfirm()

    transitionTimeoutRef.current = setTimeout(() => {
      castVote(currentVoter.id, selectedTargetId)
      const isVotingComplete = advanceToNextVoter()

      if (isVotingComplete) {
        finishVoting()
        setScreen('results')
      }
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
      initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
      animate={{ 
        opacity: isTransitioning ? 0 : 1, 
        y: isTransitioning ? -12 : 0,
        filter: isTransitioning ? 'blur(10px)' : 'blur(0px)'
      }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex w-full max-w-[900px] flex-col items-center justify-center gap-8 text-center">
        <motion.div
          className="flex flex-col items-center gap-4 mb-6"
          initial={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent-blue">
            Vote {currentVoterIndex + 1} of {totalVotes}
          </p>
          <h2 className="font-display text-4xl font-black tracking-wide text-gradient">
            {currentPlayerName}, choose a suspect
          </h2>
          <p className="text-base font-medium tracking-wide text-white/50">
            Pass the phone after confirming your vote.
          </p>
        </motion.div>

        <div className="flex w-full flex-wrap items-center justify-center gap-5">
          {players.map((target, index) => {
            const isSelf = target.id === currentVoter.id
            const isSelected = selectedTargetId === target.id
            const isConfirmed = confirmedTargetId === target.id

            return (
              <motion.div
                key={target.id}
                initial={{ opacity: 0, x: -20, y: 0, rotate: 0 }}
                animate={{
                  opacity: isTransitioning && !isConfirmed ? 0 : 1,
                  x: 0,
                  y: isConfirmed ? -20 : (isTransitioning && !isSelected) ? 100 : 0,
                  rotate: (isTransitioning && !isConfirmed) ? (index % 2 === 0 ? 12 : -12) : 0,
                  scale: isConfirmed ? [1, 1.04, 0.99, 1.05] : isSelected ? 1.05 : 1,
                }}
                transition={{
                  delay: index * 0.04,
                  duration: isTransitioning ? 0.6 : 0.24,
                  ease: isTransitioning ? [0.32, 0, 0.67, 0] : [0.16, 1, 0.3, 1],
                }}
                className="flex w-[180px] justify-center"
                style={{ zIndex: isConfirmed ? 50 : 1 }}
              >
                <button
                  type="button"
                  disabled={isSelf || isTransitioning}
                  onClick={() => setSelectedTargetId(target.id)}
                  className="relative flex w-full justify-center rounded-[28px] border p-6 transition-all disabled:cursor-not-allowed glass-panel group overflow-hidden"
                  style={{
                    background: isSelected ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.03)',
                    borderColor: isConfirmed
                      ? 'rgba(34,197,94,0.6)'
                      : isSelected
                        ? 'rgba(168,85,247,0.5)'
                        : isSelf
                          ? 'transparent'
                          : 'rgba(255,255,255,0.08)',
                    boxShadow: isConfirmed
                      ? '0 0 30px rgba(34,197,94,0.25), inset 0 0 0 1px rgba(34,197,94,0.4)'
                      : isSelected
                        ? '0 12px 32px rgba(168,85,247,0.3), inset 0 0 0 1px rgba(168,85,247,0.5)'
                        : '0 8px 24px rgba(0,0,0,0.2)',
                    opacity: isSelf ? 0.4 : 1,
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

                    <div className="flex flex-col items-center gap-3 text-center relative z-10">
                    <PlayerAvatar name={target.name} size="lg" />
                    <div className="space-y-1">
                      <p className={`font-display text-lg font-bold tracking-wide ${isSelected ? 'text-white' : 'text-white/80'}`}>{target.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                        {isSelf ? 'YOU' : isConfirmed ? 'LOCKED IN' : isSelected ? 'READY' : 'SELECT'}
                      </p>
                    </div>
                  </div>
                </button>
              </motion.div>
            )
          })}
        </div>
          <motion.div 
            className="w-full max-w-sm mt-4"
            animate={{ opacity: isTransitioning ? 0 : 1, y: isTransitioning ? 20 : 0 }}
          >
            <GlowButton onClick={handleConfirmVote} disabled={!selectedTargetId || isTransitioning}>
              {isTransitioning ? 'CONFIRMING...' : 'CONFIRM VOTE'}
            </GlowButton>
          </motion.div>
      </div>
    </motion.div>
  )
}
