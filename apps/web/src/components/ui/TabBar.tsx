/**
 * TabBar — fixed bottom navigation for the hub screens, matching the concept's
 * five-slot layout: Home · Packs · Play (centre) · Stats · More.
 *
 * Rendered by App only on hub screens and hidden during any active game or lobby
 * flow. "More" has no destination yet (settings/extras arrive in a later phase),
 * so it is shown disabled rather than faking a route.
 */
import { useUIStore, type AppScreen } from '../../store/uiStore'
import {
  IconHome,
  IconFolder,
  IconPlay,
  IconBarChart,
  IconMoreHorizontal,
  type IconProps,
} from './icons'

interface TabDef {
  screen: AppScreen
  label: string
  Icon: (props: IconProps) => JSX.Element
  match: AppScreen[]
}

const TABS: TabDef[] = [
  { screen: 'home', label: 'Home', Icon: IconHome, match: ['home'] },
  { screen: 'pack-browser', label: 'Packs', Icon: IconFolder, match: ['pack-browser', 'pack-creator'] },
  { screen: 'profile', label: 'Stats', Icon: IconBarChart, match: ['profile'] },
]

export function TabBar() {
  const screen = useUIStore((s) => s.screen)
  const setScreen = useUIStore((s) => s.setScreen)

  function Tab({ tab }: { tab: TabDef }) {
    const active = tab.match.includes(screen)
    return (
      <button
        onClick={() => setScreen(tab.screen)}
        className={`flex flex-1 flex-col items-center gap-1 py-1 transition-colors ${
          active ? 'text-cyan' : 'text-white/45 hover:text-white/80'
        }`}
      >
        {active && <span className="mb-0.5 h-0.5 w-6 rounded-full bg-cyan" style={{ boxShadow: '0 0 8px var(--color-cyan)' }} />}
        <tab.Icon size={22} />
        <span className="text-[10px] font-semibold uppercase tracking-wider">{tab.label}</span>
      </button>
    )
  }

  return (
    <nav
      className="glass glass-cyan fixed inset-x-0 bottom-0 z-30 flex items-center justify-around px-3 pt-2"
      style={{
        borderTop: '1px solid var(--color-cyan)',
        paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))',
      }}
    >
      <Tab tab={TABS[0]!} />
      <Tab tab={TABS[1]!} />

      {/* Centre Play — circular, echoing the concept's ringed play control */}
      <div className="flex flex-1 flex-col items-center gap-1">
        <button
          onClick={() => setScreen('mode')}
          aria-label="Play"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan/60 bg-cyan/10 text-cyan transition-transform hover:scale-105 active:scale-95"
          style={{ boxShadow: '0 0 16px var(--color-cyan-glow)' }}
        >
          <IconPlay size={20} />
        </button>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/45">Play</span>
      </div>

      <Tab tab={TABS[2]!} />

      {/* More — no destination yet; disabled rather than faking a route */}
      <button
        type="button"
        disabled
        title="More — coming soon"
        className="flex flex-1 cursor-not-allowed flex-col items-center gap-1 py-1 text-white/25"
      >
        <IconMoreHorizontal size={22} />
        <span className="text-[10px] font-semibold uppercase tracking-wider">More</span>
      </button>
    </nav>
  )
}
