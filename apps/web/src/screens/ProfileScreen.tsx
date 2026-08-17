import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../components/ui/GlassCard'
import { GlowButton } from '../components/ui/GlowButton'
import { useUIStore } from '../store/uiStore'
import { useLobbyStore } from '../store/lobbyStore'
import { ensureAnonymousSession, isSupabaseConfigured } from '../lib/supabase'
import { useDisplayStats } from '../hooks/useDisplayStats'
import {
  IconGamepad,
  IconAward,
  IconZap,
  IconTrendingUp,
  IconTarget,
  IconUsers,
  IconEye,
  IconCrown,
  IconCheckCircle,
  IconXCircle,
  IconEdit,
  type IconProps,
} from '../components/ui/icons'

function StatCard({ label, value, Icon }: { label: string; value: number | string; Icon: (p: IconProps) => JSX.Element }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/5 px-4 py-5 text-center transition hover:bg-white/10">
      <span className="text-cyan"><Icon size={22} /></span>
      <span className="font-display text-2xl font-bold text-white">{value}</span>
      <span className="text-xs uppercase tracking-[0.15em] text-white/40">{label}</span>
    </div>
  )
}

export default function ProfileScreen() {
  const setScreen = useUIStore((s) => s.setScreen)
  const localDisplayName = useLobbyStore((s) => s.displayName)
  const setLocalDisplayName = useLobbyStore((s) => s.setDisplayName)

  const { stats } = useDisplayStats()

  const [displayName, setDisplayName] = useState(localDisplayName || 'Player')
  const [equippedTitle, setEquippedTitle] = useState<string | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    void loadProfile()
  }, [])

  async function loadProfile() {
    if (!isSupabaseConfigured) return

    try {
      const client = await ensureAnonymousSession()
      const { data: { user } } = await client.auth.getUser()
      if (!user) return

      const profileRes = await client
        .from('profiles')
        .select('display_name, equipped_title')
        .eq('id', user.id)
        .maybeSingle()

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
    <div className="flex min-h-screen flex-col items-center gap-8 overflow-y-auto px-6 pb-28 pt-12">
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
              className="rounded-2xl border border-white/20 bg-black/40 px-4 py-2 text-center font-display text-2xl font-bold text-white outline-none focus:border-cyan"
              autoFocus
            />
            <button
              onClick={() => void handleSaveName()}
              disabled={saving || !displayName.trim()}
              className="rounded-2xl bg-cyan px-4 py-2 text-sm font-semibold text-black hover:bg-cyan-light disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        ) : (
          <div className="mt-2 flex items-center justify-center gap-3">
            <h2 className="font-display text-4xl font-bold">{displayName}</h2>
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 hover:bg-white/10 hover:text-white"
              title="Edit Name"
            >
              <IconEdit size={16} />
            </button>
          </div>
        )}

        {equippedTitle && (
          <p className="mt-2 text-sm font-semibold tracking-wider text-cyan">{equippedTitle}</p>
        )}
      </motion.div>

      {message && (
        <div className="flex w-full max-w-md items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-300">
          <IconCheckCircle size={16} /> {message}
        </div>
      )}

      <GlassCard className="w-full max-w-md rounded-3xl p-5">
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/40">Overview</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Games" value={stats.gamesPlayed} Icon={IconGamepad} />
          <StatCard label="Win Rate" value={`${winRate}%`} Icon={IconAward} />
          <StatCard label="Win Streak" value={stats.currentWinStreak} Icon={IconZap} />
          <StatCard label="Best Streak" value={stats.longestWinStreak} Icon={IconTrendingUp} />
          <StatCard label="Best Score" value={stats.bestScore} Icon={IconTarget} />
          <StatCard label="Words Guessed" value={stats.wordsGuessed} Icon={IconCheckCircle} />
        </div>
      </GlassCard>

      <GlassCard className="w-full max-w-md rounded-3xl p-5">
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/40">Role Wins</p>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Crew" value={stats.crewWins} Icon={IconUsers} />
          <StatCard label="Impostor" value={stats.impostorWins} Icon={IconEye} />
          <StatCard label="Jester" value={stats.jesterWins} Icon={IconCrown} />
        </div>
      </GlassCard>

      <GlassCard className="w-full max-w-md rounded-3xl p-5">
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/40">Voting Accuracy</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Correct Votes" value={stats.correctVotes} Icon={IconCheckCircle} />
          <StatCard label="Wrong Votes" value={stats.incorrectVotes} Icon={IconXCircle} />
        </div>
      </GlassCard>

      <GlowButton variant="secondary" onClick={() => setScreen('home')}>
        Back
      </GlowButton>
    </div>
  )
}
