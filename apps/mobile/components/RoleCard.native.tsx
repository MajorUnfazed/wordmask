import { useState, useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import * as Haptics from 'expo-haptics'
import type { PlayerRole } from '@impostor/core'

interface RoleCardNativeProps {
  playerName: string
  role: PlayerRole
  word: string
  hint: string
}

/**
 * Native RoleCard — press and hold to reveal.
 * Uses Reanimated 3 rotateY + Expo Haptics.
 */
export function RoleCardNative({ playerName, role, word, hint }: RoleCardNativeProps) {
  const rotation = useSharedValue(0)
  const isImpostor = role === 'IMPOSTOR'

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotation.value}deg` }],
    opacity: rotation.value > 90 ? 0 : 1,
  }))

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotation.value + 180}deg` }],
    opacity: rotation.value > 90 ? 1 : 0,
  }))

  const gesture = Gesture.LongPress()
    .minDuration(100)
    .onBegin(() => {
      rotation.value = withTiming(180, { duration: 500 })
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    })
    .onFinalize(() => {
      rotation.value = withTiming(0, { duration: 400 })
    })

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.container}>
        {/* Card back */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.card, styles.back, frontStyle]}>
          <Text style={styles.cardBackIcon}>🂠</Text>
          <Text style={styles.cardBackLabel}>Press & hold</Text>
        </Animated.View>

        {/* Card front */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.card,
            isImpostor ? styles.frontImpostor : styles.frontCrew,
            backStyle,
          ]}
        >
          <Text style={styles.roleIcon}>{isImpostor ? '😈' : '🕵️'}</Text>
          <Text style={styles.roleName}>{isImpostor ? 'Impostor' : 'Crewmate'}</Text>
          {!isImpostor && (
            <>
              <Text style={styles.wordLabel}>The word is</Text>
              <Text style={styles.word}>{word}</Text>
              <Text style={styles.hint}>Hint: {hint}</Text>
            </>
          )}
          {isImpostor && (
            <Text style={styles.impostorText}>Blend in. Don't get caught.</Text>
          )}
        </Animated.View>
      </View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 420,
  },
  card: {
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backfaceVisibility: 'hidden',
  },
  back: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
  },
  frontCrew: {
    backgroundColor: '#0a1a2e',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.4)',
  },
  frontImpostor: {
    backgroundColor: '#1a0a2e',
    borderWidth: 1,
    borderColor: 'rgba(167,86,247,0.4)',
  },
  cardBackIcon: {
    fontSize: 72,
    color: '#a855f7',
  },
  cardBackLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  roleIcon: {
    fontSize: 52,
  },
  roleName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#f1f5f9',
    fontFamily: 'serif',
  },
  wordLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  word: {
    fontSize: 24,
    fontWeight: '800',
    color: '#a855f7',
  },
  hint: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
  },
  impostorText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
})
