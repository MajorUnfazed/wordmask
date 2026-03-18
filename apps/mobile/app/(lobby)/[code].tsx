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
    hydrateLobby,
    clearLobby,
  } = useMobileLobbyStore()
  const [error, setError] = useState<string | null>(null)
  const resolvedCode = useMemo(
    () => (code ?? routeCode ?? '').toUpperCase(),
    [code, routeCode],
  )
  const isHost = Boolean(localPlayerId && hostPlayerId && localPlayerId === hostPlayerId)

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
          .subscribe()
      } catch (syncError) {
        if (isActive) {
          setError(getErrorMessage(syncError))
        }
      }
    })()

    return () => {
      isActive = false
      if (channel && client) {
        void client.removeChannel(channel)
      }
    }
  }, [lobbyId, refreshLobby, resolvedCode])

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
            {player.isHost && <Text style={styles.hostTag}>Host</Text>}
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
