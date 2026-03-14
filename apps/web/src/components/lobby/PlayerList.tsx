import { motion, AnimatePresence } from 'framer-motion'
import type { LobbyPlayer } from '../../store/lobbyStore'

interface PlayerListProps {
  players: LobbyPlayer[]
  localPlayerId: string
}

export function PlayerList({ players, localPlayerId }: PlayerListProps) {
  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence>
        {players.map((player, i) => (
          <motion.div
            key={player.id}
            className="flex items-center justify-between px-4 py-3 rounded-xl glass"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: player.id === localPlayerId ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                }}
              >
                {player.name[0]?.toUpperCase()}
              </div>
              <span className="font-medium text-sm">
                {player.name}
                {player.id === localPlayerId && (
                  <span className="ml-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>(you)</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {player.isHost && (
                <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--color-accent-light)' }}>
                  Host
                </span>
              )}
              <span style={{ color: player.isReady ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                {player.isReady ? '●' : '○'}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
