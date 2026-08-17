/**
 * useDisplayStats — resolves which player-statistics to show.
 *
 * Signed-in online players have authoritative stats server-side; a device also keeps
 * local stats for offline / not-signed-in play. This hook prefers the remote row when
 * it exists and has recorded at least one game, otherwise falls back to the local
 * device stats. That avoids double counting (each mode records exactly once) at the
 * accepted cost that a signed-in player's earlier offline games are hidden once a
 * remote row exists.
 */
import { useEffect, useState } from 'react'
import { mapRowToStats, type PlayerStats } from '../lib/stats'
import { useStatsStore } from '../store/statsStore'
import { ensureAnonymousSession, isSupabaseConfigured } from '../lib/supabase'

export interface DisplayStats {
  stats: PlayerStats
  loading: boolean
  source: 'local' | 'remote'
}

export function useDisplayStats(): DisplayStats {
  const localStats = useStatsStore((s) => s.stats)
  const [remote, setRemote] = useState<PlayerStats | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    let cancelled = false

    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    void (async () => {
      try {
        const client = await ensureAnonymousSession()
        const { data: { user } } = await client.auth.getUser()
        if (!user) return
        const { data } = await client
          .from('player_statistics')
          .select('*')
          .eq('profile_id', user.id)
          .maybeSingle()
        if (!cancelled && data) {
          setRemote(mapRowToStats(data as Record<string, unknown>))
        }
      } catch {
        // Fall back to local stats.
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const useRemote = remote != null && remote.gamesPlayed > 0
  return {
    stats: useRemote ? remote : localStats,
    loading,
    source: useRemote ? 'remote' : 'local',
  }
}
