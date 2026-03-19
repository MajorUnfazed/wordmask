import { motion, AnimatePresence } from 'framer-motion'
import type { LobbyPlayer } from '../../store/lobbyStore'

interface PlayerListProps {
  players: LobbyPlayer[]
  localPlayerId: string
  canModerate?: boolean
  onRemove?: (playerId: string) => void
}

export function PlayerList({
  players,
  localPlayerId,
  canModerate = false,
  onRemove,
}: PlayerListProps) {
  function getPresenceLabel(player: LobbyPlayer) {
    switch (player.presenceStatus) {
      case 'away':
        return { label: 'Away', color: '#fca5a5', background: 'rgba(239,68,68,0.16)' }
      case 'reconnecting':
        return { label: 'Reconnecting', color: '#fde68a', background: 'rgba(234,179,8,0.16)' }
      default:
        return { label: 'Active', color: '#86efac', background: 'rgba(34,197,94,0.16)' }
    }
  }

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
              <span
                className="px-2 py-0.5 rounded-full"
                style={{
                  background: player.isReady ? 'rgba(34,197,94,0.16)' : 'rgba(148,163,184,0.14)',
                  color: player.isReady ? '#86efac' : 'var(--color-text-muted)',
                }}
              >
                {player.isReady ? 'Ready' : 'Not Ready'}
              </span>
              <span
                className="px-2 py-0.5 rounded-full"
                style={{
                  background: getPresenceLabel(player).background,
                  color: getPresenceLabel(player).color,
                }}
              >
                {getPresenceLabel(player).label}
              </span>
              {canModerate && player.id !== localPlayerId && !player.isHost && onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(player.id)}
                  className="rounded-full border border-red-400/30 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-200 transition hover:bg-red-500/15"
                >
                  Remove
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
