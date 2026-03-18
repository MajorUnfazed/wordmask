import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import HomeScreen from './screens/HomeScreen'
import ModeSelectScreen from './screens/ModeSelectScreen'
import OfflineSetupScreen from './screens/OfflineSetupScreen'
import CategorySelectScreen from './screens/CategorySelectScreen'
import RoleRevealScreen from './screens/RoleRevealScreen'
import DiscussionScreen from './screens/DiscussionScreen'
import VotingScreen from './screens/VotingScreen'
import ResultsScreen from './screens/ResultsScreen'
import LobbyScreen from './screens/LobbyScreen'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: 'mode', element: <ModeSelectScreen /> },

      // Offline flow
      { path: 'offline/setup', element: <OfflineSetupScreen /> },
      { path: 'offline/category', element: <CategorySelectScreen /> },
      { path: 'offline/role-reveal', element: <RoleRevealScreen /> },
      { path: 'offline/discussion', element: <DiscussionScreen /> },
      { path: 'offline/voting', element: <VotingScreen /> },
      { path: 'offline/results', element: <ResultsScreen /> },

      // Online flow
      { path: 'lobby/:code', element: <LobbyScreen /> },
      { path: 'online/role-reveal', element: <RoleRevealScreen /> },
      { path: 'online/discussion', element: <DiscussionScreen /> },
      { path: 'online/voting', element: <VotingScreen /> },
      { path: 'online/results', element: <ResultsScreen /> },
    ],
  },
])
