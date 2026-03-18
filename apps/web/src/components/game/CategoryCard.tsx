import { motion } from 'framer-motion'

type CategoryCardProps = {
  emoji: string
  name: string
  wordCount: number
  selected: boolean
  index: number
  onClick: () => void
}

function getTitleStyle(name: string): {
  fontSize: string
  letterSpacing: string
  lineHeight: number
} {
  if (name.length >= 10) {
    return {
      fontSize: 'clamp(13px, 1.15vw, 16px)',
      letterSpacing: '-0.045em',
      lineHeight: 1.05,
    }
  }

  if (name.length >= 9) {
    return {
      fontSize: 'clamp(14px, 1.25vw, 17px)',
      letterSpacing: '-0.035em',
      lineHeight: 1.06,
    }
  }

  if (name.length >= 7) {
    return {
      fontSize: 'clamp(17px, 1.6vw, 22px)',
      letterSpacing: '-0.02em',
      lineHeight: 1.08,
    }
  }

  return {
    fontSize: 'clamp(20px, 2vw, 26px)',
    letterSpacing: '-0.01em',
    lineHeight: 1.1,
  }
}

export function CategoryCard({
  emoji,
  name,
  wordCount,
  selected,
  index,
  onClick,
}: CategoryCardProps) {
  const titleStyle = getTitleStyle(name)

  return (
    <motion.button
      type="button"
      className="relative overflow-visible rounded-3xl p-[1px] text-left group transition-all"
      initial={{ opacity: 0, y: 18 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: selected ? 1.02 : 1,
      }}
      whileHover={{ scale: selected ? 1.05 : 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{
        y: { delay: index * 0.03, type: 'spring', stiffness: 300, damping: 25 },
        opacity: { delay: index * 0.03 },
        scale: { type: 'spring', stiffness: 300, damping: 25 }
      }}
      onClick={onClick}
      style={{
        background: selected
          ? 'var(--color-accent)'
          : 'rgba(255,255,255,0.1)',
        boxShadow: selected
          ? '0 0 20px var(--color-accent-glow)'
          : 'none',
      }}
    >
      <div
        className="relative flex min-h-[180px] h-full flex-col rounded-[23px] p-5"
        style={{
          background: selected
            ? 'rgba(0,0,0,0.2)'
            : 'rgba(15,15,25,0.8)',
          border: selected
            ? '1px solid rgba(255,255,255,0.15)'
            : '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div
          className="absolute right-3 top-3 rounded-xl px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em]"
          style={{
            background: selected ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
            color: selected ? '#fff' : 'rgba(255,255,255,0.4)',
            border: selected ? 'none' : '1px solid transparent'
          }}
        >
          {selected ? 'LIVE' : 'ADD'}
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-between gap-5">
          <div className="flex min-h-0 flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="text-4xl leading-none">{emoji}</div>
              <div className="w-20 shrink-0" />
            </div>
            <div
              className={`mt-4 min-w-0 font-display font-bold ${selected ? 'text-white' : 'text-white/80'}`}
              style={{
                fontSize: titleStyle.fontSize,
                letterSpacing: titleStyle.letterSpacing,
                whiteSpace: name.length > 12 ? 'normal' : 'nowrap',
                overflow: 'hidden',
                textOverflow: name.length > 12 ? undefined : 'clip',
                lineHeight: titleStyle.lineHeight,
              }}
              title={name}
            >
              {name}
            </div>
          </div>

          <div className="mt-auto">
            <div className="text-xs font-semibold tracking-wide text-white/50">
              {wordCount} WORDS
            </div>
            <div className="mt-2 h-1.5 rounded-full overflow-hidden bg-white/5">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: selected ? '100%' : '42%' }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                style={{
                  background: selected
                    ? '#fff'
                    : 'rgba(255,255,255,0.15)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  )
}
