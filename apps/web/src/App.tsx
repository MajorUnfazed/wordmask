import { Component, type ReactNode } from 'react'
import { motion } from 'framer-motion'
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
          <motion.div
            key={screen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full min-h-screen"
          >
            {renderScreen(screen)}
          </motion.div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
