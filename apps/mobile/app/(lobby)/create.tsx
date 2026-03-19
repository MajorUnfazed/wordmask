import { useState } from 'react'
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import {
  getErrorMessage,
  getOnlineSchemaMismatchMessage,
  isOnlineSchemaCompatible,
  normalizeBootstrapPayload,
} from '../../lib/online'
import {
  ensureAnonymousSession,
  isSupabaseConfigured,
} from '../../lib/supabase'
import { useMobileLobbyStore } from '../../store/lobbyStore'
import { useMobileOnlineRoundStore } from '../../store/onlineRoundStore'

export default function CreateLobbyScreen() {
  const router = useRouter()
  const hydrateLobby = useMobileLobbyStore((state) => state.hydrateLobby)
  const setDisplayName = useMobileLobbyStore((state) => state.setDisplayName)
  const setLocalPlayerId = useMobileLobbyStore((state) => state.setLocalPlayerId)
  const clearRound = useMobileOnlineRoundStore((state) => state.clearRound)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  async function hydrateByCode(code: string) {
    const client = await ensureAnonymousSession()
    const { data, error: rpcError } = await client.rpc('get_online_bootstrap', {
      p_code: code,
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

  async function handleCreate() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Enter a display name to create a lobby.')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const client = await ensureAnonymousSession()
      const { data, error: rpcError } = await client.rpc('create_lobby', {
        p_name: trimmedName,
      })

      if (rpcError) {
        throw rpcError
      }

      if (!data || typeof data !== 'object') {
        throw new Error('Could not create the lobby.')
      }

      const payload = data as Record<string, unknown>
      const code = String(payload['code'] ?? '').trim()
      const playerId = String(payload['player_id'] ?? '')

      setDisplayName(trimmedName)
      setLocalPlayerId(playerId)
      clearRound()
      await hydrateByCode(code)
      router.push(`/(lobby)/${code}`)
    } catch (createError) {
      setError(getErrorMessage(createError))
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Host Online</Text>
      <Text style={styles.subtitle}>Create a lobby and share the code with the room.</Text>

      {!isSupabaseConfigured && (
        <Text style={styles.error}>
          Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable online play.
        </Text>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Display name"
        placeholderTextColor="#475569"
        value={name}
        onChangeText={setName}
        maxLength={32}
      />

      <Pressable
        style={[
          styles.button,
          (!isSupabaseConfigured || isCreating) && styles.buttonDisabled,
        ]}
        onPress={() => {
          void handleCreate()
        }}
        disabled={!isSupabaseConfigured || isCreating}
      >
        <Text style={styles.buttonText}>{isCreating ? 'Creating…' : 'Create Lobby'}</Text>
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
    maxWidth: 320,
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
