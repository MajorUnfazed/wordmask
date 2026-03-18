import type { ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

const variantStyles = {
  primary: {
    background: 'var(--color-accent)',
    boxShadow: '0 0 20px var(--color-accent-glow), 0 0 60px var(--color-accent-glow)',
    hover: { boxShadow: '0 0 30px var(--color-accent-glow), 0 0 80px var(--color-accent-glow)' },
  },
  secondary: {
    background: 'rgba(255,255,255,0.05)',
    boxShadow: 'none',
    hover: { boxShadow: '0 0 20px rgba(255,255,255,0.1)' },
  },
  danger: {
    background: 'var(--color-danger)',
    boxShadow: '0 0 20px var(--color-danger-glow)',
    hover: { boxShadow: '0 0 30px var(--color-danger-glow), 0 0 60px var(--color-danger-glow)' },
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
      whileHover={disabled ? {} : { scale: 1.03, ...styles.hover }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      style={{
        background: styles.background,
        boxShadow: styles.boxShadow,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      className={`w-full rounded-2xl px-6 py-4 font-display font-bold text-lg text-white tracking-wide transition-opacity ${className}`}
      disabled={disabled}
      {...(props as object)}
    >
      {children}
    </motion.button>
  )
}
