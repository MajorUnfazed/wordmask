import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { GlassCard } from '../components/ui/GlassCard'
import { GlowButton } from '../components/ui/GlowButton'
import { LobbyCode } from '../components/lobby/LobbyCode'
import { PlayerList } from '../components/lobby/PlayerList'
import { useLobby } from '../hooks/useLobby'

export default function LobbyScreen() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { players, localPlayerId, isHost, startGame } = useLobby(code ?? '')

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 px-6 py-12">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="font-display text-3xl font-bold">Lobby</h2>
        <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Share the code with your friends
        </p>
      </motion.div>

      {code && <LobbyCode code={code} />}

      <div className="w-full max-w-md">
        <PlayerList players={players} localPlayerId={localPlayerId ?? ''} />
      </div>

      {isHost && (
        <div className="w-full max-w-md">
          <GlowButton
            onClick={startGame}
            disabled={players.length < 3}
          >
            Start Game
          </GlowButton>
        </div>
      )}

      {!isHost && (
        <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
          Waiting for host to start…
        </p>
      )}
    </div>
  )
}
