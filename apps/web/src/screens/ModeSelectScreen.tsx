import { motion } from 'framer-motion'
import { GlassCard } from '../components/ui/GlassCard'
import { useUIStore } from '../store/uiStore'

export default function ModeSelectScreen() {
  const setScreen = useUIStore((s) => s.setScreen)

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-10 px-6">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-accent-blue mb-3">Game Type</p>
        <h2 className="font-display text-4xl font-black tracking-wide text-gradient">
          CHOOSE MODE
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
            className="glass-panel cursor-pointer p-6 rounded-3xl transition-all hover:bg-white/[0.04] hover:-translate-y-1 group relative overflow-hidden"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-accent-purple/10 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="text-4xl mb-4 drop-shadow-md">📱</div>
              <h3 className="font-display text-2xl font-bold mb-2 text-white tracking-wide">Pass the Phone</h3>
              <p className="text-sm font-medium tracking-wide text-white/50 leading-relaxed">
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
            className="glass-panel cursor-pointer p-6 rounded-3xl transition-all hover:bg-white/[0.04] hover:-translate-y-1 group relative overflow-hidden opacity-60"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-accent-blue/10 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl drop-shadow-md">🌐</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-white/20 text-white/50">Coming Soon</div>
              </div>
              <h3 className="font-display text-2xl font-bold mb-2 text-white tracking-wide">Online</h3>
              <p className="text-sm font-medium tracking-wide text-white/50 leading-relaxed">
                Multi-device real-time multiplayer. Connect from anywhere.
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
