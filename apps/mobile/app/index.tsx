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
          <Text style={styles.buttonText}>Play</Text>
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
})
