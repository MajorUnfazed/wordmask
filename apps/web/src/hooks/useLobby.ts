import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import {
  ONLINE_IMPOSTOR_COUNT,
  ONLINE_START_COUNTDOWN_SECONDS,
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
  isSupabaseConfigured,
} from '../lib/supabase'
import { useLobbyStore } from '../store/lobbyStore'
import { useOnlineRoundStore } from '../store/onlineRoundStore'
import { useUIStore, type AppScreen } from '../store/uiStore'

const onlineGameScreens = new Set<AppScreen>([
  'online-round-starting',
  'online-role-reveal',
  'online-discussion',
  'online-voting',
  'online-results',
])

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message
  }

  return 'Something went wrong.'
}

function screenForRound(round: OnlineRoundSnapshot | null): AppScreen | null {
  if (!round) {
    return null
  }

  if (round.phase === 'role_reveal') {
    const startedAt = Date.parse(round.startedAt)
    if (!Number.isNaN(startedAt) && Date.now() - startedAt < ONLINE_START_COUNTDOWN_SECONDS * 1000) {
      return 'online-round-starting'
    }
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

function areCategoriesEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false
  }

  return left.every((category, index) => category === right[index])
}

function isMissingFunctionError(error: unknown, functionName: string): boolean {
  const message = getErrorMessage(error)
  return message.includes(`Could not find the function public.${functionName}`)
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
    events,
    selectedCategories,
    hydrateLobby,
    clearLobby,
    setSelectedCategories,
    updatePlayer,
  } = useLobbyStore()
  const setScreen = useUIStore((state) => state.setScreen)
  const setRound = useOnlineRoundStore((state) => state.setRound)
  const setRole = useOnlineRoundStore((state) => state.setRole)
  const setSubmittedVoteTargetId = useOnlineRoundStore(
    (state) => state.setSubmittedVoteTargetId,
  )
  const setResult = useOnlineRoundStore((state) => state.setResult)
  const clearRound = useOnlineRoundStore((state) => state.clearRound)
  const setHasAcknowledgedReadyToDiscuss = useOnlineRoundStore(
    (state) => state.setHasAcknowledgedReadyToDiscuss,
  )
  const round = useOnlineRoundStore((state) => state.round)
  const result = useOnlineRoundStore((state) => state.result)
  const hasAcknowledgedReadyToDiscuss = useOnlineRoundStore(
    (state) => state.hasAcknowledgedReadyToDiscuss,
  )
  const submittedVoteTargetId = useOnlineRoundStore(
    (state) => state.submittedVoteTargetId,
  )
  const role = useOnlineRoundStore((state) => state.role)
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const pendingSelectedCategoriesRef = useRef<string[] | null>(null)

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
  const connectedPlayers = useMemo(
    () => players.filter((player) => player.presenceStatus !== 'away'),
    [players],
  )
  const allConnectedPlayersReady = useMemo(
    () => connectedPlayers.length > 0 && connectedPlayers.every((player) => player.isReady),
    [connectedPlayers],
  )
  const canStartRound = useMemo(
    () => isHost && status === 'waiting' && connectedPlayers.length >= 3 && allConnectedPlayersReady,
    [allConnectedPlayersReady, connectedPlayers.length, isHost, status],
  )

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
    const existingRoundId = useOnlineRoundStore.getState().round?.id ?? null
    const nextRoundId = snapshot.currentRound?.id ?? null
    const pendingSelectedCategories = pendingSelectedCategoriesRef.current

    if (pendingSelectedCategories) {
      if (areCategoriesEqual(snapshot.selectedCategories, pendingSelectedCategories)) {
        pendingSelectedCategoriesRef.current = null
      } else {
        snapshot.selectedCategories = pendingSelectedCategories
      }
    }

    if (existingRoundId !== nextRoundId) {
      setRole(null)
      setResult(null)
      setSubmittedVoteTargetId(null)
      setHasAcknowledgedReadyToDiscuss(false)
    }

    hydrateLobby(snapshot)
    setRound(snapshot.currentRound)

    if (!snapshot.currentRound) {
      if (!useOnlineRoundStore.getState().result) {
        setRole(null)
        setSubmittedVoteTargetId(null)
        setHasAcknowledgedReadyToDiscuss(false)

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
    setHasAcknowledgedReadyToDiscuss,
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
        if (useLobbyStore.getState().players.length === 0) {
          setError(getErrorMessage(refreshError))
        } else {
          console.error('Background lobby refresh failed:', refreshError)
        }
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
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'lobby_events',
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
        // Background heartbeat should not hard-fail the UI.
      }
    }

    void heartbeat()
    const heartbeatInterval = window.setInterval(() => {
      void heartbeat()
    }, 5000)

    return () => {
      window.clearInterval(heartbeatInterval)
    }
  }, [lobbyId])

  useEffect(() => {
    setHasAcknowledgedReadyToDiscuss(false)
  }, [round?.id, setHasAcknowledgedReadyToDiscuss])

  const updateSelectedCategories = useCallback(async (categories: string[]) => {
    if (!lobbyId) {
      return
    }

    const normalized = categories.map((category) => category.trim()).filter(Boolean)
    const nextCategories = normalized.length > 0 ? normalized : ['Everyday']
    const previousCategories = selectedCategories
    pendingSelectedCategoriesRef.current = nextCategories
    setSelectedCategories(nextCategories)
    setError(null)

    try {
      const client = await ensureAnonymousSession()
      const { data, error: rpcError } = await client.rpc('set_lobby_categories', {
        p_lobby_id: lobbyId,
        p_categories: nextCategories,
      })

      if (rpcError) {
        throw rpcError
      }

      if (
        data &&
        typeof data === 'object' &&
        Array.isArray((data as { selected_categories?: unknown }).selected_categories)
      ) {
        const confirmedCategories = (
          data as { selected_categories: unknown[] }
        ).selected_categories.map((value) => String(value))

        pendingSelectedCategoriesRef.current = confirmedCategories
        setSelectedCategories(confirmedCategories)
      }

      setError(null)
      void requestLobbyRefreshRef.current()
    } catch (categoryError) {
      pendingSelectedCategoriesRef.current = null
      setSelectedCategories(previousCategories)
      setError(getErrorMessage(categoryError))
    }
  }, [lobbyId, selectedCategories, setSelectedCategories])

  const setReady = useCallback(async (ready: boolean) => {
    if (!lobbyId) {
      return
    }

    try {
      setError(null)
      const client = await ensureAnonymousSession()
      const { error: rpcError } = await client.rpc('set_player_ready', {
        p_lobby_id: lobbyId,
        p_ready: ready,
      })

      if (rpcError) {
        throw rpcError
      }

      if (localPlayerId) {
        updatePlayer(localPlayerId, {
          isReady: ready,
          presenceStatus: 'active',
          lastSeenAt: new Date().toISOString(),
        })
      }

      setError(null)
      void requestLobbyRefreshRef.current()
    } catch (readyError) {
      setError(getErrorMessage(readyError))
    }
  }, [localPlayerId, lobbyId, updatePlayer])

  const runRoundStart = useCallback(async (rpcNames: Array<'start_round' | 'start_next_round'>) => {
    if (!lobbyId) {
      setError('Lobby not found.')
      return null
    }

    setIsBusy(true)
    setError(null)

    try {
      const client = await ensureAnonymousSession()
      const latestSnapshot = await refreshLobby()
      const categoriesForRound =
        latestSnapshot?.selectedCategories?.length
          ? latestSnapshot.selectedCategories
          : selectedCategories
      const nextWord = pickOnlineRoundWordForCategories(categoriesForRound)
      let lastRpcError: unknown = null

      for (const rpcName of rpcNames) {
        const { error: rpcError } = await client.rpc(rpcName, {
          p_lobby_id: lobbyId,
          p_word: nextWord.word,
          p_hint: nextWord.hint,
          p_pack_id: nextWord.packId,
          p_impostor_count: ONLINE_IMPOSTOR_COUNT,
        })

        if (!rpcError) {
          lastRpcError = null
          break
        }

        lastRpcError = rpcError

        if (rpcName !== 'start_next_round' || !isMissingFunctionError(rpcError, 'start_next_round')) {
          throw rpcError
        }
      }

      if (lastRpcError) {
        throw lastRpcError
      }

      setResult(null)
      setRole(null)
      setSubmittedVoteTargetId(null)
      setHasAcknowledgedReadyToDiscuss(false)
      await refreshLobby()
      setScreen('online-round-starting')

      return true
    } catch (startError) {
      setError(getErrorMessage(startError))
      return null
    } finally {
      setIsBusy(false)
    }
  }, [
    lobbyId,
    refreshLobby,
    selectedCategories,
    setResult,
    setRole,
    setScreen,
    setSubmittedVoteTargetId,
    setHasAcknowledgedReadyToDiscuss,
  ])

  const startGame = useCallback(async () => {
    if (!canStartRound) {
      setError('At least 3 connected players are required and everyone must be ready.')
      return
    }

    await runRoundStart(['start_round'])
  }, [canStartRound, runRoundStart])

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
      await refreshLobby()
    } catch (voteError) {
      setError(getErrorMessage(voteError))
    }
  }, [refreshLobby, setSubmittedVoteTargetId])

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
    setResult(null)
    setSubmittedVoteTargetId(null)
    setHasAcknowledgedReadyToDiscuss(false)
    setScreen('online-lobby')
  }, [setHasAcknowledgedReadyToDiscuss, setResult, setRole, setScreen, setSubmittedVoteTargetId])

  const markReadyToDiscuss = useCallback(async () => {
    const activeRoundId = useOnlineRoundStore.getState().round?.id

    if (!activeRoundId) {
      setError('Round not found.')
      return
    }

    try {
      setError(null)
      const client = await ensureAnonymousSession()
      const { error: rpcError } = await client.rpc('mark_ready_to_discuss', {
        p_round_id: activeRoundId,
      })

      if (rpcError) {
        throw rpcError
      }

      setHasAcknowledgedReadyToDiscuss(true)
      await refreshLobby()
    } catch (readyError) {
      setError(getErrorMessage(readyError))
    }
  }, [refreshLobby, setHasAcknowledgedReadyToDiscuss])

  const startNextRound = useCallback(async () => {
    await runRoundStart(['start_next_round', 'start_round'])
  }, [runRoundStart])

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
    events,
    selectedCategories,
    round,
    role,
    result,
    hasAcknowledgedReadyToDiscuss,
    submittedVoteTargetId,
    isHost,
    connectedPlayers,
    allConnectedPlayersReady,
    canStartRound,
    isBusy,
    error,
    setError,
    onlineCategoryOptions,
    setSelectedCategories: updateSelectedCategories,
    setReady,
    refreshLobby,
    startGame,
    startNextRound,
    loadRole,
    loadRoundResult,
    markReadyToDiscuss,
    startDiscussion: () => setRoundPhase('discussion'),
    startVoting: () => setRoundPhase('voting'),
    submitVote,
    finishRound,
    returnToLobby,
    disconnectLobby,
  }
}
