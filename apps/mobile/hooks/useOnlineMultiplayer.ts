import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'expo-router'
import type { RealtimeChannel } from '@supabase/supabase-js'
import {
  ONLINE_IMPOSTOR_COUNT,
  ONLINE_SCHEMA_VERSION,
  ONLINE_START_COUNTDOWN_SECONDS,
  getErrorMessage,
  getOnlineSchemaMismatchMessage,
  getMobileOnlineCategoryOptions,
  isOnlineSchemaCompatible,
  normalizeBootstrapPayload,
  normalizeJoinLobbyResult,
  normalizeRolePayload,
  normalizeRoundResult,
  normalizeRoundSnapshotPayload,
  pickMobileOnlineRoundWordForCategories,
  type MobileBootstrapPayload,
  type MobileLobbySnapshot,
  type MobileRolePayload,
  type MobileRoundResult,
  type MobileRoundSnapshot,
} from '../lib/online'
import {
  ensureAnonymousSession,
  getSupabaseClient,
  isSupabaseConfigured,
} from '../lib/supabase'
import { useMobileLobbyStore } from '../store/lobbyStore'
import { useMobileOnlineRoundStore } from '../store/onlineRoundStore'

const onlineGameRoutes = new Set([
  '/(game)/round-starting',
  '/(game)/role-reveal',
  '/(game)/discussion',
  '/(game)/voting',
  '/(game)/results',
])

function routeForRound(round: MobileRoundSnapshot | null) {
  if (!round) {
    return null
  }

  if (round.phase === 'role_reveal') {
    const startedAt = Date.parse(round.startedAt)
    if (
      !Number.isNaN(startedAt) &&
      Date.now() - startedAt < ONLINE_START_COUNTDOWN_SECONDS * 1000
    ) {
      return '/(game)/round-starting'
    }
  }

  switch (round.phase) {
    case 'role_reveal':
      return '/(game)/role-reveal'
    case 'discussion':
      return '/(game)/discussion'
    case 'voting':
      return '/(game)/voting'
    case 'results':
      return '/(game)/results'
    default:
      return null
  }
}

function areCategoriesEqual(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false
  }

  return left.every((category, index) => category === right[index])
}

