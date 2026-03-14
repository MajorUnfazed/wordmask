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
      className="relative overflow-visible rounded-[26px] p-[1px] text-left"
      initial={{ opacity: 0, y: 18 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: selected ? 1.05 : 1,
      }}
      whileHover={{ y: -4, scale: selected ? 1.06 : 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        delay: index * 0.04,
        type: 'spring',
        stiffness: 300,
        damping: 22,
      }}
      onClick={onClick}
      style={{
        background: selected
          ? 'linear-gradient(135deg, rgba(168,85,247,0.9), rgba(56,189,248,0.65))'
          : 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
        boxShadow: selected
          ? '0 16px 44px rgba(168,85,247,0.28)'
          : '0 14px 30px rgba(0,0,0,0.26)',
      }}
    >
      <div
        className="relative flex min-h-[178px] h-full flex-col rounded-[25px] p-5"
        style={{
          background: selected
            ? 'linear-gradient(180deg, rgba(24,18,42,0.94), rgba(19,17,32,0.96))'
            : 'linear-gradient(180deg, rgba(18,18,28,0.92), rgba(12,12,22,0.94))',
          border: selected
            ? '1px solid rgba(255,255,255,0.18)'
            : '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          className="absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{
            background: selected ? 'rgba(168,85,247,0.24)' : 'rgba(255,255,255,0.06)',
            color: selected ? '#f5d0fe' : 'var(--color-text-muted)',
          }}
        >
          {selected ? 'Live' : 'Add'}
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-between gap-5">
          <div className="flex min-h-0 flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="text-3xl leading-none">{emoji}</div>
              <div className="w-20 shrink-0" />
            </div>
            <div
              className="mt-4 min-w-0 font-display font-bold"
              style={{
                fontSize: titleStyle.fontSize,
                letterSpacing: titleStyle.letterSpacing,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'clip',
                lineHeight: titleStyle.lineHeight,
              }}
              title={name}
            >
              {name}
            </div>
          </div>

          <div className="mt-auto">
            <div
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {wordCount} words
            </div>
            <div
              className="mt-2 h-1.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.08)',
              }}
            >
              <motion.div
                className="h-full rounded-full"
                animate={{ width: selected ? '100%' : '42%' }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                style={{
                  background: selected
                    ? 'linear-gradient(90deg, rgba(192,132,252,1), rgba(96,165,250,1))'
                    : 'rgba(255,255,255,0.18)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  )
}
