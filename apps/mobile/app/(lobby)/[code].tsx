import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

export default function LobbyRoomScreen() {
  const { code } = useLocalSearchParams<{ code: string }>()
  const router = useRouter()

  return (
    <View style={styles.container}>
      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Room code</Text>
        <Text style={styles.code}>{code}</Text>
      </View>

      <Text style={styles.waiting}>Waiting for players…</Text>

      {/* TODO: render PlayerList from real-time lobby store */}

      <Pressable style={styles.button} onPress={() => router.push('/(game)/role-reveal')}>
        <Text style={styles.buttonText}>Start Game</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    padding: 24,
    backgroundColor: '#0A0A14',
  },
  codeCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
    gap: 6,
  },
  codeLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  code: {
    fontSize: 40,
    fontWeight: '900',
    color: '#a855f7',
    letterSpacing: 10,
    fontFamily: 'serif',
  },
  waiting: {
    color: '#475569',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})
