/**
 * Contract for transient multiplayer state. Implement this with Supabase Realtime Presence
 * today or a Redis/edge-KV adapter later; neither implementation changes game rules.
 */
export interface LivePlayerState {
  playerId: string
  connected: boolean
  typing: boolean
  suspicion: number
  ready: boolean
  updatedAt: number
}

export interface LiveRoundState {
  lobbyId: string
  roundId: string | null
  phase: string
  endsAt: number | null
  players: Record<string, LivePlayerState>
}

export interface LiveStateStore {
  read(lobbyId: string): Promise<LiveRoundState | null>
  write(state: LiveRoundState): Promise<void>
  remove(lobbyId: string): Promise<void>
}

/** Useful for local/offline games and deterministic tests; production must inject a shared adapter. */
export class MemoryLiveStateStore implements LiveStateStore {
  private readonly states = new Map<string, LiveRoundState>()

  async read(lobbyId: string): Promise<LiveRoundState | null> {
    return this.states.get(lobbyId) ?? null
  }

  async write(state: LiveRoundState): Promise<void> {
    this.states.set(state.lobbyId, state)
  }

  async remove(lobbyId: string): Promise<void> {
    this.states.delete(lobbyId)
  }
}
