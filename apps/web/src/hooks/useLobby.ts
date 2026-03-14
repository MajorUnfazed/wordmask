import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLobbyStore } from '../store/lobbyStore'
import type { LobbyPlayer } from '../store/lobbyStore'

/**
 * Manages the full lifecycle of a lobby:
 * subscribe, presence, start-game event routing.
 */
export function useLobby(code: string) {
  const { players, localPlayerId, setPlayers, setCode } = useLobbyStore()
  const navigate = useNavigate()

  const isHost =
    !!localPlayerId &&
    players.find((p) => p.id === localPlayerId)?.isHost === true

  useEffect(() => {
    if (!code) return
    setCode(code)

    const channel = supabase
      .channel(`lobby:${code}`)
      .on('broadcast', { event: 'player_join' }, ({ payload }) => {
        setPlayers(payload.players as LobbyPlayer[])
      })
      .on('broadcast', { event: 'round_start' }, () => {
        navigate('/online/role-reveal')
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [code, navigate, setCode, setPlayers])

  const startGame = useCallback(async () => {
    await supabase.rpc('start_round', { lobby_code: code })
  }, [code])

  return { players, localPlayerId, isHost, startGame }
}
