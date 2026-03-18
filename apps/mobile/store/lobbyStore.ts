import { create } from 'zustand'
import type { MobileLobbyPlayer, MobileLobbySnapshot } from '../lib/online'

interface MobileLobbyStore {
  lobbyId: string | null
  code: string | null
  players: MobileLobbyPlayer[]
  localPlayerId: string | null
  hostPlayerId: string | null
  status: 'waiting' | 'playing' | 'finished'
  currentRoundId: string | null
  displayName: string | null

  setDisplayName: (name: string) => void
  setLocalPlayerId: (id: string | null) => void
  hydrateLobby: (snapshot: MobileLobbySnapshot) => void
  clearLobby: () => void
}

const initialState = {
  lobbyId: null,
  code: null,
  players: [] as MobileLobbyPlayer[],
  localPlayerId: null,
  hostPlayerId: null,
  status: 'waiting' as const,
  currentRoundId: null,
  displayName: null,
}

export const useMobileLobbyStore = create<MobileLobbyStore>((set) => ({
  ...initialState,

  setDisplayName(name) {
    set({ displayName: name.trim() || null })
  },

  setLocalPlayerId(id) {
    set({ localPlayerId: id })
  },

  hydrateLobby(snapshot) {
    set({
      lobbyId: snapshot.lobbyId,
      code: snapshot.code,
      players: snapshot.players,
      hostPlayerId: snapshot.hostPlayerId,
      status: snapshot.status,
      currentRoundId: snapshot.currentRound?.id ?? null,
    })
  },

  clearLobby() {
    set(initialState)
  },
}))
