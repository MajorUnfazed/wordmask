import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { OnlineLobbyPlayer, OnlineLobbySnapshot } from '../lib/online'

export type LobbyPlayer = OnlineLobbyPlayer

interface LobbyStore {
  lobbyId: string | null
  code: string | null
  players: LobbyPlayer[]
  localPlayerId: string | null
  hostPlayerId: string | null
  status: 'waiting' | 'playing' | 'finished'
  currentRoundId: string | null
  lastKnownPhase: string | null
  displayName: string | null
  selectedCategories: string[]
  events: OnlineLobbySnapshot['events']

  setDisplayName: (name: string) => void
  setLocalPlayerId: (id: string | null) => void
  setSelectedCategories: (categories: string[]) => void
  updatePlayer: (playerId: string, updates: Partial<LobbyPlayer>) => void
  hydrateLobby: (snapshot: OnlineLobbySnapshot) => void
  setStatus: (status: LobbyStore['status']) => void
  setCurrentRoundId: (id: string | null) => void
  clearLobby: () => void
}

const initialState = {
  lobbyId: null,
  code: null,
  players: [] as LobbyPlayer[],
  localPlayerId: null,
  hostPlayerId: null,
  status: 'waiting' as const,
  currentRoundId: null,
  lastKnownPhase: null,
  displayName: null,
  selectedCategories: ['Everyday'],
  events: [] as OnlineLobbySnapshot['events'],
}

export const useLobbyStore = create<LobbyStore>()(
  persist(
    (set) => ({
      ...initialState,

      setDisplayName(name) {
        set({ displayName: name.trim() || null })
      },

      setLocalPlayerId(id) {
        set({ localPlayerId: id })
      },

      setSelectedCategories(categories) {
        const normalized = categories.map((category) => category.trim()).filter(Boolean)
        set({ selectedCategories: normalized.length > 0 ? normalized : ['Everyday'] })
      },

      updatePlayer(playerId, updates) {
        set((state) => ({
          players: state.players.map((player) =>
            player.id === playerId ? { ...player, ...updates } : player,
          ),
        }))
      },

      hydrateLobby(snapshot) {
        set({
          lobbyId: snapshot.lobbyId,
          code: snapshot.code,
          players: snapshot.players,
          hostPlayerId: snapshot.hostPlayerId,
          status: snapshot.status,
          currentRoundId: snapshot.currentRound?.id ?? null,
          lastKnownPhase: snapshot.currentRound?.phase ?? null,
          selectedCategories: snapshot.selectedCategories,
          events: snapshot.events,
        })
      },

      setStatus(status) {
        set({ status })
      },

      setCurrentRoundId(id) {
        set({ currentRoundId: id })
      },

      clearLobby() {
        set({
          ...initialState,
          displayName: null,
        })
      },
    }),
    {
      name: 'wordmask-online-lobby',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        lobbyId: state.lobbyId,
        code: state.code,
        localPlayerId: state.localPlayerId,
        hostPlayerId: state.hostPlayerId,
        status: state.status,
        currentRoundId: state.currentRoundId,
        lastKnownPhase: state.lastKnownPhase,
        displayName: state.displayName,
        selectedCategories: state.selectedCategories,
      }),
    },
  ),
)
