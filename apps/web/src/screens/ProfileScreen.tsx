import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../components/ui/GlassCard'
import { GlowButton } from '../components/ui/GlowButton'
import { useUIStore } from '../store/uiStore'
import { useLobbyStore } from '../store/lobbyStore'
import { ensureAnonymousSession, isSupabaseConfigured } from '../lib/supabase'

interface PlayerStats {
  gamesPlayed: number
  wins: number
  losses: number
  impostorWins: number
  crewWins: number
  jesterWins: number
  correctVotes: number
  incorrectVotes: number
  wordsGuessed: number
  longestWinStreak: number
  currentWinStreak: number
}

function StatCard({ label, value, emoji }: { label: string; value: number | string; emoji: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/5 px-4 py-5 text-center transition hover:bg-white/10">
      <span className="text-2xl">{emoji}</span>
      <span className="font-display text-2xl font-bold text-accent">{value}</span>
      <span className="text-xs uppercase tracking-[0.15em] text-white/40">{label}</span>
    </div>
  )
}

export default function ProfileScreen() {
  const setScreen = useUIStore((s) => s.setScreen)
  const localDisplayName = useLobbyStore((s) => s.displayName)
  const setLocalDisplayName = useLobbyStore((s) => s.setDisplayName)

  const [displayName, setDisplayName] = useState(localDisplayName || 'Player')
  const [equippedTitle, setEquippedTitle] = useState<string | null>('Master Impostor')
  const [stats, setStats] = useState<PlayerStats>({
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    impostorWins: 0,
    crewWins: 0,
    jesterWins: 0,
    correctVotes: 0,
    incorrectVotes: 0,
    wordsGuessed: 0,
    longestWinStreak: 0,
    currentWinStreak: 0,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    void loadProfile()
  }, [])

  async function loadProfile() {
    // Load local storage stats if available
    try {
      const stored = localStorage.getItem('wordmask_player_stats')
      if (stored) {
        setStats(JSON.parse(stored) as PlayerStats)
      }
    } catch {
      // Ignore local storage error
    }

    if (!isSupabaseConfigured) return

    try {
      const client = await ensureAnonymousSession()
      const { data: { user } } = await client.auth.getUser()
      if (!user) return

      const [profileRes, statsRes] = await Promise.all([
        client.from('profiles').select('display_name, equipped_title').eq('id', user.id).maybeSingle(),
        client.from('player_statistics').select('*').eq('profile_id', user.id).maybeSingle(),
      ])

      if (profileRes.data) {
        const name = String(profileRes.data.display_name || '').trim()
        if (name) {
          setDisplayName(name)
          setLocalDisplayName(name)
        }
        if (profileRes.data.equipped_title) {
          setEquippedTitle(String(profileRes.data.equipped_title))
        }
      } else {
        // Upsert initial profile
        await client.from('profiles').upsert({ id: user.id, display_name: displayName })
      }

      if (statsRes.data) {
        const d = statsRes.data as Record<string, unknown>
        setStats({
          gamesPlayed: Number(d['games_played'] ?? 0),
          wins: Number(d['wins'] ?? 0),
          losses: Number(d['losses'] ?? 0),
          impostorWins: Number(d['impostor_wins'] ?? 0),
          crewWins: Number(d['crew_wins'] ?? 0),
          jesterWins: Number(d['jester_wins'] ?? 0),
          correctVotes: Number(d['correct_votes'] ?? 0),
          incorrectVotes: Number(d['incorrect_votes'] ?? 0),
          wordsGuessed: Number(d['words_guessed'] ?? 0),
          longestWinStreak: Number(d['longest_win_streak'] ?? 0),
          currentWinStreak: Number(d['current_win_streak'] ?? 0),
        })
      }
    } catch {
      // Graceful fallback to local state
    }
  }

  async function handleSaveName() {
    const trimmed = displayName.trim()
    if (!trimmed) return
    setSaving(true)
    setLocalDisplayName(trimmed)

    if (isSupabaseConfigured) {
      try {
        const client = await ensureAnonymousSession()
        const { data: { user } } = await client.auth.getUser()
        if (user) {
          await client.from('profiles').upsert({ id: user.id, display_name: trimmed, updated_at: new Date().toISOString() })
        }
      } catch {
        // Ignore
      }
    }

    setSaving(false)
    setIsEditing(false)
    setMessage('Profile name updated!')
    setTimeout(() => setMessage(null), 3000)
  }

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 overflow-y-auto px-6 py-12">
      <motion.div
        className="w-full max-w-md text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm uppercase tracking-[0.25em]" style={{ color: 'var(--color-text-muted)' }}>
          Player Profile
        </p>
        
        {isEditing ? (
          <div className="mt-3 flex items-center justify-center gap-2">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={32}
              className="rounded-2xl border border-white/20 bg-black/40 px-4 py-2 text-center font-display text-2xl font-bold text-white outline-none focus:border-accent"
              autoFocus
            />
            <button
              onClick={() => void handleSaveName()}
              disabled={saving || !displayName.trim()}
              className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/80 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        ) : (
          <div className="mt-2 flex items-center justify-center gap-3">
            <h2 className="font-display text-4xl font-bold">{displayName}</h2>
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-sm text-white/60 hover:bg-white/10 hover:text-white"
              title="Edit Name"
            >
              ✏️
            </button>
          </div>
        )}

        {equippedTitle && (
          <p className="mt-2 text-sm font-semibold tracking-wider text-accent">{equippedTitle}</p>
        )}
      </motion.div>

      {message && (
        <div className="w-full max-w-md rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-300">
          ✓ {message}
        </div>
      )}

      <GlassCard className="w-full max-w-md rounded-3xl p-5">
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/40">Overview</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Games" value={stats.gamesPlayed} emoji="🎮" />
          <StatCard label="Win Rate" value={`${winRate}%`} emoji="🏆" />
          <StatCard label="Win Streak" value={stats.currentWinStreak} emoji="🔥" />
          <StatCard label="Best Streak" value={stats.longestWinStreak} emoji="⭐" />
        </div>
      </GlassCard>

      <GlassCard className="w-full max-w-md rounded-3xl p-5">
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/40">Role Wins</p>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Crew" value={stats.crewWins} emoji="👥" />
          <StatCard label="Impostor" value={stats.impostorWins} emoji="😈" />
          <StatCard label="Jester" value={stats.jesterWins} emoji="🃏" />
        </div>
      </GlassCard>

      <GlassCard className="w-full max-w-md rounded-3xl p-5">
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/40">Accuracy</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Correct Votes" value={stats.correctVotes} emoji="✅" />
          <StatCard label="Wrong Votes" value={stats.incorrectVotes} emoji="❌" />
        </div>
      </GlassCard>

      <GlowButton variant="secondary" onClick={() => setScreen('home')}>
        Back
      </GlowButton>
    </div>
  )
}
