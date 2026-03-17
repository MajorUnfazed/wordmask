import { motion } from 'framer-motion'
import { GlowButton } from '../components/ui/GlowButton'
import { ParticleField } from '../components/ui/ParticleField'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { useUIStore } from '../store/uiStore'

export default function HomeScreen() {
  const setScreen = useUIStore((s) => s.setScreen)

  return (
    <div className="relative flex h-screen flex-col items-center justify-center gap-8 px-6">
      <ParticleField />

      <div className="absolute right-5 top-5 z-20">
        <ThemeToggle />
      </div>

      <motion.div
        className="flex flex-col items-center gap-4 text-center"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1
          className="font-display text-6xl font-black leading-tight tracking-wide"
          style={{ color: 'var(--color-accent-light)', textShadow: '0 0 40px var(--color-accent-glow)' }}
        >
          WordMask
        </h1>
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Blend in. Or get exposed.
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col gap-4 w-full max-w-xs"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <GlowButton onClick={() => setScreen('mode')}>
          Play
        </GlowButton>
      </motion.div>
    </div>
  )
}

