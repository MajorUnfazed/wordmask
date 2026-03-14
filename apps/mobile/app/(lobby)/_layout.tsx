import { Stack } from 'expo-router'

export default function LobbyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0A14' },
      }}
    />
  )
}
