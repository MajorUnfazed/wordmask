import { Component, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AnimatedBackground } from './components/ui/AnimatedBackground'
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

const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
}

function renderScreen(screen: string) {
  switch (screen) {
    case 'mode':
      return <ModeSelectScreen />
    case 'setup':
      return <OfflineSetupScreen />
    case 'category':
      return <CategorySelectScreen />
    case 'round-transition':
      return <RoundTransitionScreen />
    case 'role-reveal':
      return <RoleRevealScreen />
    case 'discussion':
      return <DiscussionScreen />
    case 'voting':
      return <VotingScreen />
    case 'results':
      return <ResultsScreen />
    case 'home':
    default:
      return <HomeScreen />
  }
}

export default function App() {
  const screen = useUIStore((s) => s?.screen ?? 'home')

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen overflow-x-hidden bg-void text-white">
        <AnimatedBackground />
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              {...pageTransition}
            >
              {renderScreen(screen)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ErrorBoundary>
  )
}
