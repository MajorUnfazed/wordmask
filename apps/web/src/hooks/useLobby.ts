import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import {
  ONLINE_DEFAULT_CATEGORY,
  ONLINE_IMPOSTOR_COUNT,
  getOnlineCategoryOptions,
  normalizeLobbySnapshot,
  normalizeRolePayload,
  normalizeRoundResult,
  pickOnlineRoundWordForCategories,
  type OnlineLobbySnapshot,
  type OnlineRolePayload,
  type OnlineRoundResult,
  type OnlineRoundSnapshot,
} from '../lib/online'
import {
  ensureAnonymousSession,
  getSupabaseClient,
  getSupabaseRestConfig,
  isSupabaseConfigured,
} from '../lib/supabase'
import { useLobbyStore } from '../store/lobbyStore'
import { useOnlineRoundStore } from '../store/onlineRoundStore'
import { useUIStore, type AppScreen } from '../store/uiStore'

const onlineGameScreens = new Set<AppScreen>([
  'online-role-reveal',
  'online-discussion',
  'online-voting',
  'online-results',
])

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Something went wrong.'
}

function screenForRound(round: OnlineRoundSnapshot | null): AppScreen | null {
  if (!round) {
    return null
  }

  switch (round.phase) {
    case 'role_reveal':
      return 'online-role-reveal'
    case 'discussion':
      return 'online-discussion'
    case 'voting':
      return 'online-voting'
    case 'results':
      return 'online-results'
    default:
      return 'online-lobby'
  }
}

