import { create } from 'zustand'
import { GameEngine, createInitialState } from '@impostor/core'
import type { GameState, GameConfig, Player, RoundResult, WordEntry } from '@impostor/core'
import { useStatsStore } from './statsStore'
import { outcomeFromStandardRound, outcomeFromPassThePhone } from '../lib/stats'

interface OfflineGameState {
  // Offline-specific state
  currentPlayerIndex: number // For role reveal pass-the-phone
  currentVoterIndex: number
  allRolesSeen: boolean
  selectedCategories: string[]
  /** The game mode chosen at setup — propagated from config for UI use */
  gameMode: 'STANDARD' | 'PASS_THE_PHONE'
  /** Which player is the device owner ("this is me"), used to record personal stats. */
  localPlayerId: string | null
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
  initializeOfflineGame: (config: GameConfig, players: Player[], localPlayerId?: string | null) => void
  setSelectedCategories: (categoryIds: string[]) => void
  
  // Round flow actions
  startRound: (selectedCategories: string[], extraWords?: WordEntry[]) => void
  advanceToNextPlayer: () => void
  completeRoleReveal: () => void
  beginDiscussion: () => void
  beginVoting: () => void
  castVote: (voterId: string, targetId: string) => void
  advanceToNextVoter: () => boolean
  finishVoting: () => RoundResult | null
  /**
   * Skip the round-robin and resolve the round immediately with a unanimous group
   * accusation: every eligible player's vote is set to `targetId`, then the round
   * resolves exactly like finishVoting(). For the common table behaviour where the
   * group already agrees and just points at one suspect instead of voting one by one.
   */
  skipVoteGroupAccusation: (targetId: string) => RoundResult | null
  answerPassThePhone: (impostorCaught: boolean) => void
  nextRound: () => void
  resetGame: () => void
}

const createOfflineState = (): OfflineGameState => ({
  currentPlayerIndex: 0,
  currentVoterIndex: 0,
  allRolesSeen: false,
  selectedCategories: [],
  gameMode: 'STANDARD',
  localPlayerId: null,
})

export const useGameStore = create<GameStore>((set, get) => ({
  engine: new GameEngine(createInitialState()),
  offlineState: createOfflineState(),
  lastResult: null,

  getGame() {
    return get().engine.getState()
  },

  initializeOfflineGame(config, players, localPlayerId) {
    const { engine } = get()
    engine.setupGame(config, players)
    set({
      offlineState: {
        ...createOfflineState(),
        gameMode: config.mode ?? 'STANDARD',
        localPlayerId: localPlayerId ?? players[0]?.id ?? null,
      },
    })
  },

  setSelectedCategories(categoryIds) {
    set((state) => ({
      offlineState: { ...state.offlineState, selectedCategories: categoryIds },
    }))
  },

  startRound(selectedCategories, extraWords) {
    const { engine } = get()
    engine.startRound(selectedCategories, extraWords)
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
    const { engine, offlineState } = get()
    // Capture the round before resolving — resolveRound may clear currentRound.
    const roundBefore = engine.getState().currentRound
    const result = engine.resolveRound()

    // Offline STANDARD mode has no final-guess screen. When the impostor is caught,
    // the engine parks in FINAL_IMPOSTOR_GUESS with the round NOT yet committed to
    // `rounds`, waiting for a guess that offline will never collect. Auto-resolve it
    // as a failed guess so the engine advances to RESULTS (crew keeps the win — an
    // empty guess never matches the word) and the completed round lands in `rounds`
    // for ResultsScreen. Without this, the NEXT round's ROUND_STARTED throws
    // "Cannot start round from phase FINAL_IMPOSTOR_GUESS".
    const stalled = engine.getState()
    if (stalled.phase === 'FINAL_IMPOSTOR_GUESS' && stalled.currentRound?.finalGuess) {
      engine.submitFinalImpostorGuess(stalled.currentRound.finalGuess.impostorId, '')
    }

    set({ lastResult: result })

    if (result && roundBefore) {
      const outcome = outcomeFromStandardRound(
        roundBefore,
        result,
        offlineState.localPlayerId,
        engine.getState().scores,
      )
      if (outcome) useStatsStore.getState().recordRound(outcome)
    }

    return result
  },

  skipVoteGroupAccusation(targetId) {
    const { engine } = get()
    const round = engine.getState().currentRound
    if (!round) return null

    // Everyone eligible points at the suspect at once. This overwrites any partial
    // round-robin votes already recorded — the table has agreed out loud, which is the
    // entire point of skipping the one-by-one flow. The accused casts no vote, leaving
    // them a clean plurality. Phase is VOTING here (we arrive from beginVoting()).
    for (const player of round.players) {
      if (player.id === targetId || player.isSpectator || player.isEliminated) continue
      engine.castVote(player.id, targetId)
    }

    // Reuse the standard resolution path: scoring, jester handling, the FINAL_IMPOSTOR_GUESS
    // stall auto-resolve, and stats recording all live in finishVoting().
    return get().finishVoting()
  },

  answerPassThePhone(impostorCaught: boolean) {
    const { engine, offlineState } = get()
    // Capture the round before answering — the reducer clears currentRound.
    const roundBefore = engine.getState().currentRound
    engine.answerPassThePhone(impostorCaught)

    if (roundBefore) {
      const outcome = outcomeFromPassThePhone(
        roundBefore,
        impostorCaught,
        offlineState.localPlayerId,
        engine.getState().scores,
      )
      if (outcome) useStatsStore.getState().recordRound(outcome)
    }
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
