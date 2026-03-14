import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import Animated, { FadeInDown } from 'react-native-reanimated'

export default function ResultsScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.content}>
        <Text style={styles.icon}>🎉</Text>
        <Text style={styles.title}>Caught!</Text>
        <Text style={styles.subtitle}>The impostor has been found</Text>
      </Animated.View>

      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={() => router.push('/(game)/offline-setup')}>
          <Text style={styles.buttonText}>Next Round</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/')}>
          <Text style={styles.secondaryButtonText}>End Game</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
    padding: 24,
    backgroundColor: '#0A0A14',
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#f1f5f9',
    fontFamily: 'serif',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  actions: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  button: {
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  secondaryButtonText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
})
