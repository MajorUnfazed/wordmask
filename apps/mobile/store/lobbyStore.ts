import { create } from 'zustand'
import type {
  MobileLobbyPlayer,
  MobileLobbySnapshot,
  MobileOnlineAccessState,
  MobileRoomMessage,
  MobileLobbyJoinRequest,
} from '../lib/online'

interface MobileLobbyStore {
  schemaVersion: number
  lobbyId: string | null
  code: string | null
  players: MobileLobbyPlayer[]
  localPlayerId: string | null
  hostPlayerId: string | null
  status: 'waiting' | 'playing' | 'finished'
  currentRoundId: string | null
  displayName: string | null
  selectedCategories: string[]
  events: MobileLobbySnapshot['events']
  messages: MobileRoomMessage[]
  pendingJoinRequests: MobileLobbyJoinRequest[]
  accessState: MobileOnlineAccessState
  pendingJoinRequestId: string | null
  lastSeenMessageId: string | null

  setDisplayName: (name: string) => void
  setLocalPlayerId: (id: string | null) => void
  setSelectedCategories: (categories: string[]) => void
  setAccessState: (accessState: MobileOnlineAccessState, requestId?: string | null) => void
  setPendingAccessState: (
    code: string,
    accessState: Extract<MobileOnlineAccessState, 'blocked' | 'pending_approval'>,
    requestId?: string | null,
  ) => void
  setLastSeenMessageId: (messageId: string | null) => void
  hydrateLobby: (snapshot: MobileLobbySnapshot) => void
  clearLobby: () => void
}

const initialState = {
  schemaVersion: 0,
  lobbyId: null,
  code: null,
  players: [] as MobileLobbyPlayer[],
  localPlayerId: null,
  hostPlayerId: null,
  status: 'waiting' as const,
  currentRoundId: null,
  displayName: null,
  selectedCategories: ['Everyday'],
  events: [] as MobileLobbySnapshot['events'],
  messages: [] as MobileRoomMessage[],
  pendingJoinRequests: [] as MobileLobbyJoinRequest[],
  accessState: 'none' as MobileOnlineAccessState,
  pendingJoinRequestId: null,
  lastSeenMessageId: null,
}

export const useMobileLobbyStore = create<MobileLobbyStore>((set) => ({
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

  hydrateLobby(snapshot) {
    set({
      schemaVersion: snapshot.schemaVersion,
      lobbyId: snapshot.lobbyId,
      code: snapshot.code,
      players: snapshot.players,
      hostPlayerId: snapshot.hostPlayerId,
      status: snapshot.status,
      currentRoundId: snapshot.currentRound?.id ?? null,
      selectedCategories: snapshot.selectedCategories,
      events: snapshot.events,
      messages: snapshot.messages,
      pendingJoinRequests: snapshot.pendingJoinRequests,
      accessState: 'member',
      pendingJoinRequestId: null,
    })
  },

  clearLobby() {
    set(initialState)
  },
}))
