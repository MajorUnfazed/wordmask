import { ALL_WORDS, pickRandom } from '@impostor/core'
import { RECOMMENDED_CATEGORIES } from './categoryUI'

export const ONLINE_PACK_ID = 'everyday'
export const ONLINE_DISCUSSION_DURATION = 60
export const ONLINE_IMPOSTOR_COUNT = 1
export const ONLINE_DEFAULT_CATEGORY = 'Everyday'
export const ONLINE_START_COUNTDOWN_SECONDS = 3
export const ONLINE_SCHEMA_VERSION = 9

export type OnlinePresenceStatus = 'active' | 'reconnecting' | 'away'
export type OnlineAccessState = 'member' | 'blocked' | 'pending_approval' | 'none'
export type RoomMessageKind = 'text' | 'system' | 'tombstone'

export interface LobbyEvent {
  id: string
  type: string
  actorName: string | null
  targetName: string | null
  createdAt: string
  message: string
}

export interface RoomMessageReaction {
  emoji: string
  count: number
  reactedByMe: boolean
}

export interface RoomMessage {
  id: string
  playerId: string | null
  playerName: string | null
  kind: RoomMessageKind
  body: string
  createdAt: string
  deletedAt: string | null
  reactions: RoomMessageReaction[]
}

export interface LobbyJoinRequest {
  id: string
  requestedName: string
  status: 'pending' | 'approved' | 'denied'
  createdAt: string
}

export interface OnlineLobbyPlayer {
  id: string
  name: string
  isHost: boolean
  isReady: boolean
  presenceStatus: OnlinePresenceStatus
  lastSeenAt: string | null
  score?: number
}

export interface OnlineVoteProgress {
  submitted: number
  total: number
}

export interface OnlineRoundSnapshot {
  id: string
  roundNumber: number
  phase: 'role_reveal' | 'discussion' | 'voting' | 'results'
  packId: string
  sourceCategories: string[]
  startedAt: string
  discussionDuration: number
  readyToDiscussCount: number
  readyToDiscussTotal: number
  voteProgress: OnlineVoteProgress | null
}

export interface OnlineLobbySnapshot {
  schemaVersion: number
  lobbyId: string
  code: string
  status: 'waiting' | 'playing' | 'finished'
  hostPlayerId: string | null
  players: OnlineLobbyPlayer[]
  selectedCategories: string[]
  events: LobbyEvent[]
  messages: RoomMessage[]
  pendingJoinRequests: LobbyJoinRequest[]
  currentRound: OnlineRoundSnapshot | null
}

export interface OnlineBootstrapPayload {
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
  accessState: OnlineAccessState
  requestId: string | null
  lobby: OnlineLobbySnapshot | null
}

export interface JoinedLobbyResult {
  status: 'joined'
  lobbyId: string
  code: string
  playerId: string
  hostPlayerId: string | null
}

export interface PendingApprovalResult {
  status: 'pending_approval'
  code: string
  requestId: string
}

export type JoinLobbyResult = JoinedLobbyResult | PendingApprovalResult

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
  const normalizedSelected = normalizeStringArray(rawRoundCategories, [])
  const firstRoundCategory = normalizedSelected[0] ?? ''
  if (normalizedSelected.length === 0) {
    return selectedCategories
  }

  const isEverydayOnly =
    normalizedSelected.length === 1 &&
    firstRoundCategory.toLowerCase() === ONLINE_DEFAULT_CATEGORY.toLowerCase()

  if (!isEverydayOnly) {
    return normalizedSelected
  }

  const normalizedPackId = packId.trim()
  const packLooksSpecific =
    normalizedPackId.length > 0 &&
    normalizedPackId.toLowerCase() !== ONLINE_PACK_ID.toLowerCase() &&
    normalizedPackId.toLowerCase() !== ONLINE_DEFAULT_CATEGORY.toLowerCase()

  if (packLooksSpecific && selectedCategories.includes(normalizedPackId)) {
    return selectedCategories
  }

  if (packLooksSpecific) {
    return [normalizedPackId]
  }

  return normalizedSelected
}

export function isOnlineSchemaCompatible(schemaVersion: number) {
  return schemaVersion === ONLINE_SCHEMA_VERSION
}

export function getOnlineSchemaMismatchMessage(schemaVersion: number) {
  return `Online multiplayer needs a backend migration. Expected schema v${ONLINE_SCHEMA_VERSION}, received v${schemaVersion}.`
}

export interface OnlineRolePayload {
  role: 'CREWMATE' | 'IMPOSTOR'
  word: string | null
  hint: string | null
}

export interface OnlineVoteSummaryItem {
  targetId: string
  voteCount: number
}

