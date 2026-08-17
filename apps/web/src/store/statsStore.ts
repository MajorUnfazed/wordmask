import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { EMPTY_STATS, applyRoundOutcome, type PlayerStats, type RoundOutcome } from '../lib/stats'

interface StatsStore {
  stats: PlayerStats
  /** Fold one resolved round's outcome into the local device totals. */
  recordRound: (outcome: RoundOutcome) => void
  resetStats: () => void
}

/**
 * Local device statistics. Persisted under `wordmask_player_stats`.
 * Online, signed-in players' authoritative stats live server-side; `useDisplayStats`
 * prefers the remote row when one exists, so this store is the source of truth for
 * offline / not-signed-in play (and a fallback otherwise).
 */
export const useStatsStore = create<StatsStore>()(
  persist(
    (set) => ({
      stats: EMPTY_STATS,
      recordRound: (outcome) => set((s) => ({ stats: applyRoundOutcome(s.stats, outcome) })),
      resetStats: () => set({ stats: EMPTY_STATS }),
    }),
    {
      name: 'wordmask_player_stats',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
