import { ALL_WORDS, pickRandom } from '@impostor/core'

export const ONLINE_SCHEMA_VERSION = 9
export const ONLINE_DISCUSSION_DURATION = 60
export const ONLINE_IMPOSTOR_COUNT = 1
export const ONLINE_DEFAULT_CATEGORY = 'Everyday'
export const ONLINE_START_COUNTDOWN_SECONDS = 3
export type MobileOnlineAccessState = 'member' | 'blocked' | 'pending_approval' | 'none'
export type MobileRoomMessageKind = 'text' | 'system' | 'tombstone'

const mobileCategoryEmoji: Record<string, string> = {
  Animals: '🐘',
  'Campus Life': '🎓',
  Everyday: '🏠',
  'Formula 1': '🏎️',
  Fashion: '👗',
  Food: '🍕',
  Gaming: '🎮',
  Geography: '🌍',
}

export interface MobileLobbyPlayer {
  id: string
  name: string
  isHost: boolean
  isReady: boolean
  presenceStatus: 'active' | 'reconnecting' | 'away'
  lastSeenAt: string | null
}

export interface MobileLobbyEvent {
  id: string
  type: string
  actorName: string | null
  targetName: string | null
  createdAt: string
  message: string
}

export interface MobileRoomMessageReaction {
  emoji: string
  count: number
  reactedByMe: boolean
}

export interface MobileRoomMessage {
  id: string
  playerId: string | null
  playerName: string | null
  kind: MobileRoomMessageKind
  body: string
  createdAt: string
  deletedAt: string | null
  reactions: MobileRoomMessageReaction[]
}

export interface MobileLobbyJoinRequest {
  id: string
  requestedName: string
  status: 'pending' | 'approved' | 'denied'
  createdAt: string
}

export interface MobileRoundSnapshot {
  id: string
  roundNumber: number
  phase: 'role_reveal' | 'discussion' | 'voting' | 'results'
  packId: string
  sourceCategories: string[]
  startedAt: string
  discussionDuration: number
  readyToDiscussCount: number
  readyToDiscussTotal: number
  voteProgress: {
    submitted: number
    total: number
  } | null
}

export interface MobileLobbySnapshot {
  schemaVersion: number
  lobbyId: string
  code: string
  status: 'waiting' | 'playing' | 'finished'
  hostPlayerId: string | null
  players: MobileLobbyPlayer[]
  selectedCategories: string[]
  events: MobileLobbyEvent[]
  messages: MobileRoomMessage[]
  pendingJoinRequests: MobileLobbyJoinRequest[]
  currentRound: MobileRoundSnapshot | null
}

export interface MobileRoundResult {
  roundId: string
  phase: 'results'
  word: string
  hint: string
  impostorsCaught: boolean
  impostors: Array<{ id: string; name: string }>
  eliminatedPlayerId: string | null
  eliminatedPlayerName: string | null
  voteSummary: Array<{ targetId: string; voteCount: number }>
  isTie: boolean
}

export interface MobileRolePayload {
  role: 'CREWMATE' | 'IMPOSTOR'
  word: string | null
  hint: string | null
}

export interface MobileBootstrapPayload {
  schemaVersion: number
  capabilities: {
    repairLobbyPresence: boolean
    sourceCategories: boolean
    mobileFullGameplay: boolean
    startNextRound: boolean
    roomChat: boolean
    kickPlayer: boolean
    joinApproval: boolean
  }
  accessState: MobileOnlineAccessState
  requestId: string | null
  lobby: MobileLobbySnapshot | null
}

export interface MobileJoinedLobbyResult {
  status: 'joined'
  lobbyId: string
  code: string
  playerId: string
  hostPlayerId: string | null
}

export interface MobilePendingApprovalResult {
  status: 'pending_approval'
  code: string
  requestId: string
}

export type MobileJoinLobbyResult =
  | MobileJoinedLobbyResult
  | MobilePendingApprovalResult

export interface MobileOnlineCategoryOption {
  id: string
  name: string
  emoji: string
  engineCategory: string
}

function normalizeStringArray(value: unknown, fallback: string[]): string[] {
  if (Array.isArray(value)) {
    const normalized = value.map((entry) => String(entry).trim()).filter(Boolean)
    return normalized.length > 0 ? normalized : fallback
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) {
      return fallback
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown
      if (Array.isArray(parsed)) {
        const normalized = parsed.map((entry) => String(entry).trim()).filter(Boolean)
        return normalized.length > 0 ? normalized : fallback
      }
    } catch {
      // Fall through to single-string normalization.
    }

    return [trimmed]
  }

  return fallback
}

