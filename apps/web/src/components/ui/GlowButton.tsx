import { type ButtonHTMLAttributes, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

const variantStyles = {
  primary: {
    background: 'linear-gradient(135deg, var(--color-accent-blue) 0%, var(--color-accent-purple) 50%, var(--color-accent-magenta) 100%)',
    boxShadow: '0 8px 32px rgba(168, 85, 247, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
    border: 'none',
    color: '#ffffff',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    hover: { 
      boxShadow: '0 12px 48px rgba(168, 85, 247, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
      filter: 'brightness(1.1)' 
    },
  },
  secondary: {
    background: 'var(--color-surface)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 var(--color-border-highlight)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    textShadow: 'none',
    hover: { 
      background: 'var(--color-surface-hover)',
      boxShadow: '0 12px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)' 
    },
  },
  danger: {
    background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
    boxShadow: '0 8px 32px rgba(225, 29, 72, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
    border: 'none',
    color: '#ffffff',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    hover: { 
      boxShadow: '0 12px 48px rgba(225, 29, 72, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
      filter: 'brightness(1.1)' 
    },
  },
}

export function GlowButton({
  children,
  variant = 'primary',
  disabled,
  className = '',
  ...props
}: GlowButtonProps) {
  const styles = variantStyles[variant]
  const ref = useRef<HTMLButtonElement>(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 })
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 })

  const translateX = useTransform(mouseXSpring, [-0.5, 0.5], ["-6px", "6px"])
  const translateY = useTransform(mouseYSpring, [-0.5, 0.5], ["-6px", "6px"])

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    if (disabled || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
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
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={disabled ? {} : { scale: 1.03, ...styles.hover }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      style={{
        x: translateX,
        y: translateY,
        background: styles.background,
        boxShadow: styles.boxShadow,
        border: styles.border,
        color: styles.color,
        textShadow: styles.textShadow,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      className={`w-full rounded-[20px] px-6 py-[18px] font-display font-bold text-lg tracking-wide transition-opacity ${className}`}
      disabled={disabled}
      {...(props as object)}
    >
      {children}
    </motion.button>
  )
}
