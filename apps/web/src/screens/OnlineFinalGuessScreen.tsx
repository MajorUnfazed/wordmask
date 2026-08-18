import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GlowButton } from '../components/ui/GlowButton'
import { GlassCard } from '../components/ui/GlassCard'
import { useLobby } from '../hooks/useLobby'
import { haptics } from '../lib/haptics'

export default function OnlineFinalGuessScreen() {
  const { role, isBusy, error, submitFinalImpostorGuess } = useLobby()
  const [guess, setGuess] = useState('')
  const isCaughtImpostor = role?.role === 'IMPOSTOR'

  // The caught impostor feels a heavy buzz — "you've been exposed".
  useEffect(() => {
    if (isCaughtImpostor) haptics.heavy()
  }, [isCaughtImpostor])

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 text-center">
      <GlassCard className="w-full max-w-md rounded-[32px] p-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="text-6xl">😈</div>
          <h1 className="mt-5 font-display text-3xl font-bold">You&apos;ve been caught.</h1>
          <p className="mt-3 text-white/65">You have one final chance: guess the secret word.</p>
        </motion.div>
        {isCaughtImpostor ? (
          <form
            className="mt-7 space-y-3"
            onSubmit={(event) => { event.preventDefault(); void submitFinalImpostorGuess(guess) }}
          >
            <input
              value={guess}
              onChange={(event) => setGuess(event.target.value)}
              maxLength={80}
              autoComplete="off"
              placeholder="Your final guess"
              className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-4 text-center text-lg text-white outline-none focus:border-accent"
            />
            <GlowButton disabled={isBusy || !guess.trim()}>{isBusy ? 'Checking…' : 'Lock In Guess'}</GlowButton>
          </form>
        ) : (
          <p className="mt-7 text-sm text-white/50">The impostor is making their final guess. Watch closely.</p>
        )}
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      </GlassCard>
    </div>
  )
}
