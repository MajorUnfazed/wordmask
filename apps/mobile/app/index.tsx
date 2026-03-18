import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import Animated, { FadeInDown } from 'react-native-reanimated'

export default function HomeScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(800)} style={styles.hero}>
        <Text style={styles.title}>Impostor{'\n'}Words</Text>
        <Text style={styles.subtitle}>The social deduction word game</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.actions}>
        <Pressable
          style={styles.button}
          onPress={() => router.push('/(game)/offline-setup')}
        >
          <Text style={styles.buttonText}>Play Local</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push('/(lobby)/create')}
        >
          <Text style={styles.secondaryButtonText}>Host Online</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push('/(lobby)/join')}
        >
          <Text style={styles.secondaryButtonText}>Join Online</Text>
        </Pressable>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
    paddingHorizontal: 24,
    backgroundColor: '#0A0A14',
  },
  hero: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontFamily: 'serif',
    fontSize: 52,
    fontWeight: '900',
    color: '#a855f7',
    textAlign: 'center',
    lineHeight: 60,
    textShadowColor: 'rgba(124,58,237,0.6)',
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  button: {
    backgroundColor: '#7c3aed',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#7c3aed',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
  },
})
