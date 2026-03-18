import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlowButton } from '../components/ui/GlowButton'
import { GlassCard } from '../components/ui/GlassCard'
import { useOfflineGame } from '../hooks/useOfflineGame'
import { useUIStore } from '../store/uiStore'
import type { Player } from '@impostor/core'
import { PLAYER_COLORS, PLAYER_EMOJIS, getRandomColor, getRandomEmoji } from '../lib/customization'

function createDefaultPlayerName(index: number): string {
  return `Player ${index + 1}`
}

type PlayerSetup = {
  name: string
  emoji: string
  color: string
}

function PlayerSetupRow({
  player,
  index,
  updatePlayer,
  removePlayer,
  canRemove,
}: {
  player: PlayerSetup
  index: number
  updatePlayer: (index: number, updates: Partial<PlayerSetup>) => void
  removePlayer: (index: number) => void
  canRemove: boolean
}) {
  const [showEmojis, setShowEmojis] = useState(false)

  return (
    <div
      className="flex flex-col gap-3 p-3 bg-black/20 rounded-2xl border transition-colors duration-300"
      style={{ borderColor: `${player.color}40` }}
    >
      <div className="flex gap-3 items-center">
        <button
          onClick={() => setShowEmojis(!showEmojis)}
          className="text-3xl shrink-0 h-14 w-14 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
        >
          {player.emoji}
        </button>
        
        <input
          className="flex-1 bg-transparent text-lg text-white outline-none placeholder-white/30 font-medium"
          value={player.name}
          placeholder={`Player ${index + 1}`}
          onChange={(e) => updatePlayer(index, { name: e.target.value })}
          maxLength={20}
        />

        {canRemove && (
          <button
            onClick={() => removePlayer(index)}
            className="p-2 text-white/30 hover:text-danger hover:bg-white/5 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        )}
      </div>

      <AnimatePresence>
        {showEmojis && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 pt-2 pb-3 px-1 border-b border-white/5 mb-2">
              {PLAYER_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    updatePlayer(index, { emoji: e })
                    setShowEmojis(false)
                  }}
                  className={`text-2xl hover:scale-110 transition-transform ${player.emoji === e ? 'scale-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'opacity-70 hover:opacity-100'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color Dots */}
      <div className="flex gap-2 px-1 pb-1 overflow-x-auto pt-1">
        {PLAYER_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => updatePlayer(index, { color: c })}
            className={`w-6 h-6 rounded-full shrink-0 transition-all ${
              player.color === c
                ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#1a1a24]'
                : 'hover:scale-110 opacity-50 hover:opacity-100'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  )
}

export default function OfflineSetupScreen() {
  const setScreen = useUIStore((s) => s.setScreen)
  const { initializeOfflineGame } = useOfflineGame()

  const [playersSetup, setPlayersSetup] = useState<PlayerSetup[]>(() =>
    Array.from({ length: 4 }, (_, index) => ({
      name: createDefaultPlayerName(index),
      emoji: getRandomEmoji(),
      color: getRandomColor(),
    }))
  )
  const [impostorCount, setImpostorCount] = useState(1)
  const [discussionDuration, setDiscussionDuration] = useState(60)
  
  const [bluffMode, setBluffMode] = useState(false)
  const [anonymousVoting, setAnonymousVoting] = useState(false)

  function addPlayer() {
    if (playersSetup.length < 10) {
      setPlayersSetup((players) => [
        ...players,
        {
          name: createDefaultPlayerName(players.length),
          emoji: getRandomEmoji(),
          color: getRandomColor(),
        },
      ])
    }
  }

  function removePlayer(index: number) {
    if (playersSetup.length > 3) {
      setPlayersSetup((p) => p.filter((_, i) => i !== index))
    }
  }

  function updatePlayer(index: number, updates: Partial<PlayerSetup>) {
    setPlayersSetup((p) =>
      p.map((player, i) => (i === index ? { ...player, ...updates } : player))
    )
  }

  function handleStart() {
    const validPlayers = playersSetup.filter((p) => p.name.trim().length > 0)
    if (validPlayers.length < 3) return

    const corePlayers: Player[] = validPlayers.map((p, i) => ({
      id: `player-${i}`,
      name: p.name.trim(),
      emoji: p.emoji,
      color: p.color,
      score: 0,
      isEliminated: false,
    }))

    initializeOfflineGame(
      {
        playerCount: corePlayers.length,
        impostorCount,
        selectedCategories: [],
        discussionDuration,
        maxRounds: 5,
        ...(bluffMode || anonymousVoting
          ? { mutators: { ...(bluffMode && { bluffMode: true }), ...(anonymousVoting && { anonymousVoting: true }) } }
          : {}),
      },
      corePlayers,
    )

    setScreen('category')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-6 px-6 py-12 overflow-y-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-2 mb-2 text-center"
      >
        <p className="text-sm uppercase tracking-[0.25em]" style={{ color: 'var(--color-text-muted)' }}>Lobbies</p>
        <h2 className="font-display text-4xl font-bold tracking-wide">
          Setup Game
        </h2>
      </motion.div>

      <GlassCard className="w-full max-w-lg p-6 flex flex-col gap-6 rounded-3xl">
        <h3 className="font-display font-medium text-lg text-white">Players</h3>
        <div className="flex flex-col gap-4">
          {playersSetup.map((player, i) => (
            <PlayerSetupRow
              key={i}
              index={i}
              player={player}
              updatePlayer={updatePlayer}
              removePlayer={removePlayer}
              canRemove={playersSetup.length > 3}
            />
          ))}
        </div>
        
        {playersSetup.length < 10 && (
          <button
            onClick={addPlayer}
            className="flex items-center justify-center gap-2 py-4 mt-2 rounded-2xl border border-dashed border-white/20 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Player
          </button>
        )}
      </GlassCard>

      <GlassCard className="w-full max-w-lg p-6 flex flex-col gap-6 rounded-3xl mb-4">
        <h3 className="font-display font-medium text-lg text-white">Settings</h3>
        
        <label className="flex items-center justify-between text-base group">
          <span className="text-white/70">Impostors</span>
          <select
            value={impostorCount}
            onChange={(e) => setImpostorCount(Number(e.target.value))}
            className="bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-white outline-none cursor-pointer focus:border-accent appearance-none font-medium text-center"
            style={{ WebkitAppearance: 'none' }}
          >
            <option value={1} className="bg-void text-white font-medium">1 Impostor</option>
            <option value={2} className="bg-void text-white font-medium">2 Impostors</option>
          </select>
        </label>

        <label className="flex flex-col gap-4 group">
          <div className="flex items-center justify-between text-base pt-2">
            <span className="text-white/70">Discussion Time</span>
            <span className="font-semibold text-accent text-lg">{discussionDuration}s</span>
          </div>
          <input
            type="range"
            min={30}
            max={180}
            step={15}
            value={discussionDuration}
            onChange={(e) => setDiscussionDuration(Number(e.target.value))}
            className="w-full h-3 bg-white/10 rounded-full appearance-none outline-none cursor-pointer 
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 
            [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:rounded-full"
          />
        </label>

        <div className="h-px bg-white/5 w-full my-2" />

        <h3 className="font-display font-medium text-lg text-white">Mutators</h3>

        <label className="flex items-center justify-between text-base group cursor-pointer">
          <div className="flex flex-col gap-1">
            <span className="text-white/90 font-medium">Bluff Mode</span>
            <span className="text-xs text-white/50 max-w-[200px]">Impostor sees the word but not the category</span>
          </div>
          <div className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${bluffMode ? 'bg-accent' : 'bg-white/10'}`}>
            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${bluffMode ? 'translate-x-6' : ''}`} />
          </div>
          <input type="checkbox" className="hidden" checked={bluffMode} onChange={(e) => setBluffMode(e.target.checked)} />
        </label>

        <label className="flex items-center justify-between text-base group cursor-pointer pb-2">
          <div className="flex flex-col gap-1">
            <span className="text-white/90 font-medium">Anonymous Voting</span>
            <span className="text-xs text-white/50 max-w-[200px]">Votes are hidden until the end</span>
          </div>
          <div className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${anonymousVoting ? 'bg-accent' : 'bg-white/10'}`}>
            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${anonymousVoting ? 'translate-x-6' : ''}`} />
          </div>
          <input type="checkbox" className="hidden" checked={anonymousVoting} onChange={(e) => setAnonymousVoting(e.target.checked)} />
        </label>
      </GlassCard>

      <div className="w-full max-w-lg pb-8">
        <GlowButton
          onClick={handleStart}
          disabled={playersSetup.some((p) => p.name.trim().length === 0)}
        >
          Continue
        </GlowButton>
      </div>
    </div>
  )
}
