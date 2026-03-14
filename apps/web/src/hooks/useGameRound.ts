import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useGameStore } from '../store/gameStore'

/**
 * Subscribes to round:* realtime events for online mode.
 * Transitions game phase in response to server events.
 */
export function useGameRound(lobbyId: string) {
  const navigate = useNavigate()
  const { beginDiscussion, beginVoting, finishVoting } = useGameStore()

  useEffect(() => {
    if (!lobbyId) return

    const channel = supabase
      .channel(`round:${lobbyId}`)
      .on('broadcast', { event: 'discussion_start' }, () => {
        beginDiscussion()
        navigate('/online/discussion')
      })
      .on('broadcast', { event: 'voting_start' }, () => {
        beginVoting()
        navigate('/online/voting')
      })
      .on('broadcast', { event: 'results_ready' }, () => {
        finishVoting()
        navigate('/online/results')
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [lobbyId, navigate, beginDiscussion, beginVoting, finishVoting])
}
