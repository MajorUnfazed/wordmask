import { motion } from 'framer-motion'
import { CountdownTimer } from '../components/ui/CountdownTimer'
import { GlowButton } from '../components/ui/GlowButton'
import { useLobby } from '../hooks/useLobby'

export default function OnlineDiscussionScreen() {
  const { round, isHost, isBusy, error, startVoting } = useLobby()

  if (!round) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-white/60">
        Waiting for the round…
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-10 overflow-y-auto px-6 pt-12 text-center"
      style={{ paddingBottom: 'max(80px, env(safe-area-inset-bottom))' }}
    >
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm uppercase tracking-[0.25em]" style={{ color: 'var(--color-text-muted)' }}>
          Online Discussion
        </p>
        <h2 className="font-display text-4xl font-bold">Talk it out</h2>
        <p className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/55">
          {round.readyToDiscussCount}/{round.readyToDiscussTotal} players revealed
        </p>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Trade clues, pressure the room, and decide who does not belong.
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

      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="scale-75 opacity-80">
          <CountdownTimer seconds={round.discussionDuration} />
        </div>
        <p className="text-xs uppercase tracking-[0.25em]" style={{ color: 'var(--color-text-muted)' }}>
          Discussion open
        </p>
      </motion.div>

      <div className="w-full max-w-sm">
        {isHost ? (
          <GlowButton
            onClick={() => {
              void startVoting()
            }}
            disabled={isBusy}
          >
            {isBusy ? 'Opening…' : 'Open Voting'}
          </GlowButton>
        ) : (
          <p className="text-sm text-white/50">
            Host opening voting soon…
          </p>
        )}
      </div>
    </div>
  )
}
