import { create } from 'zustand'

export interface LobbyPlayer {
  id: string
  name: string
  isHost: boolean
  isReady: boolean
}

interface LobbyStore {
  code: string | null
  players: LobbyPlayer[]
  localPlayerId: string | null

  setCode: (code: string) => void
  setPlayers: (players: LobbyPlayer[]) => void
  setLocalPlayerId: (id: string) => void
  clearLobby: () => void
}

export const useLobbyStore = create<LobbyStore>((set) => ({
  code: null,
  players: [],
  localPlayerId: null,

  setCode(code) {
    set({ code })
  },

  setPlayers(players) {
    set({ players })
  },

  setLocalPlayerId(id) {
    set({ localPlayerId: id })
  },

  clearLobby() {
    set({ code: null, players: [], localPlayerId: null })
  },
}))