export function useOnlineMultiplayer(resolvedCode?: string) {
  const router = useRouter()
  const pathname = usePathname()
  const {
    lobbyId,
    code,
    players,
    localPlayerId,
    hostPlayerId,
    status,
    selectedCategories,
    displayName,
    messages,
    pendingJoinRequests,
    accessState,
    pendingJoinRequestId,
    lastSeenMessageId,
    hydrateLobby,
    clearLobby,
    setSelectedCategories,
    setLocalPlayerId,
    setDisplayName,
    setAccessState,
    setPendingAccessState,
    setLastSeenMessageId,
  } = useMobileLobbyStore()
  const round = useMobileOnlineRoundStore((state) => state.round)
  const role = useMobileOnlineRoundStore((state) => state.role)
  const result = useMobileOnlineRoundStore((state) => state.result)
  const submittedVoteTargetId = useMobileOnlineRoundStore(
    (state) => state.submittedVoteTargetId,
  )
  const hasAcknowledgedReadyToDiscuss = useMobileOnlineRoundStore(
    (state) => state.hasAcknowledgedReadyToDiscuss,
  )
  const setRound = useMobileOnlineRoundStore((state) => state.setRound)
  const setRole = useMobileOnlineRoundStore((state) => state.setRole)
  const setResult = useMobileOnlineRoundStore((state) => state.setResult)
  const clearRound = useMobileOnlineRoundStore((state) => state.clearRound)
  const setSubmittedVoteTargetId = useMobileOnlineRoundStore(
    (state) => state.setSubmittedVoteTargetId,
  )
  const setHasAcknowledgedReadyToDiscuss = useMobileOnlineRoundStore(
    (state) => state.setHasAcknowledgedReadyToDiscuss,
  )
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const pendingSelectedCategoriesRef = useRef<string[] | null>(null)

  const effectiveCode = useMemo(
    () => (resolvedCode ?? code ?? '').trim().toUpperCase(),
    [code, resolvedCode],
  )
  const isHost = Boolean(localPlayerId && hostPlayerId && localPlayerId === hostPlayerId)
  const localPlayer = useMemo(
    () => players.find((player) => player.id === localPlayerId) ?? null,
    [localPlayerId, players],
  )
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
  const canModeratePlayers = useMemo(
    () => isHost && status === 'waiting',
    [isHost, status],
  )
  const latestMessageId = useMemo(
    () => messages[messages.length - 1]?.id ?? null,
    [messages],
  )
  const chatUnreadCount = useMemo(() => {
    if (!latestMessageId) {
      return 0
    }

    if (!lastSeenMessageId) {
      return messages.length
    }

    const lastSeenIndex = messages.findIndex((message) => message.id === lastSeenMessageId)
    if (lastSeenIndex < 0) {
      return messages.length
    }

    return Math.max(messages.length - lastSeenIndex - 1, 0)
  }, [lastSeenMessageId, latestMessageId, messages])
  const onlineCategoryOptions = useMemo(() => getMobileOnlineCategoryOptions(), [])

  const assertSchemaCompatible = useCallback((payload: MobileBootstrapPayload) => {
    if (!isOnlineSchemaCompatible(payload.schemaVersion)) {
      throw new Error(getOnlineSchemaMismatchMessage(payload.schemaVersion))
    }

    if (!payload.capabilities.mobileFullGameplay) {
      throw new Error('Online mobile gameplay is not enabled on this backend yet.')
    }
  }, [])

  const navigateFromSnapshot = useCallback((snapshot: MobileLobbySnapshot | null) => {
    if (!snapshot) {
      return
    }

    const nextRoute = snapshot.currentRound
      ? routeForRound(snapshot.currentRound)
      : snapshot.code
        ? `/(lobby)/${snapshot.code}`
        : null

    if (!nextRoute || pathname === nextRoute) {
      return
    }

    if (!snapshot.currentRound && onlineGameRoutes.has(pathname)) {
      router.replace(nextRoute)
      return
    }

    if (snapshot.currentRound && pathname !== nextRoute) {
      router.replace(nextRoute)
      return
    }

    if (pathname !== nextRoute && nextRoute.startsWith('/(lobby)/')) {
      router.replace(nextRoute)
    }
  }, [pathname, router])

  const applySnapshot = useCallback((snapshot: MobileLobbySnapshot) => {
    const existingRoundId = useMobileOnlineRoundStore.getState().round?.id ?? null
    const nextRoundId = snapshot.currentRound?.id ?? null
    const pendingSelectedCategories = pendingSelectedCategoriesRef.current

    if (pendingSelectedCategories) {
      if (areCategoriesEqual(snapshot.selectedCategories, pendingSelectedCategories)) {
        pendingSelectedCategoriesRef.current = null
      } else {
        snapshot = {
          ...snapshot,
          selectedCategories: pendingSelectedCategories,
        }
      }
    }

    if (existingRoundId !== nextRoundId) {
      setRole(null)
      setResult(null)
      setSubmittedVoteTargetId(null)
      setHasAcknowledgedReadyToDiscuss(false)
    }

    hydrateLobby(snapshot)
    setAccessState('member')
    setRound(snapshot.currentRound)

    if (!snapshot.currentRound) {
      if (!useMobileOnlineRoundStore.getState().result) {
        setRole(null)
        setSubmittedVoteTargetId(null)
        setHasAcknowledgedReadyToDiscuss(false)
      }
    } else if (snapshot.currentRound.phase !== 'results') {
      setResult(null)
    }

    navigateFromSnapshot(snapshot)
  }, [
    hydrateLobby,
    navigateFromSnapshot,
    setAccessState,
    setHasAcknowledgedReadyToDiscuss,
    setResult,
    setRole,
    setRound,
    setSubmittedVoteTargetId,
  ])

  const refreshLobby = useCallback(async (codeOverride?: string) => {
    const bootstrapCode = (codeOverride ?? effectiveCode).trim() || null
    const client = await ensureAnonymousSession()
    const { data, error: rpcError } = await client.rpc('get_online_bootstrap', {
      p_code: bootstrapCode,
    })

    if (rpcError) {
      throw rpcError
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Online multiplayer is unavailable.')
    }

    const bootstrap = normalizeBootstrapPayload(data as Record<string, unknown>)
    assertSchemaCompatible(bootstrap)

    if (!bootstrap.lobby) {
      if (
        bootstrap.accessState === 'blocked' ||
        bootstrap.accessState === 'pending_approval'
      ) {
        setPendingAccessState(
          bootstrapCode ?? '',
          bootstrap.accessState,
          bootstrap.requestId,
        )
        clearRound()
        setRound(null)
        setRole(null)
        setResult(null)
        setSubmittedVoteTargetId(null)
        setHasAcknowledgedReadyToDiscuss(false)
        router.replace('/(lobby)/pending')
        return null
      }

      throw new Error('Lobby not found.')
    }

    applySnapshot(bootstrap.lobby)
    return bootstrap.lobby
  }, [
    applySnapshot,
    assertSchemaCompatible,
    clearRound,
    effectiveCode,
    router,
    setHasAcknowledgedReadyToDiscuss,
    setPendingAccessState,
    setResult,
    setRole,
    setRound,
    setSubmittedVoteTargetId,
  ])

  const refreshLobbyRef = useRef(refreshLobby)
  useEffect(() => {
    refreshLobbyRef.current = refreshLobby
  }, [refreshLobby])

  useEffect(() => {
    if (!isSupabaseConfigured || (!effectiveCode && !lobbyId)) {
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

        const snapshot = await refreshLobbyRef.current()
        const activeLobbyId = snapshot?.lobbyId ?? useMobileLobbyStore.getState().lobbyId
        if (!activeLobbyId) {
          return
        }

        channel = client
          .channel(`mobile-online:${activeLobbyId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'players',
              filter: `lobby_id=eq.${activeLobbyId}`,
            },
            () => {
              void refreshLobbyRef.current().catch(() => undefined)
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
              void refreshLobbyRef.current().catch(() => undefined)
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
              void refreshLobbyRef.current().catch(() => undefined)
            },
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'room_messages',
              filter: `lobby_id=eq.${activeLobbyId}`,
            },
            () => {
              void refreshLobbyRef.current().catch(() => undefined)
            },
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'room_message_reactions',
            },
            () => {
              void refreshLobbyRef.current().catch(() => undefined)
            },
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'lobby_join_requests',
              filter: `lobby_id=eq.${activeLobbyId}`,
            },
            () => {
              void refreshLobbyRef.current().catch(() => undefined)
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
      void refreshLobbyRef.current().catch(() => undefined)
    }, 1500)

    return () => {
      isActive = false
      clearInterval(pollInterval)
      if (channel && client) {
        void client.removeChannel(channel)
      }
    }
  }, [effectiveCode, lobbyId])

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
        // Background heartbeat should not block multiplayer play.
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

  useEffect(() => {
    setHasAcknowledgedReadyToDiscuss(false)
  }, [round?.id, setHasAcknowledgedReadyToDiscuss])

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

      await refreshLobby()
    } catch (readyError) {
      setError(getErrorMessage(readyError))
    }
  }, [lobbyId, refreshLobby])

  const requestRejoinApproval = useCallback(async () => {
    const trimmedCode = (effectiveCode ?? '').trim().toUpperCase()
    const trimmedName = (displayName ?? '').trim()

    if (!trimmedCode || !trimmedName) {
      setError('Enter a display name and room code to request rejoin.')
      return null
    }

    try {
      setError(null)
      setIsBusy(true)
      const client = await ensureAnonymousSession()
      const { data: lookupData, error: lookupError } = await client.rpc('get_lobby_by_code', {
        p_code: trimmedCode,
      })

      if (lookupError) {
        throw lookupError
      }

      const lobbyId = String((lookupData as Record<string, unknown> | null)?.['id'] ?? '')
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
        throw new Error('Could not reach the lobby.')
      }

      const joinResult = normalizeJoinLobbyResult(data as Record<string, unknown>)
      if (joinResult.status === 'pending_approval') {
        setPendingAccessState(trimmedCode, 'pending_approval', joinResult.requestId)
        router.replace('/(lobby)/pending')
        return joinResult
      }

      setDisplayName(trimmedName)
      setLocalPlayerId(joinResult.playerId)
      clearRound()
      await refreshLobby(trimmedCode)
      router.replace(`/(lobby)/${trimmedCode}`)
      return joinResult
    } catch (joinError) {
      setError(getErrorMessage(joinError))
      return null
    } finally {
      setIsBusy(false)
    }
  }, [
    clearRound,
    displayName,
    effectiveCode,
    refreshLobby,
    router,
    setDisplayName,
    setLocalPlayerId,
    setPendingAccessState,
  ])

  const refreshPendingJoinRequest = useCallback(async () => {
    if (!pendingJoinRequestId) {
      return null
    }

    try {
      const client = await ensureAnonymousSession()
      const { data, error: rpcError } = await client.rpc('get_join_request_status', {
        p_request_id: pendingJoinRequestId,
      })

      if (rpcError) {
        throw rpcError
      }

      const status = String((data as Record<string, unknown> | null)?.['status'] ?? 'pending')
      if (status === 'approved') {
        return await requestRejoinApproval()
      }

      if (status === 'denied') {
        setPendingAccessState(effectiveCode, 'blocked', null)
      }

      return status
    } catch (statusError) {
      setError(getErrorMessage(statusError))
      return null
    }
  }, [effectiveCode, pendingJoinRequestId, requestRejoinApproval, setPendingAccessState])

  const sendMessage = useCallback(async (body: string) => {
    if (!lobbyId) {
      return
    }

    try {
      setError(null)
      const client = await ensureAnonymousSession()
      const { error: rpcError } = await client.rpc('send_room_message', {
        p_lobby_id: lobbyId,
        p_body: body,
      })

      if (rpcError) {
        throw rpcError
      }

      await refreshLobby()
    } catch (messageError) {
      setError(getErrorMessage(messageError))
    }
  }, [lobbyId, refreshLobby])

  const toggleMessageReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      setError(null)
      const client = await ensureAnonymousSession()
      const { error: rpcError } = await client.rpc('toggle_room_message_reaction', {
        p_message_id: messageId,
        p_emoji: emoji,
      })

      if (rpcError) {
        throw rpcError
      }

      await refreshLobby()
    } catch (reactionError) {
      setError(getErrorMessage(reactionError))
    }
  }, [refreshLobby])

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      setError(null)
      const client = await ensureAnonymousSession()
      const { error: rpcError } = await client.rpc('delete_room_message', {
        p_message_id: messageId,
      })

      if (rpcError) {
        throw rpcError
      }

      await refreshLobby()
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    }
  }, [refreshLobby])

  const kickPlayer = useCallback(async (targetPlayerId: string) => {
    if (!lobbyId) {
      return
    }

    try {
      setError(null)
      const client = await ensureAnonymousSession()
      const { error: rpcError } = await client.rpc('kick_player', {
        p_lobby_id: lobbyId,
        p_player_id: targetPlayerId,
      })

      if (rpcError) {
        throw rpcError
      }

      await refreshLobby()
    } catch (kickError) {
      setError(getErrorMessage(kickError))
    }
  }, [lobbyId, refreshLobby])

  const reviewJoinRequest = useCallback(async (requestId: string, decision: 'approve' | 'deny') => {
    try {
      setError(null)
      const client = await ensureAnonymousSession()
      const { error: rpcError } = await client.rpc('review_join_request', {
        p_request_id: requestId,
        p_decision: decision,
      })

      if (rpcError) {
        throw rpcError
      }

      await refreshLobby()
    } catch (reviewError) {
      setError(getErrorMessage(reviewError))
    }
  }, [refreshLobby])

  const markChatRead = useCallback(() => {
    if (latestMessageId) {
      setLastSeenMessageId(latestMessageId)
    }
  }, [latestMessageId, setLastSeenMessageId])

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
      const { error: rpcError } = await client.rpc('set_lobby_categories', {
        p_lobby_id: lobbyId,
        p_categories: nextCategories,
      })

      if (rpcError) {
        throw rpcError
      }

      await refreshLobby()
    } catch (categoryError) {
      pendingSelectedCategoriesRef.current = null
      setSelectedCategories(previousCategories)
      setError(getErrorMessage(categoryError))
    }
  }, [lobbyId, refreshLobby, selectedCategories, setSelectedCategories])

  const runRoundStart = useCallback(async (rpcName: 'start_round' | 'start_next_round') => {
    if (!lobbyId) {
      setError('Lobby not found.')
      return null
    }

    setIsBusy(true)
    setError(null)

    try {
      const client = await ensureAnonymousSession()
      const pendingCategories = pendingSelectedCategoriesRef.current

      if (pendingCategories?.length) {
        const { data: categoryData, error: categoryError } = await client.rpc(
          'set_lobby_categories',
          {
            p_lobby_id: lobbyId,
            p_categories: pendingCategories,
          },
        )

        if (categoryError) {
          throw categoryError
        }

        if (
          categoryData &&
          typeof categoryData === 'object' &&
          Array.isArray((categoryData as { selected_categories?: unknown }).selected_categories)
        ) {
          const confirmedCategories = (
            categoryData as { selected_categories: unknown[] }
          ).selected_categories.map((value) => String(value))

          pendingSelectedCategoriesRef.current = confirmedCategories
          setSelectedCategories(confirmedCategories)
        }
      }

      const latestSnapshot = await refreshLobby()
      const categoriesForRound =
        latestSnapshot?.selectedCategories?.length
          ? latestSnapshot.selectedCategories
          : selectedCategories
      const nextWord = pickMobileOnlineRoundWordForCategories(categoriesForRound)
      const { data, error: rpcError } = await client.rpc(rpcName, {
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
      setRole(null)
      setSubmittedVoteTargetId(null)
      setHasAcknowledgedReadyToDiscuss(false)

      if (data && typeof data === 'object') {
        const roundRaw =
          (data as { round?: unknown }).round &&
          typeof (data as { round?: unknown }).round === 'object'
            ? ((data as { round: Record<string, unknown> }).round)
            : null

        if (roundRaw) {
          setRound(
            normalizeRoundSnapshotPayload(roundRaw, categoriesForRound),
          )
          router.replace('/(game)/round-starting')
        }
      }

      await refreshLobby()
      return true
    } catch (startError) {
      setError(getErrorMessage(startError))
      return null
    } finally {
      setIsBusy(false)
    }
  }, [
    connectedPlayers.length,
    lobbyId,
    refreshLobby,
    router,
    selectedCategories,
    setHasAcknowledgedReadyToDiscuss,
    setResult,
    setRole,
    setRound,
    setSubmittedVoteTargetId,
  ])

  const startGame = useCallback(async () => {
    if (!canStartRound) {
      setError('At least 3 connected players are required and everyone must be ready.')
      return
    }

    await runRoundStart('start_round')
  }, [canStartRound, runRoundStart])

  const startNextRound = useCallback(async () => {
    await runRoundStart('start_next_round')
  }, [runRoundStart])

  const loadRole = useCallback(async (): Promise<MobileRolePayload | null> => {
    try {
      const activeRoundId = useMobileOnlineRoundStore.getState().round?.id
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

  const markReadyToDiscuss = useCallback(async () => {
    const activeRoundId = useMobileOnlineRoundStore.getState().round?.id
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

  const setRoundPhase = useCallback(async (phase: 'discussion' | 'voting') => {
    const activeRoundId = useMobileOnlineRoundStore.getState().round?.id
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
    } catch (phaseError) {
      setError(getErrorMessage(phaseError))
    } finally {
      setIsBusy(false)
    }
  }, [refreshLobby])

  const submitVote = useCallback(async (targetId: string) => {
    const activeRoundId = useMobileOnlineRoundStore.getState().round?.id
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

  const finishRound = useCallback(async (): Promise<MobileRoundResult | null> => {
    const activeRoundId = useMobileOnlineRoundStore.getState().round?.id
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
      return normalized
    } catch (finishError) {
      setError(getErrorMessage(finishError))
      return null
    } finally {
      setIsBusy(false)
    }
  }, [refreshLobby, setResult])

  const loadRoundResult = useCallback(async (roundId?: string) => {
    try {
      const activeRoundId = roundId ?? useMobileOnlineRoundStore.getState().round?.id
      if (!activeRoundId) {
        return null
      }

      const client = await ensureAnonymousSession()
      const { data, error: rpcError } = await client.rpc('get_round_result', {
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
      return normalized
    } catch (resultError) {
      setError(getErrorMessage(resultError))
      return null
    }
  }, [setResult])

  const repairPresence = useCallback(async () => {
    if (!lobbyId) {
      return
    }

    try {
      setError(null)
      setIsBusy(true)
      const client = await ensureAnonymousSession()
      const { error: rpcError } = await client.rpc('repair_lobby_presence', {
        p_lobby_id: lobbyId,
      })

      if (rpcError) {
        throw rpcError
      }

      await refreshLobby()
    } catch (repairError) {
      setError(getErrorMessage(repairError))
    } finally {
      setIsBusy(false)
    }
  }, [lobbyId, refreshLobby])

  const leaveLobby = useCallback(async () => {
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
      clearRound()
      router.replace('/')
    }
  }, [clearLobby, clearRound, router])

  const returnToLobby = useCallback(async () => {
    setRole(null)
    setSubmittedVoteTargetId(null)
    setHasAcknowledgedReadyToDiscuss(false)
    await refreshLobby()
    if (useMobileLobbyStore.getState().code) {
      router.replace(`/(lobby)/${useMobileLobbyStore.getState().code}`)
    }
  }, [refreshLobby, router, setHasAcknowledgedReadyToDiscuss, setRole, setSubmittedVoteTargetId])

  return {
    code: effectiveCode,
    displayName,
    players,
    messages,
    pendingJoinRequests,
    localPlayerId,
    hostPlayerId,
    status,
    round,
    role,
    result,
    localPlayer,
    isHost,
    isBusy,
    error,
    accessState,
    pendingJoinRequestId,
    connectedPlayers,
    allConnectedPlayersReady,
    canStartRound,
    canModeratePlayers,
    selectedCategories,
    onlineCategoryOptions,
    submittedVoteTargetId,
    hasAcknowledgedReadyToDiscuss,
    chatUnreadCount,
    setError,
    markChatRead,
    refreshLobby,
    setReady,
    setSelectedCategories: updateSelectedCategories,
    requestRejoinApproval,
    refreshPendingJoinRequest,
    startGame,
    startNextRound,
    loadRole,
    markReadyToDiscuss,
    startDiscussion: () => setRoundPhase('discussion'),
    startVoting: () => setRoundPhase('voting'),
    submitVote,
    finishRound,
    loadRoundResult,
    sendMessage,
    toggleMessageReaction,
    deleteMessage,
    kickPlayer,
    reviewJoinRequest,
    repairPresence,
    leaveLobby,
    returnToLobby,
    schemaVersion: useMobileLobbyStore.getState().schemaVersion || ONLINE_SCHEMA_VERSION,
  }
}