export interface OnlineRoundResult {
  roundId: string
  phase: 'results'
  word: string
  hint: string
  impostorsCaught: boolean
  impostors: Array<{ id: string; name: string }>
  eliminatedPlayerId: string | null
  eliminatedPlayerName: string | null
  voteSummary: OnlineVoteSummaryItem[]
  isTie: boolean
}

function normalizeLobbyPlayer(player: Record<string, unknown>): OnlineLobbyPlayer {
  return {
    id: String(player['id'] ?? ''),
    name: String(player['name'] ?? 'Player'),
    isHost: Boolean(player['is_host']),
    isReady: Boolean(player['is_ready']),
    presenceStatus:
      (player['presence_status'] as OnlinePresenceStatus | undefined) ?? 'active',
    lastSeenAt: player['last_seen_at'] ? String(player['last_seen_at']) : null,
    score:
      typeof player['score'] === 'number'
        ? player['score']
        : Number(player['score'] ?? 0),
  }
}

function normalizeLobbyEvent(payload: Record<string, unknown>): LobbyEvent {
  return {
    id: String(payload['id'] ?? ''),
    type: String(payload['type'] ?? 'info'),
    actorName: payload['actor_name'] ? String(payload['actor_name']) : null,
    targetName: payload['target_name'] ? String(payload['target_name']) : null,
    createdAt: String(payload['created_at'] ?? ''),
    message: String(payload['message'] ?? ''),
  }
}

function normalizeRoomMessageReaction(
  payload: Record<string, unknown>,
): RoomMessageReaction {
  return {
    emoji: String(payload['emoji'] ?? ''),
    count: Number(payload['count'] ?? 0),
    reactedByMe: Boolean(payload['reacted_by_me']),
  }
}

function normalizeRoomMessage(payload: Record<string, unknown>): RoomMessage {
  return {
    id: String(payload['id'] ?? ''),
    playerId: payload['player_id'] ? String(payload['player_id']) : null,
    playerName: payload['player_name'] ? String(payload['player_name']) : null,
    kind: (payload['kind'] as RoomMessageKind | undefined) ?? 'system',
    body: String(payload['body'] ?? ''),
    createdAt: String(payload['created_at'] ?? ''),
    deletedAt: payload['deleted_at'] ? String(payload['deleted_at']) : null,
    reactions: Array.isArray(payload['reactions'])
      ? payload['reactions'].map((reaction) =>
          normalizeRoomMessageReaction(reaction as Record<string, unknown>),
        )
      : [],
  }
}

function normalizeLobbyJoinRequest(
  payload: Record<string, unknown>,
): LobbyJoinRequest {
  return {
    id: String(payload['id'] ?? ''),
    requestedName: String(payload['requested_name'] ?? 'Player'),
    status: (payload['status'] as LobbyJoinRequest['status']) ?? 'pending',
    createdAt: String(payload['created_at'] ?? ''),
  }
}

export function normalizeLobbySnapshot(payload: Record<string, unknown>): OnlineLobbySnapshot {
  const currentRoundRaw =
    payload['current_round'] && typeof payload['current_round'] === 'object'
      ? (payload['current_round'] as Record<string, unknown>)
      : null
  const normalizedSelectedCategories = normalizeStringArray(payload['selected_categories'], [
    ONLINE_DEFAULT_CATEGORY,
  ])
  const voteProgressRaw =
    currentRoundRaw?.['vote_progress'] && typeof currentRoundRaw['vote_progress'] === 'object'
      ? (currentRoundRaw['vote_progress'] as Record<string, unknown>)
      : null

  return {
    schemaVersion: Number(payload['schema_version'] ?? ONLINE_SCHEMA_VERSION),
    lobbyId: String(payload['lobby_id'] ?? ''),
    code: String(payload['code'] ?? '').trim(),
    status: (payload['status'] as OnlineLobbySnapshot['status']) ?? 'waiting',
    hostPlayerId: payload['host_player_id'] ? String(payload['host_player_id']) : null,
    players: Array.isArray(payload['players'])
      ? payload['players'].map((player) =>
          normalizeLobbyPlayer(player as Record<string, unknown>),
        )
      : [],
    selectedCategories: normalizedSelectedCategories,
    events: Array.isArray(payload['events'])
      ? payload['events'].map((event) => normalizeLobbyEvent(event as Record<string, unknown>))
      : [],
    messages: Array.isArray(payload['messages'])
      ? payload['messages'].map((message) =>
          normalizeRoomMessage(message as Record<string, unknown>),
        )
      : [],
    pendingJoinRequests: Array.isArray(payload['pending_join_requests'])
      ? payload['pending_join_requests'].map((request) =>
          normalizeLobbyJoinRequest(request as Record<string, unknown>),
        )
      : [],
    currentRound: currentRoundRaw
      ? {
          id: String(currentRoundRaw['id'] ?? ''),
          roundNumber: Number(currentRoundRaw['round_number'] ?? 1),
          phase:
            (currentRoundRaw['phase'] as OnlineRoundSnapshot['phase']) ?? 'role_reveal',
          packId: String(currentRoundRaw['pack_id'] ?? ONLINE_PACK_ID),
          sourceCategories: resolveRoundSourceCategories(
            currentRoundRaw['source_categories'],
            normalizedSelectedCategories,
            String(currentRoundRaw['pack_id'] ?? ONLINE_PACK_ID),
          ),
          startedAt: String(currentRoundRaw['started_at'] ?? ''),
          discussionDuration: Number(
            currentRoundRaw['discussion_duration'] ?? ONLINE_DISCUSSION_DURATION,
          ),
          readyToDiscussCount: Number(currentRoundRaw['ready_to_discuss_count'] ?? 0),
          readyToDiscussTotal: Number(currentRoundRaw['ready_to_discuss_total'] ?? 0),
          voteProgress: voteProgressRaw
            ? {
                submitted: Number(voteProgressRaw['submitted'] ?? 0),
                total: Number(voteProgressRaw['total'] ?? 0),
              }
            : null,
        }
      : null,
  }
}

