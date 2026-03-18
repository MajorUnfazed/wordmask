import { motion } from 'framer-motion'

interface PlayerAvatarProps {
  name: string
  emoji?: string | undefined
  color?: string | undefined
  isEliminated?: boolean
  isImpostor?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { outer: 'w-10 h-10', inner: 'text-xl' },
  md: { outer: 'w-14 h-14', inner: 'text-3xl' },
  lg: { outer: 'w-20 h-20', inner: 'text-5xl' },
}

export function PlayerAvatar({
  name,
  emoji,
  color,
  isEliminated = false,
  isImpostor = false,
  size = 'md',
}: PlayerAvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      animate={{ opacity: isEliminated ? 0.35 : 1 }}
    >
      <div
        className={`${sizes[size].outer} rounded-full flex items-center justify-center font-bold glass relative`}
        style={{
          boxShadow: isImpostor ? '0 0 16px var(--color-accent-glow)' : undefined,
          border: color ? `1px solid ${color}` : isImpostor ? '1px solid var(--color-accent)' : undefined,
          backgroundColor: color ? `${color}30` : undefined, // 30 is roughly 20% opacity in hex
        }}
      >
        <span className={`${sizes[size].inner} ${isEliminated ? 'opacity-50 grayscale' : ''}`}>
          {emoji || initials}
        </span>
        {isEliminated && (
          <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/60">
            <span className="text-danger font-black text-2xl drop-shadow-md">✕</span>
          </div>
        )}
      </div>
      <span
        className="text-sm font-medium truncate max-w-[5rem] text-center"
        style={{ color: 'var(--color-text-secondary)', textDecoration: isEliminated ? 'line-through' : undefined }}
      >
        {name}
      </span>
    </motion.div>
  )
}
