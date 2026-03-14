/**
 * useOfflineGame — hook that provides game state and actions for offline mode.
 * Keeps screen components thin by encapsulating store interactions.
 */
import { useGameStore } from '../store/gameStore'
import { useMemo } from 'react'

export function useOfflineGame() {
  const store = useGameStore()
  const game = store.getGame()

  // Derived state
  const isInProgress = game.phase !== 'IDLE' && game.phase !== 'SETUP'
  const currentRound = game.currentRound
  const players = game.players
  const scores = game.scores

  // Role reveal state
  const { currentPlayerIndex, currentVoterIndex, allRolesSeen, selectedCategories } =
    store.offlineState
  const currentRevealPlayer = useMemo(() => {
    return currentRound?.players[currentPlayerIndex]
  }, [currentRound, currentPlayerIndex])

  const currentVoter = useMemo(() => {
    return currentRound?.players[currentVoterIndex]
  }, [currentRound, currentVoterIndex])

  // Voting state
  const hasVoted = (playerId: string) => {
    return currentRound?.votes[playerId] !== undefined
  }

  const allPlayersVoted = useMemo(() => {
    if (!currentRound) return false
    return currentRound.players.every((p) => hasVoted(p.id))
  }, [currentRound])

  return {
    // State
    game,
    phase: game.phase,
    players,
    scores,
    currentRound,
    lastResult: store.lastResult,
    
    // Role reveal state
    currentRevealPlayer,
    currentPlayerIndex,
    allRolesSeen,
    selectedCategories,
    
    // Voting state
    currentVoter,
    currentVoterIndex,
    hasVoted,
    allPlayersVoted,
    
    // Derived
    isInProgress,
    
    // Actions
    initializeOfflineGame: store.initializeOfflineGame,
    setSelectedCategories: store.setSelectedCategories,
    startRound: store.startRound,
    advanceToNextPlayer: store.advanceToNextPlayer,
    completeRoleReveal: store.completeRoleReveal,
    beginDiscussion: store.beginDiscussion,
    beginVoting: store.beginVoting,
    castVote: store.castVote,
    advanceToNextVoter: store.advanceToNextVoter,
    finishVoting: store.finishVoting,
    nextRound: store.nextRound,
    resetGame: store.resetGame,
  }
}
