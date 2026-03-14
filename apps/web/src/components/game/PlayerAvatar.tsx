import { motion } from 'framer-motion'

interface PlayerAvatarProps {
  name: string
  isEliminated?: boolean
  isImpostor?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { outer: 'w-10 h-10 text-sm', inner: 'text-lg' },
  md: { outer: 'w-14 h-14 text-base', inner: 'text-2xl' },
  lg: { outer: 'w-20 h-20 text-lg', inner: 'text-3xl' },
}

export function PlayerAvatar({
  name,
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
      className="flex flex-col items-center gap-1"
      animate={{ opacity: isEliminated ? 0.35 : 1 }}
    >
      <div
        className={`${sizes[size].outer} rounded-full flex items-center justify-center font-bold glass relative`}
        style={{
          boxShadow: isImpostor ? '0 0 16px var(--color-accent-glow)' : undefined,
          border: isImpostor ? '1px solid var(--color-accent)' : undefined,
          textDecoration: isEliminated ? 'line-through' : undefined,
        }}
      >
        {initials}
        {isEliminated && (
          <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50">
            ✕
          </div>
        )}
      </div>
      <span
        className="text-xs font-medium truncate max-w-16 text-center"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {name}
      </span>
    </motion.div>
  )
}