function resolveRoundSourceCategories(
  rawRoundCategories: unknown,
  selectedCategories: string[],
  packId: string,
): string[] {
  const normalizedRoundCategories = normalizeStringArray(rawRoundCategories, [])
  const firstRoundCategory = normalizedRoundCategories[0] ?? ''
  if (normalizedRoundCategories.length === 0) {
    return selectedCategories
  }

  const isEverydayOnly =
    normalizedRoundCategories.length === 1 &&
    firstRoundCategory.toLowerCase() === ONLINE_DEFAULT_CATEGORY.toLowerCase()

  if (!isEverydayOnly) {
    return normalizedRoundCategories
  }

  const normalizedPackId = packId.trim()
  const packLooksSpecific =
    normalizedPackId.length > 0 &&
    normalizedPackId.toLowerCase() !== 'everyday' &&
    normalizedPackId.toLowerCase() !== ONLINE_DEFAULT_CATEGORY.toLowerCase()

  if (packLooksSpecific && selectedCategories.includes(normalizedPackId)) {
    return selectedCategories
  }

  if (packLooksSpecific) {
    return [normalizedPackId]
  }

  return normalizedRoundCategories
}

export function isOnlineSchemaCompatible(schemaVersion: number) {
  return schemaVersion === ONLINE_SCHEMA_VERSION
}

export function getOnlineSchemaMismatchMessage(schemaVersion: number) {
  return `Online multiplayer needs a backend migration. Expected schema v${ONLINE_SCHEMA_VERSION}, received v${schemaVersion}.`
}

export function getMobileOnlineCategoryOptions(): MobileOnlineCategoryOption[] {
  const categories = Array.from(new Set(ALL_WORDS.map((entry) => entry.category))).sort((left, right) =>
    left.localeCompare(right),
  )

  return categories.map((category) => ({
    id: category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: category,
    emoji: mobileCategoryEmoji[category] ?? '✨',
    engineCategory: category,
  }))
}

export function pickMobileOnlineRoundWordForCategories(categories: string[]) {
  const normalizedCategories = categories.map((category) => category.trim()).filter(Boolean)
  const categoryWords = ALL_WORDS.filter((entry) => normalizedCategories.includes(entry.category))
  const fallbackWords = ALL_WORDS.filter((entry) => entry.category === ONLINE_DEFAULT_CATEGORY)
  const selectedPool = categoryWords.length > 0 ? categoryWords : fallbackWords
  const selected = pickRandom([...selectedPool])

  return {
    word: selected.word,
    hint: pickRandom([...selected.hints]),
    packId: selected.category,
  }
}

