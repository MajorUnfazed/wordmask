import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

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

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"])

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      type="button"
      className="relative overflow-visible rounded-3xl p-[1px] text-left group"
      initial={{ opacity: 0, y: 18, filter: 'blur(8px)', rotateX: 0, rotateY: 0 }}
      animate={{
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
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
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        background: selected
          ? 'linear-gradient(135deg, rgba(168,85,247,0.8), rgba(56,189,248,0.5))'
          : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
        boxShadow: selected
          ? '0 12px 32px rgba(168,85,247,0.25)'
          : '0 8px 24px rgba(0,0,0,0.3)',
      }}
    >
      <div
        className="relative flex min-h-[180px] h-full flex-col rounded-[23px] p-5 backdrop-blur-[20px]"
        style={{
          background: selected
            ? 'linear-gradient(180deg, rgba(20,20,35,0.7), rgba(10,10,20,0.9))'
            : 'linear-gradient(180deg, rgba(15,15,25,0.4), rgba(5,5,15,0.6))',
          border: selected
            ? '1px solid rgba(255,255,255,0.15)'
            : '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div
          className="absolute right-3 top-3 rounded-xl px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em]"
          style={{
            background: selected ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)',
            color: selected ? '#f5d0fe' : 'rgba(255,255,255,0.4)',
            border: selected ? '1px solid rgba(168,85,247,0.3)' : '1px solid transparent'
          }}
        >
          {selected ? 'LIVE' : 'ADD'}
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-between gap-5" style={{ transform: 'translateZ(30px)' }}>
          <div className="flex min-h-0 flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="text-4xl leading-none drop-shadow-xl" style={{ transform: 'translateZ(40px)' }}>{emoji}</div>
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
                    ? 'linear-gradient(90deg, #a855f7, #38bdf8)'
                    : 'rgba(255,255,255,0.15)',
                  boxShadow: selected ? '0 0 10px rgba(168,85,247,0.5)' : 'none'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  )
}
