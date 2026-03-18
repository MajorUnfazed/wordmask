import { ALL_WORDS, pickRandom } from '@impostor/core'
import { RECOMMENDED_CATEGORIES } from './categoryUI'

export const ONLINE_PACK_ID = 'everyday'
export const ONLINE_DISCUSSION_DURATION = 60
export const ONLINE_IMPOSTOR_COUNT = 1
export const ONLINE_DEFAULT_CATEGORY = 'Everyday'
export const ONLINE_START_COUNTDOWN_SECONDS = 3

export type OnlinePresenceStatus = 'active' | 'reconnecting' | 'away'

export interface LobbyEvent {
  id: string
  type: string
  actorName: string | null
  targetName: string | null
  createdAt: string
  message: string
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
  startedAt: string
  discussionDuration: number
  readyToDiscussCount: number
  readyToDiscussTotal: number
  voteProgress: OnlineVoteProgress | null
}

export interface OnlineLobbySnapshot {
  lobbyId: string
  code: string
  status: 'waiting' | 'playing' | 'finished'
  hostPlayerId: string | null
  players: OnlineLobbyPlayer[]
  selectedCategories: string[]
  events: LobbyEvent[]
  currentRound: OnlineRoundSnapshot | null
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

export function normalizeLobbySnapshot(payload: Record<string, unknown>): OnlineLobbySnapshot {
  const currentRoundRaw =
    payload['current_round'] && typeof payload['current_round'] === 'object'
      ? (payload['current_round'] as Record<string, unknown>)
      : null
  const voteProgressRaw =
    currentRoundRaw?.['vote_progress'] && typeof currentRoundRaw['vote_progress'] === 'object'
      ? (currentRoundRaw['vote_progress'] as Record<string, unknown>)
      : null

  return {
    lobbyId: String(payload['lobby_id'] ?? ''),
    code: String(payload['code'] ?? '').trim(),
    status: (payload['status'] as OnlineLobbySnapshot['status']) ?? 'waiting',
    hostPlayerId: payload['host_player_id'] ? String(payload['host_player_id']) : null,
    players: Array.isArray(payload['players'])
      ? payload['players'].map((player) =>
          normalizeLobbyPlayer(player as Record<string, unknown>),
        )
      : [],
    selectedCategories: Array.isArray(payload['selected_categories'])
      ? payload['selected_categories'].map((value) => String(value))
      : [ONLINE_DEFAULT_CATEGORY],
    events: Array.isArray(payload['events'])
      ? payload['events'].map((event) => normalizeLobbyEvent(event as Record<string, unknown>))
      : [],
    currentRound: currentRoundRaw
      ? {
          id: String(currentRoundRaw['id'] ?? ''),
          roundNumber: Number(currentRoundRaw['round_number'] ?? 1),
          phase:
            (currentRoundRaw['phase'] as OnlineRoundSnapshot['phase']) ?? 'role_reveal',
          packId: String(currentRoundRaw['pack_id'] ?? ONLINE_PACK_ID),
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
