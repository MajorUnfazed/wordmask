import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { RoleCardNative } from '../../components/RoleCard.native'

export default function RoleRevealScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Press and hold to reveal your role</Text>

      <RoleCardNative
        playerName="Player"
        role="CREWMATE"
        word="Pizza"
        hint="Italian baked dish"
      />

      <Pressable style={styles.next} onPress={() => router.push('/(game)/discussion')}>
        <Text style={styles.nextText}>Next Player →</Text>
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
  instruction: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
  next: {
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})
