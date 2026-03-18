import { useCallback, useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getErrorMessage, normalizeLobbySnapshot } from '../../lib/online'
import {
  ensureAnonymousSession,
  getSupabaseClient,
  isSupabaseConfigured,
} from '../../lib/supabase'
import { useMobileLobbyStore } from '../../store/lobbyStore'

export default function LobbyRoomScreen() {
  const { code: routeCode } = useLocalSearchParams<{ code: string }>()
  const router = useRouter()
  const {
    lobbyId,
    code,
    players,
    localPlayerId,
    hostPlayerId,
    status,
    displayName,
    selectedCategories,
    hydrateLobby,
    clearLobby,
  } = useMobileLobbyStore()
  const [error, setError] = useState<string | null>(null)
  const resolvedCode = useMemo(
    () => (code ?? routeCode ?? '').toUpperCase(),
    [code, routeCode],
  )
  const isHost = Boolean(localPlayerId && hostPlayerId && localPlayerId === hostPlayerId)
  const localPlayer = useMemo(
    () => players.find((player) => player.id === localPlayerId) ?? null,
    [localPlayerId, players],
  )

  const refreshLobby = useCallback(async () => {
    if (!resolvedCode) {
      return
    }

    const client = await ensureAnonymousSession()
    const { data, error: rpcError } = await client.rpc('get_lobby_state', {
      p_code: resolvedCode,
    })

    if (rpcError) {
      throw rpcError
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Lobby not found.')
    }

    hydrateLobby(normalizeLobbySnapshot(data as Record<string, unknown>))
  }, [hydrateLobby, resolvedCode])

  useEffect(() => {
    if (!isSupabaseConfigured || !resolvedCode) {
      return
    }

    let isActive = true
    let channel: RealtimeChannel | null = null
    let client = getSupabaseClient()

    void (async () => {
      try {
        client = await ensureAnonymousSession()
        if (!isActive) {
          return
        }

        await refreshLobby()

        if (!lobbyId && !useMobileLobbyStore.getState().lobbyId) {
          return
        }

        const activeLobbyId = useMobileLobbyStore.getState().lobbyId
        if (!activeLobbyId) {
          return
        }

        channel = client
          .channel(`mobile-lobby:${activeLobbyId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'players',
              filter: `lobby_id=eq.${activeLobbyId}`,
            },
            () => {
              void refreshLobby()
            },
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'lobbies',
              filter: `id=eq.${activeLobbyId}`,
            },
            () => {
              void refreshLobby()
            },
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'rounds',
              filter: `lobby_id=eq.${activeLobbyId}`,
            },
            () => {
              void refreshLobby()
            },
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'lobby_events',
              filter: `lobby_id=eq.${activeLobbyId}`,
            },
            () => {
              void refreshLobby()
            },
          )
          .subscribe()
      } catch (syncError) {
        if (isActive) {
          setError(getErrorMessage(syncError))
        }
      }
    })()

    const pollInterval = setInterval(() => {
      void refreshLobby()
    }, 4000)

    return () => {
      isActive = false
      clearInterval(pollInterval)
      if (channel && client) {
        void client.removeChannel(channel)
      }
    }
  }, [lobbyId, refreshLobby, resolvedCode])

  useEffect(() => {
    if (!lobbyId || !isSupabaseConfigured) {
      return
    }

    const heartbeat = async () => {
      try {
        const client = await ensureAnonymousSession()
        await client.rpc('heartbeat_player', {
          p_lobby_id: lobbyId,
        })
      } catch {
        // Background heartbeat should not block mobile lobby UI.
      }
    }

    void heartbeat()
    const heartbeatInterval = setInterval(() => {
      void heartbeat()
    }, 5000)

    return () => {
      clearInterval(heartbeatInterval)
    }
  }, [lobbyId])

  function getPresenceText(presenceStatus: 'active' | 'reconnecting' | 'away') {
    switch (presenceStatus) {
      case 'away':
        return 'Away'
      case 'reconnecting':
        return 'Reconnecting'
      default:
        return 'Active'
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Room code</Text>
        <Text style={styles.code}>{resolvedCode}</Text>
        {displayName && <Text style={styles.youLabel}>You are {displayName}</Text>}
      </View>

      {!isSupabaseConfigured && (
        <Text style={styles.error}>
          Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable online play.
        </Text>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.categoryCard}>
        <Text style={styles.sectionLabel}>Round Categories</Text>
        <View style={styles.categoryWrap}>
          {selectedCategories.map((category) => (
            <View key={category} style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>{category}</Text>
            </View>
          ))}
        </View>
      </View>

      {status === 'playing' ? (
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Round Started</Text>
          <Text style={styles.bannerText}>
            Mobile gameplay is not included in this phase. Keep this lobby open or switch to the web client.
          </Text>
        </View>
      ) : (
        <Text style={styles.waiting}>
          {isHost
            ? 'Players are joining. Start the round from the web client when ready.'
            : 'Waiting for the host to start the round…'}
        </Text>
      )}

      {status === 'waiting' && localPlayer && (
        <Pressable
          style={[
            styles.readyButton,
            localPlayer.isReady && styles.readyButtonActive,
          ]}
          onPress={() => {
            void (async () => {
              try {
                const client = await ensureAnonymousSession()
                await client.rpc('set_player_ready', {
                  p_lobby_id: useMobileLobbyStore.getState().lobbyId,
                  p_ready: !localPlayer.isReady,
                })
                await refreshLobby()
              } catch (readyError) {
                setError(getErrorMessage(readyError))
              }
            })()
          }}
        >
          <Text style={styles.readyButtonText}>
            {localPlayer.isReady ? 'Not Ready' : 'Ready Up'}
          </Text>
        </Pressable>
      )}

      <View style={styles.playerList}>
        {players.map((player) => (
          <View key={player.id} style={styles.playerRow}>
            <View style={styles.playerLeft}>
              <View
                style={[
                  styles.playerBadge,
                  player.id === localPlayerId && styles.playerBadgeYou,
                ]}
              >
                <Text style={styles.playerBadgeText}>{player.name[0]?.toUpperCase()}</Text>
              </View>
              <Text style={styles.playerName}>
                {player.name}
                {player.id === localPlayerId ? ' (you)' : ''}
              </Text>
            </View>
            <View style={styles.playerTags}>
              {player.isHost && <Text style={styles.hostTag}>Host</Text>}
              <Text style={[styles.tag, player.isReady ? styles.tagReady : styles.tagMuted]}>
                {player.isReady ? 'Ready' : 'Not Ready'}
              </Text>
              <Text
                style={[
                  styles.tag,
                  player.presenceStatus === 'away'
                    ? styles.tagAway
                    : player.presenceStatus === 'reconnecting'
                      ? styles.tagReconnect
                      : styles.tagActive,
                ]}
              >
                {getPresenceText(player.presenceStatus)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => {
          void (async () => {
            try {
              if (useMobileLobbyStore.getState().lobbyId) {
                const client = await ensureAnonymousSession()
                await client.rpc('leave_lobby', {
                  p_lobby_id: useMobileLobbyStore.getState().lobbyId,
                })
              }
            } catch {
              // Best effort cleanup.
            } finally {
              clearLobby()
              router.replace('/')
            }
          })()
        }}
      >
        <Text style={styles.secondaryButtonText}>Leave Lobby</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: 24,
    backgroundColor: '#0A0A14',
  },
  codeCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
    gap: 6,
    width: '100%',
    maxWidth: 340,
  },
  codeLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  code: {
    fontSize: 40,
    fontWeight: '900',
    color: '#a855f7',
    letterSpacing: 10,
    fontFamily: 'serif',
  },
  youLabel: {
    color: '#e2e8f0',
    fontSize: 14,
  },
  waiting: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 320,
  },
  sectionLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  categoryCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 16,
    gap: 12,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.35)',
    backgroundColor: 'rgba(124,58,237,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryChipText: {
    color: '#ddd6fe',
    fontSize: 12,
    fontWeight: '600',
  },
  banner: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.3)',
    backgroundColor: 'rgba(250,204,21,0.08)',
    padding: 16,
    gap: 8,
  },
  bannerTitle: {
    color: '#fde68a',
    fontSize: 16,
    fontWeight: '700',
  },
  bannerText: {
    color: '#f8fafc',
    lineHeight: 20,
  },
  playerList: {
    width: '100%',
    maxWidth: 340,
    gap: 12,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  playerTags: {
    alignItems: 'flex-end',
    gap: 6,
  },
  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerBadgeYou: {
    backgroundColor: '#7c3aed',
  },
  playerBadgeText: {
    color: '#fff',
    fontWeight: '700',
  },
  playerName: {
    color: '#f8fafc',
    fontSize: 15,
  },
  hostTag: {
    color: '#c4b5fd',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tag: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  tagReady: {
    color: '#86efac',
    backgroundColor: 'rgba(34,197,94,0.16)',
  },
  tagMuted: {
    color: '#cbd5e1',
    backgroundColor: 'rgba(148,163,184,0.16)',
  },
  tagActive: {
    color: '#86efac',
    backgroundColor: 'rgba(34,197,94,0.16)',
  },
  tagReconnect: {
    color: '#fde68a',
    backgroundColor: 'rgba(234,179,8,0.16)',
  },
  tagAway: {
    color: '#fca5a5',
    backgroundColor: 'rgba(239,68,68,0.16)',
  },
  readyButton: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#7c3aed',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  readyButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  readyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    maxWidth: 340,
    color: '#fca5a5',
    textAlign: 'center',
  },
})
