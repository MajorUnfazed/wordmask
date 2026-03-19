import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type {
  OnlineAccessState,
  OnlineLobbyPlayer,
  OnlineLobbySnapshot,
  RoomMessage,
  LobbyJoinRequest,
} from '../lib/online'

export type LobbyPlayer = OnlineLobbyPlayer

interface LobbyStore {
  schemaVersion: number
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
  messages: RoomMessage[]
  pendingJoinRequests: LobbyJoinRequest[]
  accessState: OnlineAccessState
  pendingJoinRequestId: string | null
  lastSeenMessageId: string | null

  setDisplayName: (name: string) => void
  setLocalPlayerId: (id: string | null) => void
  setSelectedCategories: (categories: string[]) => void
  setAccessState: (accessState: OnlineAccessState, requestId?: string | null) => void
  setPendingAccessState: (
    code: string,
    accessState: Extract<OnlineAccessState, 'blocked' | 'pending_approval'>,
    requestId?: string | null,
  ) => void
  setLastSeenMessageId: (messageId: string | null) => void
  updatePlayer: (playerId: string, updates: Partial<LobbyPlayer>) => void
  hydrateLobby: (snapshot: OnlineLobbySnapshot) => void
  setStatus: (status: LobbyStore['status']) => void
  setCurrentRoundId: (id: string | null) => void
  clearLobby: () => void
}

const initialState = {
  schemaVersion: 0,
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
  messages: [] as RoomMessage[],
  pendingJoinRequests: [] as LobbyJoinRequest[],
  accessState: 'none' as OnlineAccessState,
  pendingJoinRequestId: null,
  lastSeenMessageId: null,
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

      setAccessState(accessState, requestId = null) {
        set({
          accessState,
          pendingJoinRequestId: requestId,
        })
      },

      setPendingAccessState(code, accessState, requestId = null) {
        set((state) => ({
          ...initialState,
          code,
          displayName: state.displayName,
          accessState,
          pendingJoinRequestId: requestId,
          lastSeenMessageId: state.lastSeenMessageId,
        }))
      },

      setLastSeenMessageId(messageId) {
        set({ lastSeenMessageId: messageId })
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
          schemaVersion: snapshot.schemaVersion,
          lobbyId: snapshot.lobbyId,
          code: snapshot.code,
          players: snapshot.players,
          hostPlayerId: snapshot.hostPlayerId,
          status: snapshot.status,
          currentRoundId: snapshot.currentRound?.id ?? null,
          lastKnownPhase: snapshot.currentRound?.phase ?? null,
          selectedCategories: snapshot.selectedCategories,
          events: snapshot.events,
          messages: snapshot.messages,
          pendingJoinRequests: snapshot.pendingJoinRequests,
          accessState: 'member',
          pendingJoinRequestId: null,
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
        schemaVersion: state.schemaVersion,
        code: state.code,
        localPlayerId: state.localPlayerId,
        hostPlayerId: state.hostPlayerId,
        status: state.status,
        currentRoundId: state.currentRoundId,
        lastKnownPhase: state.lastKnownPhase,
        displayName: state.displayName,
        selectedCategories: state.selectedCategories,
        accessState: state.accessState,
        pendingJoinRequestId: state.pendingJoinRequestId,
        lastSeenMessageId: state.lastSeenMessageId,
      }),
    },
  ),
)
