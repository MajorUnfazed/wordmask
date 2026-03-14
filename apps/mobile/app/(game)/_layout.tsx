import { Stack } from 'expo-router'

export default function GameLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0A14' },
        animation: 'fade',
      }}
    />
  )
}
