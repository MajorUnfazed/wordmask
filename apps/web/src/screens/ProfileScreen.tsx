import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../components/ui/GlassCard'
import { GlowButton } from '../components/ui/GlowButton'
import { useUIStore } from '../store/uiStore'
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

interface Profile {
  displayName: string
  avatarUrl: string | null
  equippedTitle: string | null
}

function StatCard({ label, value, emoji }: { label: string; value: number | string; emoji: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/5 px-4 py-5 text-center">
      <span className="text-2xl">{emoji}</span>
      <span className="font-display text-2xl font-bold text-accent">{value}</span>
      <span className="text-xs uppercase tracking-[0.15em] text-white/40">{label}</span>
    </div>
  )
}

export default function ProfileScreen() {
  const setScreen = useUIStore((s) => s.setScreen)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Connect a Supabase project to enable profiles.')
      setLoading(false)
      return
    }
    void fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const client = await ensureAnonymousSession()
      const { data: { user } } = await client.auth.getUser()
      if (!user) {
        setError('Sign in to view your profile.')
        return
      }

      const [profileRes, statsRes] = await Promise.all([
        client.from('profiles').select('display_name, avatar_url, equipped_title').eq('id', user.id).single(),
        client.from('player_statistics').select('*').eq('profile_id', user.id).single(),
      ])

      if (profileRes.data) {
        setProfile({
          displayName: String(profileRes.data.display_name ?? 'Player'),
          avatarUrl: profileRes.data.avatar_url ? String(profileRes.data.avatar_url) : null,
          equippedTitle: profileRes.data.equipped_title ? String(profileRes.data.equipped_title) : null,
        })
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }

  const winRate = stats && stats.gamesPlayed > 0
    ? Math.round((stats.wins / stats.gamesPlayed) * 100)
    : 0

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 overflow-y-auto px-6 py-12">
      <motion.div
        className="w-full max-w-md text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm uppercase tracking-[0.25em]" style={{ color: 'var(--color-text-muted)' }}>
          Player
        </p>
        <h2 className="mt-2 font-display text-4xl font-bold">
          {loading ? 'Loading…' : (profile?.displayName ?? 'Profile')}
        </h2>
        {profile?.equippedTitle && (
          <p className="mt-2 text-sm text-accent">{profile.equippedTitle}</p>
        )}
      </motion.div>

      {error && (
        <div
          className="w-full max-w-md rounded-2xl border px-4 py-3 text-sm"
          style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: 'rgb(252,165,165)' }}
        >
          {error}
        </div>
      )}

      {stats && (
        <>
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
        </>
      )}

      <GlowButton variant="secondary" onClick={() => setScreen('home')}>
        Back
      </GlowButton>
    </div>
  )
}