export function useLobby() {
  const {
    lobbyId,
    code,
    players,
    localPlayerId,
    hostPlayerId,
    status,
    currentRoundId,
    selectedCategories,
    hydrateLobby,
    clearLobby,
    setSelectedCategories,
  } = useLobbyStore()
  const setScreen = useUIStore((state) => state.setScreen)
  const setRound = useOnlineRoundStore((state) => state.setRound)
  const setRole = useOnlineRoundStore((state) => state.setRole)
  const setSubmittedVoteTargetId = useOnlineRoundStore(
    (state) => state.setSubmittedVoteTargetId,
  )
  const setResult = useOnlineRoundStore((state) => state.setResult)
  const clearRound = useOnlineRoundStore((state) => state.clearRound)
  const round = useOnlineRoundStore((state) => state.round)
  const result = useOnlineRoundStore((state) => state.result)
  const submittedVoteTargetId = useOnlineRoundStore(
    (state) => state.submittedVoteTargetId,
  )
  const role = useOnlineRoundStore((state) => state.role)
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const leaveLobbyRemotely = useCallback(async () => {
    if (!lobbyId) {
      return
    }

    const client = await ensureAnonymousSession()
    await client.rpc('leave_lobby', { p_lobby_id: lobbyId })
  }, [lobbyId])

  const isHost = useMemo(() => {
    if (!localPlayerId || !hostPlayerId) {
      return false
    }

    return localPlayerId === hostPlayerId
  }, [hostPlayerId, localPlayerId])

  const onlineCategoryOptions = useMemo(() => getOnlineCategoryOptions(), [])

  const loadRoundResult = useCallback(async (roundId?: string) => {
    try {
      const targetRoundId = roundId ?? useOnlineRoundStore.getState().round?.id

      if (!targetRoundId) {
        return null
      }

      const client = await ensureAnonymousSession()
      const { data, error: rpcError } = await client.rpc('get_round_result', {
        p_round_id: targetRoundId,
      })

      if (rpcError) {
        throw rpcError
      }

      if (!data || typeof data !== 'object') {
        throw new Error('Results are not available yet.')
      }

      const normalized = normalizeRoundResult(data as Record<string, unknown>)
      setResult(normalized)

      return normalized
    } catch (resultError) {
      setError(getErrorMessage(resultError))
      return null
    }
  }, [setResult])

  const refreshLobby = useCallback(async (): Promise<OnlineLobbySnapshot | null> => {
    if (!code) {
      return null
    }

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
    setRound(snapshot.currentRound)

    if (!snapshot.currentRound) {
      if (!useOnlineRoundStore.getState().result) {
        setRole(null)
        setSubmittedVoteTargetId(null)

        const currentScreen = useUIStore.getState().screen
        if (onlineGameScreens.has(currentScreen)) {
          setScreen('online-lobby')
        }
      }

      return snapshot
    }

    if (snapshot.currentRound.phase === 'results') {
      if (useUIStore.getState().screen !== 'online-lobby') {
        await loadRoundResult(snapshot.currentRound.id)
        setScreen('online-results')
      }

      return snapshot
    }

    setResult(null)
    setSubmittedVoteTargetId(null)

    const nextScreen = screenForRound(snapshot.currentRound)
    if (nextScreen && useUIStore.getState().screen !== nextScreen) {
      setScreen(nextScreen)
    }

    return snapshot
  }, [
    code,
    hydrateLobby,
    loadRoundResult,
    setResult,
    setRole,
    setRound,
    setScreen,
    setSubmittedVoteTargetId,
  ])

  // Keep a ref to the latest refreshLobby so the subscription effect below can
  // call it without listing it as a dependency. If refreshLobby were a
  // dependency, every lobby-state change would recreate the callback, tear
  // down the Supabase channel, and re-subscribe – creating a window where
  // real-time inserts/updates are silently dropped.
  const refreshLobbyRef = useRef(refreshLobby)
  useEffect(() => {
    refreshLobbyRef.current = refreshLobby
  })

  const requestLobbyRefreshRef = useRef<() => Promise<void>>(async () => {})
  useEffect(() => {
    requestLobbyRefreshRef.current = async () => {
      try {
        await refreshLobbyRef.current()
        setError(null)
      } catch (refreshError) {
        setError(getErrorMessage(refreshError))
      }
    }
  }, [setError])

  useEffect(() => {
    if (!isSupabaseConfigured || !code || !lobbyId) {
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

        await refreshLobbyRef.current()

        channel = client
          .channel(`online-lobby:${lobbyId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'players',
              filter: `lobby_id=eq.${lobbyId}`,
            },
            () => {
              void requestLobbyRefreshRef.current()
            },
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'lobbies',
              filter: `id=eq.${lobbyId}`,
            },
            () => {
              void requestLobbyRefreshRef.current()
            },
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'rounds',
              filter: `lobby_id=eq.${lobbyId}`,
            },
            () => {
              void requestLobbyRefreshRef.current()
            },
          )
          .subscribe()
      } catch (syncError) {
        if (isActive) {
          setError(getErrorMessage(syncError))
        }
      }
    })()

    const handleVisibilityRefresh = () => {
      if (document.visibilityState === 'visible') {
        void requestLobbyRefreshRef.current()
      }
    }

    window.addEventListener('focus', handleVisibilityRefresh)
    document.addEventListener('visibilitychange', handleVisibilityRefresh)

    // Polling fallback: postgres_changes with row-level filters is not reliable
    // enough on this project, so poll aggressively while the lobby is open.
    const pollInterval = setInterval(() => {
      void requestLobbyRefreshRef.current()
    }, 1000)

    return () => {
      isActive = false
      clearInterval(pollInterval)
      window.removeEventListener('focus', handleVisibilityRefresh)
      document.removeEventListener('visibilitychange', handleVisibilityRefresh)
      if (channel && client) {
        void client.removeChannel(channel)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, lobbyId])

  useEffect(() => {
    if (!lobbyId || status !== 'waiting') {
      return
    }

    const handlePageHide = () => {
      const currentScreen = useUIStore.getState().screen
      if (currentScreen !== 'online-lobby') {
        return
      }

      const restConfig = getSupabaseRestConfig()
      const client = getSupabaseClient()
      if (!restConfig || !client) {
        return
      }

      const sessionPromise = client.auth.getSession()
      void sessionPromise.then(({ data }) => {
        const accessToken = data.session?.access_token
        if (!accessToken) {
          return
        }

        void fetch(`${restConfig.url}/rest/v1/rpc/leave_lobby`, {
          method: 'POST',
          keepalive: true,
          headers: {
            'Content-Type': 'application/json',
            apikey: restConfig.anonKey,
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ p_lobby_id: lobbyId }),
        })
      })
    }

    window.addEventListener('pagehide', handlePageHide)

    return () => {
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [lobbyId, status])

  const startGame = useCallback(async () => {
    if (!lobbyId) {
      setError('Lobby not found.')
      return
    }

    setIsBusy(true)
    setError(null)

    try {
      const client = await ensureAnonymousSession()
      const nextWord = pickOnlineRoundWordForCategories(selectedCategories)
      const { error: rpcError } = await client.rpc('start_round', {
        p_lobby_id: lobbyId,
        p_word: nextWord.word,
        p_hint: nextWord.hint,
        p_pack_id: nextWord.packId,
        p_impostor_count: ONLINE_IMPOSTOR_COUNT,
      })

      if (rpcError) {
        throw rpcError
      }

      setResult(null)
      await refreshLobby()
      setScreen('online-role-reveal')
    } catch (startError) {
      setError(getErrorMessage(startError))
    } finally {
      setIsBusy(false)
    }
  }, [lobbyId, refreshLobby, selectedCategories, setResult, setScreen])

  const loadRole = useCallback(async (): Promise<OnlineRolePayload | null> => {
    try {
      const activeRoundId = useOnlineRoundStore.getState().round?.id

      if (!activeRoundId) {
        return null
      }

      const client = await ensureAnonymousSession()
      const { data, error: rpcError } = await client.rpc('get_my_role', {
        p_round_id: activeRoundId,
      })

      if (rpcError) {
        throw rpcError
      }

      if (!data || typeof data !== 'object') {
        throw new Error('Role is unavailable.')
      }

      const normalized = normalizeRolePayload(data as Record<string, unknown>)
      setRole(normalized)

      return normalized
    } catch (roleError) {
      setError(getErrorMessage(roleError))
      return null
    }
  }, [setRole])

  const setRoundPhase = useCallback(async (phase: 'discussion' | 'voting') => {
    const activeRoundId = useOnlineRoundStore.getState().round?.id

    if (!activeRoundId) {
      setError('Round not found.')
      return
    }

    setIsBusy(true)
    setError(null)

    try {
      const client = await ensureAnonymousSession()
      const { error: rpcError } = await client.rpc('set_round_phase', {
        p_round_id: activeRoundId,
        p_phase: phase,
      })

      if (rpcError) {
        throw rpcError
      }

      await refreshLobby()
      setScreen(phase === 'discussion' ? 'online-discussion' : 'online-voting')
    } catch (phaseError) {
      setError(getErrorMessage(phaseError))
    } finally {
      setIsBusy(false)
    }
  }, [refreshLobby, setScreen])

  const submitVote = useCallback(async (targetId: string) => {
    const activeRoundId = useOnlineRoundStore.getState().round?.id

    if (!activeRoundId) {
      setError('Round not found.')
      return
    }

    try {
      setError(null)
      const client = await ensureAnonymousSession()
      const { error: rpcError } = await client.rpc('submit_vote', {
        p_round_id: activeRoundId,
        p_target_id: targetId,
      })

      if (rpcError) {
        throw rpcError
      }

      setSubmittedVoteTargetId(targetId)
    } catch (voteError) {
      setError(getErrorMessage(voteError))
    }
  }, [setSubmittedVoteTargetId])

  const finishRound = useCallback(async (): Promise<OnlineRoundResult | null> => {
    const activeRoundId = useOnlineRoundStore.getState().round?.id

    if (!activeRoundId) {
      setError('Round not found.')
      return null
    }

    setIsBusy(true)
    setError(null)

    try {
      const client = await ensureAnonymousSession()
      const { data, error: rpcError } = await client.rpc('finish_round', {
        p_round_id: activeRoundId,
      })

      if (rpcError) {
        throw rpcError
      }

      if (!data || typeof data !== 'object') {
        throw new Error('Results are unavailable.')
      }

      const normalized = normalizeRoundResult(data as Record<string, unknown>)
      setResult(normalized)
      await refreshLobby()
      setScreen('online-results')

      return normalized
    } catch (finishError) {
      setError(getErrorMessage(finishError))
      return null
    } finally {
      setIsBusy(false)
    }
  }, [refreshLobby, setResult, setScreen])

  const returnToLobby = useCallback(() => {
    setRole(null)
    setSubmittedVoteTargetId(null)
    setScreen('online-lobby')
  }, [setRole, setScreen, setSubmittedVoteTargetId])

  const disconnectLobby = useCallback(() => {
    void (async () => {
      try {
        await leaveLobbyRemotely()
      } catch {
        // Best effort cleanup. The user can still leave locally if the RPC fails.
      } finally {
        clearLobby()
        clearRound()
        useUIStore.getState().setSavedScreen(null)
        setScreen('home')
      }
    })()
  }, [clearLobby, clearRound, leaveLobbyRemotely, setScreen])

  return {
    code,
    players,
    localPlayerId,
    hostPlayerId,
    status,
    currentRoundId,
    selectedCategories,
    round,
    role,
    result,
    submittedVoteTargetId,
    isHost,
    isBusy,
    error,
    setError,
    onlineCategoryOptions,
    setSelectedCategories,
    refreshLobby,
    startGame,
    loadRole,
    loadRoundResult,
    startDiscussion: () => setRoundPhase('discussion'),
    startVoting: () => setRoundPhase('voting'),
    submitVote,
    finishRound,
    returnToLobby,
    disconnectLobby,
  }
}