export function normalizeLobbySnapshot(
  payload: Record<string, unknown>,
): MobileLobbySnapshot {
  const currentRoundRaw =
    payload['current_round'] && typeof payload['current_round'] === 'object'
      ? (payload['current_round'] as Record<string, unknown>)
      : null
  const normalizedSelectedCategories = normalizeStringArray(payload['selected_categories'], [
    ONLINE_DEFAULT_CATEGORY,
  ])

  return {
    schemaVersion: Number(payload['schema_version'] ?? ONLINE_SCHEMA_VERSION),
    lobbyId: String(payload['lobby_id'] ?? ''),
    code: String(payload['code'] ?? '').trim(),
    status: (payload['status'] as MobileLobbySnapshot['status']) ?? 'waiting',
    hostPlayerId: payload['host_player_id'] ? String(payload['host_player_id']) : null,
    players: Array.isArray(payload['players'])
      ? payload['players'].map((player) => ({
          id: String((player as Record<string, unknown>)['id'] ?? ''),
          name: String((player as Record<string, unknown>)['name'] ?? 'Player'),
          isHost: Boolean((player as Record<string, unknown>)['is_host']),
          isReady: Boolean((player as Record<string, unknown>)['is_ready']),
          presenceStatus:
            ((player as Record<string, unknown>)['presence_status'] as
              | 'active'
              | 'reconnecting'
              | 'away'
              | undefined) ?? 'active',
          lastSeenAt: (player as Record<string, unknown>)['last_seen_at']
            ? String((player as Record<string, unknown>)['last_seen_at'])
            : null,
        }))
      : [],
    selectedCategories: normalizedSelectedCategories,
    events: Array.isArray(payload['events'])
      ? payload['events'].map((event) => ({
          id: String((event as Record<string, unknown>)['id'] ?? ''),
          type: String((event as Record<string, unknown>)['type'] ?? 'info'),
          actorName: (event as Record<string, unknown>)['actor_name']
            ? String((event as Record<string, unknown>)['actor_name'])
            : null,
          targetName: (event as Record<string, unknown>)['target_name']
            ? String((event as Record<string, unknown>)['target_name'])
            : null,
          createdAt: String((event as Record<string, unknown>)['created_at'] ?? ''),
          message: String((event as Record<string, unknown>)['message'] ?? ''),
        }))
      : [],
    messages: Array.isArray(payload['messages'])
      ? payload['messages'].map((message) => ({
          id: String((message as Record<string, unknown>)['id'] ?? ''),
          playerId: (message as Record<string, unknown>)['player_id']
            ? String((message as Record<string, unknown>)['player_id'])
            : null,
          playerName: (message as Record<string, unknown>)['player_name']
            ? String((message as Record<string, unknown>)['player_name'])
            : null,
          kind:
            ((message as Record<string, unknown>)['kind'] as MobileRoomMessageKind | undefined) ??
            'system',
          body: String((message as Record<string, unknown>)['body'] ?? ''),
          createdAt: String((message as Record<string, unknown>)['created_at'] ?? ''),
          deletedAt: (message as Record<string, unknown>)['deleted_at']
            ? String((message as Record<string, unknown>)['deleted_at'])
            : null,
          reactions: Array.isArray((message as Record<string, unknown>)['reactions'])
            ? ((message as Record<string, unknown>)['reactions'] as unknown[]).map(
                (reaction) => ({
                  emoji: String((reaction as Record<string, unknown>)['emoji'] ?? ''),
                  count: Number((reaction as Record<string, unknown>)['count'] ?? 0),
                  reactedByMe: Boolean(
                    (reaction as Record<string, unknown>)['reacted_by_me'],
                  ),
                }),
              )
            : [],
        }))
      : [],
    pendingJoinRequests: Array.isArray(payload['pending_join_requests'])
      ? payload['pending_join_requests'].map((request) => ({
          id: String((request as Record<string, unknown>)['id'] ?? ''),
          requestedName: String(
            (request as Record<string, unknown>)['requested_name'] ?? 'Player',
          ),
          status:
            ((request as Record<string, unknown>)['status'] as MobileLobbyJoinRequest['status']) ??
            'pending',
          createdAt: String((request as Record<string, unknown>)['created_at'] ?? ''),
        }))
      : [],
    currentRound: currentRoundRaw
      ? {
          id: String(currentRoundRaw['id'] ?? ''),
          roundNumber: Number(currentRoundRaw['round_number'] ?? 1),
          phase:
            (currentRoundRaw['phase'] as MobileRoundSnapshot['phase']) ?? 'role_reveal',
          packId: String(currentRoundRaw['pack_id'] ?? 'everyday'),
          sourceCategories: resolveRoundSourceCategories(
            currentRoundRaw['source_categories'],
            normalizedSelectedCategories,
            String(currentRoundRaw['pack_id'] ?? 'everyday'),
          ),
          startedAt: String(currentRoundRaw['started_at'] ?? ''),
          discussionDuration: Number(currentRoundRaw['discussion_duration'] ?? 60),
          readyToDiscussCount: Number(currentRoundRaw['ready_to_discuss_count'] ?? 0),
          readyToDiscussTotal: Number(currentRoundRaw['ready_to_discuss_total'] ?? 0),
          voteProgress:
            currentRoundRaw['vote_progress'] &&
            typeof currentRoundRaw['vote_progress'] === 'object'
              ? {
                  submitted: Number(
                    (currentRoundRaw['vote_progress'] as Record<string, unknown>)['submitted'] ??
                      0,
                  ),
                  total: Number(
                    (currentRoundRaw['vote_progress'] as Record<string, unknown>)['total'] ?? 0,
                  ),
                }
              : null,
        }
      : null,
  }
}

