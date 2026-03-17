import { motion } from 'framer-motion'
import { GlowButton } from '../components/ui/GlowButton'
import { useUIStore } from '../store/uiStore'

export default function HomeScreen() {
  const setScreen = useUIStore((s) => s.setScreen)

  return (
    <div className="relative flex h-screen flex-col items-center justify-center gap-10 px-6">
      <motion.div
        className="flex flex-col items-center gap-4 text-center"
        initial={{ opacity: 0, y: -40, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1
          className="font-display text-7xl font-black leading-tight tracking-wider text-accent-gradient"
          style={{ textShadow: '0 4px 24px rgba(168, 85, 247, 0.3)' }}
        >
          WordMask
        </h1>
        <p className="text-xl font-medium tracking-wide text-gradient">
          Blend in. Or get exposed.
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col gap-4 w-full max-w-sm mt-8"
        initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <GlowButton onClick={() => setScreen('mode')}>
          PLAY
        </GlowButton>
      </motion.div>
    </div>
  )
}
