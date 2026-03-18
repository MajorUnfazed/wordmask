import { motion } from 'framer-motion'
import { GlassCard } from '../components/ui/GlassCard'
import { useUIStore } from '../store/uiStore'

export default function ModeSelectScreen() {
  const setScreen = useUIStore((s) => s.setScreen)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-6">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-sm uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--color-text-muted)' }}>Game Type</p>
        <h2 className="font-display text-4xl font-bold tracking-wide">
          Choose Mode
        </h2>
      </motion.div>

      <div className="grid w-full max-w-md gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <GlassCard
            onClick={() => setScreen('setup')}
            className="cursor-pointer p-6 rounded-3xl transition-all hover:bg-white/[0.04] hover:-translate-y-1"
          >
            <div className="relative z-10">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="font-display text-2xl font-bold mb-2 text-white">Pass the Phone</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Play locally with friends. Only one device is needed to play.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <GlassCard
            onClick={() => setScreen('home')}
            className="cursor-pointer p-6 rounded-3xl transition-all hover:bg-white/[0.04] hover:-translate-y-1 opacity-60"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">🌐</div>
                <div className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20 text-white/50">Coming Soon</div>
              </div>
              <h3 className="font-display text-2xl font-bold mb-2 text-white/70">Online</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Multi-device real-time multiplayer. Connect from anywhere.
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