export function normalizeRoundSnapshotPayload(
  payload: Record<string, unknown>,
  fallbackCategories: string[] = ['Everyday'],
): MobileRoundSnapshot {
  const voteProgressRaw =
    payload['vote_progress'] && typeof payload['vote_progress'] === 'object'
      ? (payload['vote_progress'] as Record<string, unknown>)
      : null

  return {
    id: String(payload['id'] ?? ''),
    roundNumber: Number(payload['round_number'] ?? 1),
    phase: (payload['phase'] as MobileRoundSnapshot['phase']) ?? 'role_reveal',
    packId: String(payload['pack_id'] ?? 'everyday'),
    sourceCategories: resolveRoundSourceCategories(
      payload['source_categories'],
      fallbackCategories,
      String(payload['pack_id'] ?? 'everyday'),
    ),
    startedAt: String(payload['started_at'] ?? ''),
    discussionDuration: Number(payload['discussion_duration'] ?? 60),
    readyToDiscussCount: Number(payload['ready_to_discuss_count'] ?? 0),
    readyToDiscussTotal: Number(payload['ready_to_discuss_total'] ?? 0),
    voteProgress: voteProgressRaw
      ? {
          submitted: Number(voteProgressRaw['submitted'] ?? 0),
          total: Number(voteProgressRaw['total'] ?? 0),
        }
      : null,
  }
}

export function normalizeBootstrapPayload(
  payload: Record<string, unknown>,
): MobileBootstrapPayload {
  const lobbyRaw =
    payload['lobby'] && typeof payload['lobby'] === 'object'
      ? (payload['lobby'] as Record<string, unknown>)
      : null
  const capabilitiesRaw =
    payload['capabilities'] && typeof payload['capabilities'] === 'object'
      ? (payload['capabilities'] as Record<string, unknown>)
      : {}

  return {
    schemaVersion: Number(payload['schema_version'] ?? ONLINE_SCHEMA_VERSION),
    capabilities: {
      repairLobbyPresence: Boolean(capabilitiesRaw['repair_lobby_presence']),
      sourceCategories: Boolean(capabilitiesRaw['source_categories']),
      mobileFullGameplay: Boolean(capabilitiesRaw['mobile_full_gameplay']),
      startNextRound: Boolean(capabilitiesRaw['start_next_round']),
      roomChat: Boolean(capabilitiesRaw['room_chat']),
      kickPlayer: Boolean(capabilitiesRaw['kick_player']),
      joinApproval: Boolean(capabilitiesRaw['join_approval']),
    },
    accessState:
      (payload['access_state'] as MobileOnlineAccessState | undefined) ?? 'none',
    requestId: payload['request_id'] ? String(payload['request_id']) : null,
    lobby: lobbyRaw ? normalizeLobbySnapshot(lobbyRaw) : null,
  }
}

export function normalizeRolePayload(payload: Record<string, unknown>): MobileRolePayload {
  return {
    role: (payload['role'] as MobileRolePayload['role']) ?? 'CREWMATE',
    word: payload['word'] ? String(payload['word']) : null,
    hint: payload['hint'] ? String(payload['hint']) : null,
  }
}

export function normalizeRoundResult(payload: Record<string, unknown>): MobileRoundResult {
  return {
    roundId: String(payload['round_id'] ?? ''),
    phase: 'results',
    word: String(payload['word'] ?? ''),
    hint: String(payload['hint'] ?? ''),
    impostorsCaught: Boolean(payload['impostors_caught']),
    impostors: Array.isArray(payload['impostors'])
      ? payload['impostors'].map((player) => ({
          id: String((player as Record<string, unknown>)['id'] ?? ''),
          name: String((player as Record<string, unknown>)['name'] ?? 'Player'),
        }))
      : [],
    eliminatedPlayerId: payload['eliminated_player_id']
      ? String(payload['eliminated_player_id'])
      : null,
    eliminatedPlayerName: payload['eliminated_player_name']
      ? String(payload['eliminated_player_name'])
      : null,
    voteSummary: Array.isArray(payload['vote_summary'])
      ? payload['vote_summary'].map((item) => ({
          targetId: String((item as Record<string, unknown>)['target_id'] ?? ''),
          voteCount: Number((item as Record<string, unknown>)['vote_count'] ?? 0),
        }))
      : [],
    isTie: Boolean(payload['is_tie']),
  }
}

export function getErrorMessage(error: unknown): string {
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

export function normalizeJoinLobbyResult(
  payload: Record<string, unknown>,
): MobileJoinLobbyResult {
  const status = String(payload['status'] ?? 'joined')

  if (status === 'pending_approval') {
    return {
      status: 'pending_approval',
      code: String(payload['code'] ?? '').trim(),
      requestId: String(payload['request_id'] ?? ''),
    }
  }

  return {
    status: 'joined',
    lobbyId: String(payload['lobby_id'] ?? ''),
    code: String(payload['code'] ?? '').trim(),
    playerId: String(payload['player_id'] ?? ''),
    hostPlayerId: payload['host_player_id'] ? String(payload['host_player_id']) : null,
  }
}
