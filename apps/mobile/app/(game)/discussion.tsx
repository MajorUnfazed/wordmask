import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import Animated, { FadeIn } from 'react-native-reanimated'

export default function DiscussionScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
        <Text style={styles.title}>Discuss!</Text>
        <Text style={styles.subtitle}>Who is the impostor?</Text>
      </Animated.View>

      <Pressable
        style={styles.voteButton}
        onPress={() => router.push('/(game)/voting')}
      >
        <Text style={styles.voteButtonText}>Vote Now</Text>
      </Pressable>
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
  voteButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  voteButtonText: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600',
  },
})
