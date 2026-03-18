import { create } from 'zustand'
import { GameEngine, createInitialState } from '@impostor/core'
import type { GameState, GameConfig, Player, RoundResult } from '@impostor/core'

interface OfflineGameState {
  // Offline-specific state
  currentPlayerIndex: number // For role reveal pass-the-phone
  currentVoterIndex: number
  allRolesSeen: boolean
  selectedCategories: string[]
}

interface GameStore {
  // Core engine instance
  engine: GameEngine
  
  // Offline flow state
  offlineState: OfflineGameState
  
  // Last round result for displaying on ResultsScreen
  lastResult: RoundResult | null

  // Getters
  getGame: () => GameState
  
  // Offline setup actions
  initializeOfflineGame: (config: GameConfig, players: Player[]) => void
  setSelectedCategories: (categoryIds: string[]) => void
  
  // Round flow actions
  startRound: (selectedCategories: string[]) => void
  advanceToNextPlayer: () => void
  completeRoleReveal: () => void
  beginDiscussion: () => void
  beginVoting: () => void
  castVote: (voterId: string, targetId: string) => void
  advanceToNextVoter: () => boolean
  finishVoting: () => RoundResult | null
  nextRound: () => void
  resetGame: () => void
}

const createOfflineState = (): OfflineGameState => ({
  currentPlayerIndex: 0,
  currentVoterIndex: 0,
  allRolesSeen: false,
  selectedCategories: [],
})

export const useGameStore = create<GameStore>((set, get) => ({
  engine: new GameEngine(createInitialState()),
  offlineState: createOfflineState(),
  lastResult: null,

  getGame() {
    return get().engine.getState()
  },

  initializeOfflineGame(config, players) {
    const { engine } = get()
    engine.setupGame(config, players)
    set({ offlineState: createOfflineState() })
  },

  setSelectedCategories(categoryIds) {
    set((state) => ({
      offlineState: { ...state.offlineState, selectedCategories: categoryIds },
    }))
  },

  startRound(selectedCategories) {
    const { engine } = get()
    engine.startRound(selectedCategories)
    set({
      offlineState: {
        ...get().offlineState,
        selectedCategories,
        currentPlayerIndex: 0,
        currentVoterIndex: 0,
        allRolesSeen: false,
      },
    })
  },

  advanceToNextPlayer() {
    const { offlineState, engine } = get()
    const players = engine.getState().currentRound?.players ?? []
    const nextIndex = offlineState.currentPlayerIndex + 1

    if (nextIndex >= players.length) {
      set({
        offlineState: {
          ...offlineState,
          allRolesSeen: true,
        },
      })
    } else {
      set({
        offlineState: {
          ...offlineState,
          currentPlayerIndex: nextIndex,
        },
      })
    }
  },

  completeRoleReveal() {
    get().engine.completeRoleReveal()
  },

  beginDiscussion() {
    get().engine.startDiscussion()
  },

  beginVoting() {
    const { engine, offlineState } = get()
    engine.startVoting()
    set({
      offlineState: {
        ...offlineState,
        currentVoterIndex: 0,
      },
    })
  },

  castVote(voterId, targetId) {
    get().engine.castVote(voterId, targetId)
  },

  advanceToNextVoter() {
    const { offlineState, engine } = get()
    const players = engine.getState().currentRound?.players ?? []
    const nextIndex = offlineState.currentVoterIndex + 1

    set({
      offlineState: {
        ...offlineState,
        currentVoterIndex: nextIndex,
      },
    })

    return nextIndex >= players.length
  },

  finishVoting() {
    const { engine } = get()
    const result = engine.resolveRound()
    set({ lastResult: result })
    return result
  },

  nextRound() {
    // Reset offline state for next round (role reveal flow starts over)
    set({
      offlineState: {
        ...get().offlineState,
        currentPlayerIndex: 0,
        currentVoterIndex: 0,
        allRolesSeen: false,
      },
    })
  },

  resetGame() {
    const { engine } = get()
    engine.resetGame()
    set({
      offlineState: createOfflineState(),
      lastResult: null,
    })
  },
}))
