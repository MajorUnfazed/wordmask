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
      <motion.h2
        className="font-display text-3xl font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Setup Game
      </motion.h2>

      <GlassCard className="w-full max-w-md p-6 flex flex-col gap-4">
        <h3 className="font-semibold text-lg">Players</h3>
        <div className="flex flex-col gap-2">
          {playerNames.map((name, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-accent"
                value={name}
                onChange={(e) => updateName(i, e.target.value)}
                maxLength={20}
              />
              {playerNames.length > 3 && (
                <button
                  onClick={() => removePlayer(i)}
                  className="px-2 text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {playerNames.length < 10 && (
          <button
            onClick={addPlayer}
            className="text-sm text-accent hover:text-accent-light"
          >
            + Add player
          </button>
        )}
      </GlassCard>

      <GlassCard className="w-full max-w-md p-6 flex flex-col gap-4">
        <h3 className="font-semibold text-lg">Settings</h3>
        <label className="flex items-center justify-between text-sm">
          <span style={{ color: 'var(--color-text-secondary)' }}>Impostors</span>
          <select
            value={impostorCount}
            onChange={(e) => setImpostorCount(Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded px-2 py-1"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </label>
        <label className="flex items-center justify-between text-sm">
          <span style={{ color: 'var(--color-text-secondary)' }}>
            Discussion ({discussionDuration}s)
          </span>
          <input
            type="range"
            min={30}
            max={180}
            step={15}
            value={discussionDuration}
            onChange={(e) => setDiscussionDuration(Number(e.target.value))}
            className="w-32"
          />
        </label>
      </GlassCard>

      <div className="w-full max-w-md">
        <GlowButton
          onClick={handleStart}
          disabled={playerNames.some((name) => name.trim().length === 0)}
        >
          Continue →
        </GlowButton>
      </div>
    </div>
  )
}
