import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { GameEngine, createInitialState } from '@impostor/core'
import type { GameState, GameConfig, Player, RoundResult } from '@impostor/core'

interface OfflineGameState {
  currentPlayerIndex: number
  currentVoterIndex: number
  allRolesSeen: boolean
  selectedCategories: string[]
}

interface GameStore {
  engine: GameEngine
  offlineState: OfflineGameState
  lastResult: RoundResult | null

  getGame: () => GameState
  initializeOfflineGame: (config: GameConfig, players: Player[]) => void
  setSelectedCategories: (categoryIds: string[]) => void
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

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
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
            offlineState: { ...offlineState, allRolesSeen: true },
          })
        } else {
          set({
            offlineState: { ...offlineState, currentPlayerIndex: nextIndex },
          })
        }
      },

      completeRoleReveal() {
        get().engine.completeRoleReveal()
        // Trigger re-render by creating a copy of the engine instance reference
        const engine = get().engine
        set({ engine })
      },

      beginDiscussion() {
        get().engine.startDiscussion()
        const engine = get().engine
        set({ engine })
      },

      beginVoting() {
        const { engine, offlineState } = get()
        engine.startVoting()
        set({
          engine,
          offlineState: { ...offlineState, currentVoterIndex: 0 },
        })
      },

      castVote(voterId, targetId) {
        get().engine.castVote(voterId, targetId)
        const engine = get().engine
        set({ engine })
      },

      advanceToNextVoter() {
        const { offlineState, engine } = get()
        const players = engine.getState().currentRound?.players ?? []
        const nextIndex = offlineState.currentVoterIndex + 1

        set({
          offlineState: { ...offlineState, currentVoterIndex: nextIndex },
        })

        return nextIndex >= players.length
      },

      finishVoting() {
        const { engine } = get()
        const result = engine.resolveRound()
        set({ engine, lastResult: result })
        return result
      },

      nextRound() {
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
          engine,
          offlineState: createOfflineState(),
          lastResult: null,
        })
      },
    }),
    {
      name: 'wordmask-game-storage',
      version: 1,
      partialize: (state) => ({
        engineSnapshot: state.engine.getState(),
        offlineState: state.offlineState,
        lastResult: state.lastResult,
      }),
      merge: (persistedState: any, currentState) => {
        if (!persistedState) return currentState

        return {
          ...currentState,
          offlineState: persistedState.offlineState ?? createOfflineState(),
          lastResult: persistedState.lastResult ?? null,
          engine: new GameEngine(persistedState.engineSnapshot ?? createInitialState()),
        }
      },
      storage: createJSONStorage(() => localStorage, {
        reviver: (key, value: any) => {
          if (value && typeof value === 'object' && value.__type === 'Set') {
            return new Set(value.value)
          }
          return value
        },
        replacer: (key, value) => {
          if (value instanceof Set) {
            return { __type: 'Set', value: Array.from(value) }
          }
          return value
        },
      }),
    }
  )
)
