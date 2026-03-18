import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../components/ui/GlassCard'
import { GlowButton } from '../components/ui/GlowButton'
import { normalizeLobbySnapshot } from '../lib/online'
import {
  ensureAnonymousSession,
  isSupabaseConfigured,
} from '../lib/supabase'
import { useLobbyStore } from '../store/lobbyStore'
import { useOnlineRoundStore } from '../store/onlineRoundStore'
import { useUIStore } from '../store/uiStore'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Something went wrong.'
}

export default function OnlineCreateScreen() {
  const setScreen = useUIStore((state) => state.setScreen)
  const hydrateLobby = useLobbyStore((state) => state.hydrateLobby)
  const setLocalPlayerId = useLobbyStore((state) => state.setLocalPlayerId)
  const setDisplayName = useLobbyStore((state) => state.setDisplayName)
  const clearRound = useOnlineRoundStore((state) => state.clearRound)
  const [createName, setCreateName] = useState('')
  const [joinName, setJoinName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  async function hydrateByCode(code: string) {
    const client = await ensureAnonymousSession()
    const { data, error: rpcError } = await client.rpc('get_lobby_state', {
      p_code: code,
    })

    if (rpcError) {
      throw rpcError
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Lobby not found.')
    }

    const snapshot = normalizeLobbySnapshot(data as Record<string, unknown>)
    hydrateLobby(snapshot)
    return snapshot
  }

  async function handleCreate() {
    const trimmedName = createName.trim()
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
      setScreen('online-lobby')
    } catch (createError) {
      setError(getErrorMessage(createError))
    } finally {
      setIsCreating(false)
    }
  }

  async function handleJoin() {
    const trimmedName = joinName.trim()
    const trimmedCode = joinCode.trim().toUpperCase()

    if (!trimmedName || trimmedCode.length !== 6) {
      setError('Enter a display name and a 6-character lobby code.')
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

      const payload = data as Record<string, unknown>
      const playerId = String(payload['player_id'] ?? '')

      setDisplayName(trimmedName)
      setLocalPlayerId(playerId)
      clearRound()
      await hydrateByCode(trimmedCode)
      setScreen('online-lobby')
    } catch (joinError) {
      setError(getErrorMessage(joinError))
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <motion.div
        className="max-w-2xl text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm uppercase tracking-[0.25em]" style={{ color: 'var(--color-text-muted)' }}>
          Multiplayer
        </p>
        <h2 className="mt-2 font-display text-4xl font-bold">Play Online</h2>
        <p className="mt-3 text-white/60">
          Host a new lobby or join a friend with a six-character code.
        </p>
      </motion.div>

      {!isSupabaseConfigured && (
        <div
          className="w-full max-w-4xl rounded-3xl border px-5 py-4 text-sm"
          style={{
            borderColor: 'rgba(239,68,68,0.3)',
            background: 'rgba(239,68,68,0.08)',
            color: 'rgb(252,165,165)',
          }}
        >
          Online mode requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in
          `apps/web/.env`.
        </div>
      )}

      {error && (
        <div
          className="w-full max-w-4xl rounded-3xl border px-5 py-4 text-sm"
          style={{
            borderColor: 'rgba(239,68,68,0.3)',
            background: 'rgba(239,68,68,0.08)',
            color: 'rgb(252,165,165)',
          }}
        >
          {error}
        </div>
      )}

      <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
        <GlassCard className="rounded-3xl p-6">
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/40">Create Lobby</p>
              <h3 className="mt-2 font-display text-2xl font-bold">Host a round</h3>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-white/60">Display name</span>
              <input
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
                maxLength={32}
                placeholder="Captain"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-accent"
              />
            </label>

            <GlowButton
              onClick={() => {
                void handleCreate()
              }}
              disabled={!isSupabaseConfigured || isCreating}
            >
              {isCreating ? 'Creating…' : 'Create Lobby'}
            </GlowButton>
          </div>
        </GlassCard>

        <GlassCard className="rounded-3xl p-6">
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/40">Join Lobby</p>
              <h3 className="mt-2 font-display text-2xl font-bold">Enter a code</h3>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-white/60">Lobby code</span>
              <input
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                maxLength={6}
                placeholder="ABC123"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-center text-lg font-semibold tracking-[0.35em] text-white outline-none transition focus:border-accent"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-white/60">Display name</span>
              <input
                value={joinName}
                onChange={(event) => setJoinName(event.target.value)}
                maxLength={32}
                placeholder="Crewmate"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-accent"
              />
            </label>

            <GlowButton
              onClick={() => {
                void handleJoin()
              }}
              disabled={!isSupabaseConfigured || isJoining}
            >
              {isJoining ? 'Joining…' : 'Join Lobby'}
            </GlowButton>
          </div>
        </GlassCard>
      </div>

      <GlowButton variant="secondary" onClick={() => setScreen('mode')}>
        Back
      </GlowButton>
    </div>
  )
}
