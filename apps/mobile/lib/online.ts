export interface MobileLobbyPlayer {
  id: string
  name: string
  isHost: boolean
  isReady: boolean
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
