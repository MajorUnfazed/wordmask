import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function getInitialTheme(): 'dark' | 'light' {
  try {
    const stored = localStorage.getItem('wordmask-theme')
    if (stored === 'light' || stored === 'dark') return stored
  } catch { /* noop */ }
  return 'dark'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('wordmask-theme', theme) } catch { /* noop */ }
  }, [theme])

  // Set initial theme attribute on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', getInitialTheme())
  }, [])

  const isDark = theme === 'dark'

  return (
    <motion.button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
      style={{
        background: 'rgba(255,255,255,0.06)',
        borderColor: 'rgba(255,255,255,0.12)',
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -30, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="text-lg"
      >
        {isDark ? '☀️' : '🌙'}
      </motion.span>
    </motion.button>
  )
}
