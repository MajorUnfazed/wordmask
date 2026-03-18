import { Component, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AuroraBackground } from './components/ui/AuroraBackground'
import { useUIStore } from './store/uiStore'
import HomeScreen from './screens/HomeScreen'
import ModeSelectScreen from './screens/ModeSelectScreen'
import OfflineSetupScreen from './screens/OfflineSetupScreen'
import CategorySelectScreen from './screens/CategorySelectScreen'
import RoundTransitionScreen from './screens/RoundTransitionScreen'
import RoleRevealScreen from './screens/RoleRevealScreen'
import DiscussionScreen from './screens/DiscussionScreen'
import VotingScreen from './screens/VotingScreen'
import ResultsScreen from './screens/ResultsScreen'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  override state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  override render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, color: '#ef4444', fontFamily: 'monospace' }}>
          <h2 style={{ marginBottom: 8 }}>Runtime Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>
            {(this.state.error as Error).message}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

const pageVariants = {
  initial: (screen: string) => {
    if (screen === 'category') return { opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' }
    return { opacity: 0, scale: 0.98, filter: 'blur(8px)' }
  },
  animate: (screen: string) => ({ 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }),
  exit: (screen: string) => {
    if (screen === 'setup') return { opacity: 0, scale: 0.7, y: -50, filter: 'blur(12px)', transition: { duration: 0.5, ease: [0.32, 0, 0.67, 0] } }
    if (screen === 'voting') return { opacity: 0, scale: 1.1, filter: 'blur(10px)', transition: { duration: 0.4 } }
    return { opacity: 0, scale: 1.02, filter: 'blur(8px)', transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
  }
}

function renderScreen(screen: string) {
  switch (screen) {
    case 'mode': return <ModeSelectScreen />
    case 'setup': return <OfflineSetupScreen />
    case 'category': return <CategorySelectScreen />
    case 'round-transition': return <RoundTransitionScreen />
    case 'role-reveal': return <RoleRevealScreen />
    case 'discussion': return <DiscussionScreen />
    case 'voting': return <VotingScreen />
    case 'results': return <ResultsScreen />
    case 'home':
    default: return <HomeScreen />
  }
}

export default function App() {
  const screen = useUIStore((s) => s?.screen ?? 'home')

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen overflow-x-hidden bg-void text-white">
        <AuroraBackground />
        <div className="relative z-10 w-full min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              custom={screen}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full min-h-screen"
            >
              {renderScreen(screen)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ErrorBoundary>
  )
}
