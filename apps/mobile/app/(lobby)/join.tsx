import { useState } from 'react'
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import {
  getErrorMessage,
  getOnlineSchemaMismatchMessage,
  isOnlineSchemaCompatible,
  normalizeJoinLobbyResult,
  normalizeBootstrapPayload,
} from '../../lib/online'
import {
  ensureAnonymousSession,
  isSupabaseConfigured,
} from '../../lib/supabase'
import { useMobileLobbyStore } from '../../store/lobbyStore'
import { useMobileOnlineRoundStore } from '../../store/onlineRoundStore'

export default function JoinLobbyScreen() {
  const router = useRouter()
  const hydrateLobby = useMobileLobbyStore((state) => state.hydrateLobby)
  const setDisplayName = useMobileLobbyStore((state) => state.setDisplayName)
  const setLocalPlayerId = useMobileLobbyStore((state) => state.setLocalPlayerId)
  const setPendingAccessState = useMobileLobbyStore((state) => state.setPendingAccessState)
  const clearRound = useMobileOnlineRoundStore((state) => state.clearRound)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)

  async function hydrateByCode(codeValue: string) {
    const client = await ensureAnonymousSession()
    const { data, error: rpcError } = await client.rpc('get_online_bootstrap', {
      p_code: codeValue,
    })

    if (rpcError) {
      throw rpcError
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Lobby not found.')
    }

    const bootstrap = normalizeBootstrapPayload(data as Record<string, unknown>)
    if (!isOnlineSchemaCompatible(bootstrap.schemaVersion)) {
      throw new Error(getOnlineSchemaMismatchMessage(bootstrap.schemaVersion))
    }

    if (!bootstrap.lobby) {
      throw new Error('Lobby not found.')
    }

    hydrateLobby(bootstrap.lobby)
  }

  async function handleJoin() {
    const trimmedCode = code.trim().toUpperCase()
    const trimmedName = name.trim()

    if (trimmedCode.length !== 6 || !trimmedName) {
      setError('Enter a display name and a valid six-character code.')
      return
    }

    setIsJoining(true)
    setError(null)

    try {
      const client = await ensureAnonymousSession()
      const { data: lookupData, error: lookupError } = await client.rpc(
        'get_lobby_by_code',
        {
          p_code: trimmedCode,
        },
      )

      if (lookupError) {
        throw lookupError
      }

      if (!lookupData || typeof lookupData !== 'object') {
        throw new Error('Lobby not found.')
      }

      const lobbyId = String((lookupData as Record<string, unknown>)['id'] ?? '')
      if (!lobbyId) {
        throw new Error('Lobby not found.')
      }

      const { data, error: joinError } = await client.rpc('join_lobby', {
        p_lobby_id: lobbyId,
        p_name: trimmedName,
      })

      if (joinError) {
        throw joinError
      }

      if (!data || typeof data !== 'object') {
        throw new Error('Could not join the lobby.')
      }

      const joinResult = normalizeJoinLobbyResult(data as Record<string, unknown>)

      setDisplayName(trimmedName)

      if (joinResult.status === 'pending_approval') {
        clearRound()
        setPendingAccessState(trimmedCode, 'pending_approval', joinResult.requestId)
        router.push('/(lobby)/pending')
        return
      }

      setLocalPlayerId(joinResult.playerId)
      clearRound()
      await hydrateByCode(trimmedCode)
      router.push(`/(lobby)/${trimmedCode}`)
    } catch (joinError) {
      setError(getErrorMessage(joinError))
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Online</Text>
      <Text style={styles.subtitle}>Enter the lobby code and your display name.</Text>

      {!isSupabaseConfigured && (
        <Text style={styles.error}>
          Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable online play.
        </Text>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Lobby code"
        placeholderTextColor="#475569"
        value={code}
        onChangeText={(value) => setCode(value.toUpperCase())}
        autoCapitalize="characters"
        maxLength={6}
        keyboardType="default"
      />

      <TextInput
        style={styles.nameInput}
        placeholder="Display name"
        placeholderTextColor="#475569"
        value={name}
        onChangeText={setName}
        maxLength={32}
      />

      <Pressable
        style={[
          styles.button,
          (!isSupabaseConfigured || isJoining) && styles.buttonDisabled,
        ]}
        onPress={() => {
          void handleJoin()
        }}
        disabled={!isSupabaseConfigured || isJoining}
      >
        <Text style={styles.buttonText}>{isJoining ? 'Joining…' : 'Join Lobby'}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 24,
    backgroundColor: '#0A0A14',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#f1f5f9',
    fontFamily: 'serif',
  },
  subtitle: {
    color: '#94a3b8',
    textAlign: 'center',
    maxWidth: 280,
  },
  input: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    color: '#f1f5f9',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 8,
  },
  nameInput: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    color: '#f1f5f9',
    fontSize: 18,
  },
  button: {
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 20,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  error: {
    maxWidth: 320,
    color: '#fca5a5',
    textAlign: 'center',
  },
})
