import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'

export default function VotingScreen() {
  const router = useRouter()

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Vote</Text>
      <Text style={styles.subtitle}>Who is the impostor?</Text>

      {/* TODO: render player list with vote selection from game store */}

      <Pressable style={styles.button} onPress={() => router.push('/(game)/results')}>
        <Text style={styles.buttonText}>Reveal Results</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    gap: 24,
    backgroundColor: '#0A0A14',
    minHeight: '100%',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#f1f5f9',
    fontFamily: 'serif',
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
  },
  button: {
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 20,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})
