import { motion } from 'framer-motion'
import { GlassCard } from '../components/ui/GlassCard'
import { useUIStore } from '../store/uiStore'

export default function ModeSelectScreen() {
  const setScreen = useUIStore((s) => s.setScreen)

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 px-6">
      <motion.h2
        className="font-display text-3xl font-bold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Choose Mode
      </motion.h2>

      <div className="grid w-full max-w-md gap-4">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard
            onClick={() => setScreen('setup')}
            className="cursor-pointer p-6 transition-all hover:border-accent"
          >
            <div className="text-4xl mb-3">📱</div>
            <h3 className="font-display text-xl font-bold mb-1">Offline</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Pass the phone · No account needed
            </p>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard
            onClick={() => setScreen('home')}
            className="cursor-pointer p-6 transition-all hover:border-accent"
          >
            <div className="text-4xl mb-3">🌐</div>
            <h3 className="font-display text-xl font-bold mb-1">Online</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Multi-device · Real-time multiplayer
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
