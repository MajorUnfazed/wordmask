import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlowButton } from '../components/ui/GlowButton'
import { GlassCard } from '../components/ui/GlassCard'
import { useOfflineGame } from '../hooks/useOfflineGame'
import { useUIStore } from '../store/uiStore'
import type { Player } from '@impostor/core'

function createDefaultPlayerName(index: number): string {
  return `Player ${index + 1}`
}

export default function OfflineSetupScreen() {
  const setScreen = useUIStore((s) => s.setScreen)
  const { initializeOfflineGame } = useOfflineGame()

  const [playerNames, setPlayerNames] = useState<string[]>(() =>
    Array.from({ length: 4 }, (_, index) => createDefaultPlayerName(index)),
  )
  const [impostorCount, setImpostorCount] = useState(1)
  const [discussionDuration, setDiscussionDuration] = useState(60)

  function addPlayer() {
    if (playerNames.length < 10) {
      setPlayerNames((players) => [...players, createDefaultPlayerName(players.length)])
    }
  }

  function removePlayer(index: number) {
    if (playerNames.length > 3) {
      setPlayerNames((p) => p.filter((_, i) => i !== index))
    }
  }

  function updateName(index: number, name: string) {
    setPlayerNames((p) => p.map((n, i) => (i === index ? name : n)))
  }

  function handleStart() {
    const validNames = playerNames.filter((n) => n.trim().length > 0)
    if (validNames.length < 3) return

    const players: Player[] = validNames.map((name, i) => ({
      id: `player-${i}`,
      name: name.trim(),
      score: 0,
      isEliminated: false,
    }))

    initializeOfflineGame(
      {
        playerCount: players.length,
        impostorCount,
        selectedCategories: [],
        discussionDuration,
        maxRounds: 5,
      },
      players,
    )

    // Navigate into the offline flow
    setScreen('category')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-6 px-6 py-12 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-2 mb-2 text-center"
      >
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Lobbies</p>
        <h2 className="font-display text-4xl font-bold tracking-wide text-gradient">
          SETUP GAME
        </h2>
      </motion.div>

      <GlassCard className="glass-panel w-full max-w-md p-6 flex flex-col gap-5 rounded-3xl">
        <h3 className="font-display font-bold text-xl tracking-wide text-white">Players</h3>
        <div className="flex flex-col gap-3">
          {playerNames.map((name, i) => (
            <div key={i} className="flex gap-2 group relative">
              <input
                className="flex-1 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 text-base text-white outline-none transition-all placeholder-white/30 focus:bg-white/[0.06] focus:border-accent-purple focus:ring-1 focus:ring-accent-purple"
                value={name}
                placeholder={`Player ${i + 1}`}
                onChange={(e) => updateName(i, e.target.value)}
                maxLength={20}
              />
              {playerNames.length > 3 && (
                <button
                  onClick={() => removePlayer(i)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/30 hover:text-danger hover:bg-white/5 rounded-lg transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              )}
            </div>
          ))}
        </div>
        {playerNames.length < 10 && (
          <button
            onClick={addPlayer}
            className="flex items-center justify-center gap-2 py-3 mt-1 rounded-xl border border-dashed border-white/20 text-sm font-semibold tracking-wide text-accent-blue hover:border-accent-blue/50 hover:bg-accent-blue/10 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Player
          </button>
        )}
      </GlassCard>

      <GlassCard className="glass-panel w-full max-w-md p-6 flex flex-col gap-6 rounded-3xl mb-4">
        <h3 className="font-display font-bold text-xl tracking-wide text-white">Settings</h3>
        
        <label className="flex items-center justify-between text-base group">
          <span className="text-white/70 font-medium tracking-wide">Impostors</span>
          <select
            value={impostorCount}
            onChange={(e) => setImpostorCount(Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none cursor-pointer hover:bg-white/10 focus:border-accent-purple appearance-none"
            style={{ WebkitAppearance: 'none' }}
          >
            <option value={1} className="bg-void text-white">1 Impostor</option>
            <option value={2} className="bg-void text-white">2 Impostors</option>
          </select>
        </label>

        <label className="flex flex-col gap-3 group">
          <div className="flex items-center justify-between text-base">
            <span className="text-white/70 font-medium tracking-wide">Discussion Time</span>
            <span className="text-accent-blue font-bold">{discussionDuration}s</span>
          </div>
          <input
            type="range"
            min={30}
            max={180}
            step={15}
            value={discussionDuration}
            onChange={(e) => setDiscussionDuration(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none outline-none cursor-pointer 
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
            [&::-webkit-slider-thumb]:bg-accent-blue [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(56,189,248,0.6)]"
          />
        </label>
      </GlassCard>

      <div className="w-full max-w-md pb-8">
        <GlowButton
          onClick={handleStart}
          disabled={playerNames.some((name) => name.trim().length === 0)}
        >
          CONTINUE
        </GlowButton>
      </div>
    </div>
  )
}
