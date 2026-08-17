import { useEffect, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Wordmark } from '../components/ui/Wordmark'
import { MaskEmblem } from '../components/ui/MaskEmblem'
import { useUIStore, type AppScreen } from '../store/uiStore'
import { useGameStore } from '../store/gameStore'
import { useLobbyStore } from '../store/lobbyStore'
import { useDisplayStats } from '../hooks/useDisplayStats'
import { isSupabaseConfigured } from '../lib/supabase'
import {
  IconBell,
  IconUser,
  IconFolder,
  IconTrophy,
  IconSettings,
  IconGamepad,
  IconBarChart,
  IconStar,
  IconFlame,
  IconClock,
  IconTarget,
  IconSwords,
  IconStopwatch,
  IconShield,
  IconLock,
  IconArrowRight,
  IconChevronRight,
  type IconProps,
} from '../components/ui/icons'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

function SoonPill() {
  return (
    <span className="rounded-full border border-cyan/30 bg-cyan/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-cyan/80">
      Soon
    </span>
  )
}

/** A row in the main navigation list. Locked rows show a lock + "Soon" and don't navigate. */
function MenuRow({
  Icon,
  title,
  subtitle,
  onClick,
  locked,
}: {
  Icon: (p: IconProps) => JSX.Element
  title: string
  subtitle: string
  onClick?: () => void
  locked?: boolean
}) {
  return (
    <button
      type="button"
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className={`group flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors ${
        locked ? 'cursor-not-allowed' : 'hover:bg-white/[0.04]'
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
          locked
            ? 'border-white/10 bg-white/[0.04] text-white/30'
            : 'border-cyan/20 bg-cyan/10 text-cyan'
        }`}
      >
        <Icon size={21} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block font-display text-[15px] font-bold tracking-wide ${locked ? 'text-white/45' : 'text-white'}`}>
          {title}
        </span>
        <span className="block truncate text-xs text-white/40">{subtitle}</span>
      </span>
      {locked ? (
        <span className="flex shrink-0 items-center gap-2">
          <SoonPill />
          <span className="text-white/25"><IconLock size={16} /></span>
        </span>
      ) : (
        <span className="shrink-0 text-white/25 transition-transform group-hover:translate-x-0.5">
          <IconChevronRight size={20} />
        </span>
      )}
    </button>
  )
}

function StatRow({ Icon, label, value }: { Icon: (p: IconProps) => JSX.Element; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-cyan/80"><Icon size={16} /></span>
      <span className="flex-1 text-[13px] text-white/60">{label}</span>
      <span className="font-display text-[15px] font-bold text-white">{value}</span>
    </div>
  )
}

/** A quick-play mode tile. Locked modes show a lock overlay and don't navigate. */
function ModeCard({
  Icon,
  title,
  subtitle,
  onClick,
  locked,
}: {
  Icon: (p: IconProps) => JSX.Element
  title: string
  subtitle: string
  onClick?: () => void
  locked?: boolean
}) {
  return (
    <button
      type="button"
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className={`relative flex flex-col gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3.5 text-left transition-all ${
        locked ? 'cursor-not-allowed' : 'hover:-translate-y-0.5 hover:border-cyan/25 hover:bg-white/[0.05]'
      }`}
    >
      <span className={`${locked ? 'text-white/30' : 'text-cyan'}`}><Icon size={24} /></span>
      <span className={`font-display text-[13px] font-bold leading-tight ${locked ? 'text-white/45' : 'text-white'}`}>
        {title}
      </span>
      <span className="text-[11px] leading-tight text-white/40">{subtitle}</span>
      {locked ? (
        <span className="absolute right-2.5 top-2.5 text-white/25"><IconLock size={14} /></span>
      ) : (
        <span className="absolute bottom-3 right-2.5 text-cyan/60"><IconArrowRight size={16} /></span>
      )}
    </button>
  )
}

export default function HomeScreen() {
  const setScreen = useUIStore((s) => s.setScreen)
  const savedScreen = useUIStore((s) => s.savedScreen)
  const restoreSavedScreen = useUIStore((s) => s.restoreSavedScreen)
  const onlineLobbyCode = useLobbyStore((s) => s.code)
  const onlineAccessState = useLobbyStore((s) => s.accessState)
  const displayName = useLobbyStore((s) => s.displayName)

  const resetGame = useGameStore((s) => s.resetGame)
  const hasOfflineGame = useGameStore((s) => {
    const phase = s.engine?.getState()?.phase
    return phase && phase !== 'IDLE' && phase !== 'SETUP'
  })
  const hasResumeTarget = Boolean(savedScreen && (hasOfflineGame || onlineLobbyCode || savedScreen === 'online-create'))

  const { stats } = useDisplayStats()
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0

  // Avoid hydration mismatch flashing on the resume affordance.
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  function goFresh(target: AppScreen) {
    if (hasOfflineGame) resetGame()
    setScreen(target)
  }

  function handleResumeGame() {
    if (onlineLobbyCode && onlineAccessState !== 'member') {
      setScreen('online-pending-approval')
    } else if (onlineLobbyCode) {
      setScreen('online-lobby')
    } else if (savedScreen) {
      restoreSavedScreen()
    } else {
      setScreen('mode')
    }
  }

  const showResume = mounted && hasResumeTarget

  return (
    <motion.div
      className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 pb-28 pt-10"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* ── Header ── */}
      <motion.header variants={item} className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <Wordmark variant="terminal" className="text-4xl sm:text-[2.75rem]" />
            <p className="mt-1 text-sm text-white/45">Blend in. Or get exposed.</p>
          </div>
          <button
            type="button"
            disabled
            title="Notifications — coming soon"
            aria-label="Notifications"
            className="mt-1 flex h-9 w-9 shrink-0 cursor-not-allowed items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/35"
          >
            <IconBell size={18} />
          </button>
        </div>

        {/* User / rank card → profile */}
        <button
          type="button"
          onClick={() => setScreen('profile')}
          className="glass flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
          style={{ borderColor: 'rgba(168,85,247,0.3)' }}
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)' }}
          >
            <IconUser size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-sm font-bold uppercase tracking-wider text-white">
              {displayName || 'USER_01'}
            </span>
            <span className="block text-xs text-cyan/80">Rank: Masked</span>
          </span>
          <span className="text-white/30"><IconChevronRight size={18} /></span>
        </button>
      </motion.header>

      {/* ── PLAY hero ── */}
      <motion.div variants={item}>
        <button
          type="button"
          onClick={showResume ? handleResumeGame : () => goFresh('mode')}
          className="relative flex min-h-[150px] w-full items-center overflow-hidden rounded-3xl px-5 py-6 text-left transition-transform hover:scale-[1.01] active:scale-[0.99]"
          style={{
            background: 'linear-gradient(105deg, #4c1d95 0%, #7c3aed 46%, #c026d3 100%)',
            boxShadow: '0 0 30px rgba(124,58,237,0.35), inset 0 0 40px rgba(192,38,211,0.15)',
          }}
        >
          {/* decorative ring + mask on the right */}
          <div className="pointer-events-none absolute -right-3 top-1/2 -translate-y-1/2 opacity-95">
            <MaskEmblem size={168} />
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/40 text-white"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <IconArrowRight size={22} />
            </span>
            <div>
              <h2
                className="font-display text-4xl font-black uppercase tracking-wide text-cyan"
                style={{ textShadow: '0 0 20px var(--color-cyan-glow)' }}
              >
                {showResume ? 'Resume' : 'Play'}
              </h2>
              <p className="mt-0.5 text-sm font-medium text-white/70">
                {showResume ? 'Continue your game' : 'Execute Game'}
              </p>
            </div>
          </div>
        </button>

        {showResume && (
          <button
            type="button"
            onClick={() => goFresh('mode')}
            className="mt-2 w-full text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/40 transition-colors hover:text-cyan"
          >
            Start a new game instead
          </button>
        )}
      </motion.div>

      {/* ── Navigation list ── */}
      <motion.nav variants={item} className="glass overflow-hidden rounded-2xl divide-y divide-white/[0.06]">
        <MenuRow Icon={IconUser} title="USER_PROFILE" subtitle="View stats & progress" onClick={() => setScreen('profile')} />
        <MenuRow Icon={IconFolder} title="WORD_PACKS" subtitle="Unlock & manage packs" onClick={() => setScreen('pack-browser')} />
        <MenuRow Icon={IconTrophy} title="LEADERBOARDS" subtitle="Top masked players" locked />
        <MenuRow Icon={IconSettings} title="SETTINGS" subtitle="Sound, graphics & more" locked />
      </motion.nav>

      {/* ── Stats + Daily challenge widgets ── */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        {/* YOUR STATS — real data from useDisplayStats() */}
        <div className="glass flex flex-col gap-3 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white/70">Your Stats</h3>
            <button onClick={() => setScreen('profile')} className="text-[11px] font-semibold text-cyan/80 hover:text-cyan">
              View all
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            <StatRow Icon={IconGamepad} label="Games Played" value={stats.gamesPlayed} />
            <StatRow Icon={IconBarChart} label="Win Rate" value={`${winRate}%`} />
            <StatRow Icon={IconStar} label="Best Score" value={stats.bestScore} />
            <StatRow Icon={IconFlame} label="Current Streak" value={stats.currentWinStreak} />
          </div>
          <button
            onClick={() => setScreen('profile')}
            className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-cyan/20 bg-cyan/10 py-2 text-[11px] font-bold uppercase tracking-wider text-cyan transition-colors hover:bg-cyan/15"
          >
            View Full Stats <IconArrowRight size={13} />
          </button>
        </div>

        {/* DAILY CHALLENGE — Phase 4, shown honestly as coming soon */}
        <div className="glass relative flex flex-col gap-3 overflow-hidden rounded-2xl p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white/70">Daily Challenge</h3>
            <SoonPill />
          </div>
          <div className="flex items-center gap-3">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent/30 text-accent"
              style={{ background: 'rgba(124,58,237,0.12)' }}
            >
              <IconTarget size={26} />
            </span>
            <p className="text-[11px] leading-snug text-white/50">Score points without getting exposed</p>
          </div>
          {/* inert preview bar — no fake live progress */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-0 rounded-full bg-accent" />
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-white/35"><IconClock size={12} /> Locked</span>
            <span className="text-cyan/70">Reward: 250 XP</span>
          </div>
        </div>
      </motion.div>

      {/* ── Quick play ── */}
      <motion.div variants={item} className="flex flex-col gap-3">
        <p className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Quick Play</p>
        <div className="grid grid-cols-3 gap-3">
          <ModeCard Icon={IconSwords} title="Classic Mode" subtitle="Blend & Survive" onClick={() => goFresh('mode')} />
          <ModeCard Icon={IconStopwatch} title="Time Trial" subtitle="Beat the Clock" locked />
          <ModeCard Icon={IconShield} title="Hardened Mode" subtitle="For the Elite" locked />
        </div>
        {!isSupabaseConfigured && (
          <p className="px-1 text-[11px] text-white/30">
            Online play needs Supabase configured — Pass-the-Phone works offline from Play.
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}
