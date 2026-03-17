import type { ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'

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

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02, ...styles.hover }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      style={{
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