export function normalizeRoundSnapshotPayload(
  payload: Record<string, unknown>,
  fallbackCategories: string[] = [ONLINE_DEFAULT_CATEGORY],
): OnlineRoundSnapshot {
  const voteProgressRaw =
    payload['vote_progress'] && typeof payload['vote_progress'] === 'object'
      ? (payload['vote_progress'] as Record<string, unknown>)
      : null

  return {
    id: String(payload['id'] ?? ''),
    roundNumber: Number(payload['round_number'] ?? 1),
    phase: (payload['phase'] as OnlineRoundSnapshot['phase']) ?? 'role_reveal',
    packId: String(payload['pack_id'] ?? ONLINE_PACK_ID),
    sourceCategories: resolveRoundSourceCategories(
      payload['source_categories'],
      fallbackCategories,
      String(payload['pack_id'] ?? ONLINE_PACK_ID),
    ),
    startedAt: String(payload['started_at'] ?? ''),
    discussionDuration: Number(payload['discussion_duration'] ?? ONLINE_DISCUSSION_DURATION),
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
): OnlineBootstrapPayload {
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
      (payload['access_state'] as OnlineAccessState | undefined) ?? 'none',
    requestId: payload['request_id'] ? String(payload['request_id']) : null,
    lobby: lobbyRaw ? normalizeLobbySnapshot(lobbyRaw) : null,
  }
}

export function normalizeJoinLobbyResult(payload: Record<string, unknown>): JoinLobbyResult {
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

export function normalizeRolePayload(payload: Record<string, unknown>): OnlineRolePayload {
  return {
    role: (payload['role'] as OnlineRolePayload['role']) ?? 'CREWMATE',
    word: payload['word'] ? String(payload['word']) : null,
    hint: payload['hint'] ? String(payload['hint']) : null,
  }
}

export function normalizeRoundResult(payload: Record<string, unknown>): OnlineRoundResult {
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

export function pickOnlineRoundWord() {
  const everydayWords = ALL_WORDS.filter((entry) => entry.category === ONLINE_DEFAULT_CATEGORY)
  const selected = pickRandom([...everydayWords])

  return {
    word: selected.word,
    hint: pickRandom([...selected.hints]),
    packId: ONLINE_PACK_ID,
  }
}

export function getOnlineCategoryOptions() {
  return RECOMMENDED_CATEGORIES.map((category) => ({
    id: category.id,
    name: category.name,
    emoji: category.emoji,
    engineCategory: category.engineCategory,
  }))
}

export function pickOnlineRoundWordForCategories(categories: string[]) {
  const normalizedCategories = categories
    .map((category) => category.trim())
    .filter(Boolean)

  const categoryWords = ALL_WORDS.filter((entry) =>
    normalizedCategories.includes(entry.category),
  )
  const fallbackWords = ALL_WORDS.filter((entry) => entry.category === ONLINE_DEFAULT_CATEGORY)
  const selectedPool = categoryWords.length > 0 ? categoryWords : fallbackWords
  const selected = pickRandom([...selectedPool])

  return {
    word: selected.word,
    hint: pickRandom([...selected.hints]),
    packId: selected.category,
  }
}
