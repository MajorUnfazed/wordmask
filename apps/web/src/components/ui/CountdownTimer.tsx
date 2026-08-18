import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { haptics } from '../../lib/haptics'

interface CountdownTimerProps {
  seconds: number
  onComplete?: () => void
}

export function CountdownTimer({ seconds, onComplete }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(seconds)
  const lowWarningFired = useRef(false)
  const expiryFired = useRef(false)

  useEffect(() => {
    // Warn once as time runs low (skip if the timer starts at/below the threshold).
    if (seconds > 10 && remaining === 10 && !lowWarningFired.current) {
      lowWarningFired.current = true
      haptics.medium()
    }

    if (remaining <= 0) {
      if (!expiryFired.current) {
        expiryFired.current = true
        haptics.heavy()
      }
      onComplete?.()
      return
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [remaining, seconds, onComplete])

  const pct = remaining / seconds
  const radius = 56
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - pct)
  const isLow = remaining <= 10

  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', duration: 0.6 }}
    >
      <svg width={132} height={132} className="-rotate-90">
        <circle
          cx={66}
          cy={66}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={8}
        />
        <circle
          cx={66}
          cy={66}
          r={radius}
          fill="none"
          stroke={isLow ? 'var(--color-danger)' : 'var(--color-cyan)'}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <span
        className="absolute font-display text-3xl font-bold tabular-nums"
        style={{ color: isLow ? 'var(--color-danger)' : 'var(--color-text-primary)' }}
      >
        {remaining}
      </span>
    </motion.div>
  )
}
