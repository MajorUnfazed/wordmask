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

export interface MobileRoundSnapshot {
  id: string
  roundNumber: number
  phase: 'role_reveal' | 'discussion' | 'voting' | 'results'
  packId: string
  startedAt: string
  discussionDuration: number
}

export interface MobileLobbySnapshot {
  lobbyId: string
  code: string
  status: 'waiting' | 'playing' | 'finished'
  hostPlayerId: string | null
  players: MobileLobbyPlayer[]
  selectedCategories: string[]
  events: MobileLobbyEvent[]
  currentRound: MobileRoundSnapshot | null
}

export function normalizeLobbySnapshot(
  payload: Record<string, unknown>,
): MobileLobbySnapshot {
  const currentRoundRaw =
    payload['current_round'] && typeof payload['current_round'] === 'object'
      ? (payload['current_round'] as Record<string, unknown>)
      : null

  return {
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
    selectedCategories: Array.isArray(payload['selected_categories'])
      ? payload['selected_categories'].map((value) => String(value))
      : ['Everyday'],
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
    currentRound: currentRoundRaw
      ? {
          id: String(currentRoundRaw['id'] ?? ''),
          roundNumber: Number(currentRoundRaw['round_number'] ?? 1),
          phase:
            (currentRoundRaw['phase'] as MobileRoundSnapshot['phase']) ?? 'role_reveal',
          packId: String(currentRoundRaw['pack_id'] ?? 'everyday'),
          startedAt: String(currentRoundRaw['started_at'] ?? ''),
          discussionDuration: Number(currentRoundRaw['discussion_duration'] ?? 60),
        }
      : null,
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Something went wrong.'
}
