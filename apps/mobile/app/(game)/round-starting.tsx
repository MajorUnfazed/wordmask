import { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { ONLINE_START_COUNTDOWN_SECONDS } from '../../lib/online'
import { useOnlineMultiplayer } from '../../hooks/useOnlineMultiplayer'

function getRemainingSeconds(startedAt: string) {
  const startedAtValue = Date.parse(startedAt)
  if (Number.isNaN(startedAtValue)) {
    return 0
  }

  const endsAt = startedAtValue + ONLINE_START_COUNTDOWN_SECONDS * 1000
  const remaining = Math.ceil((endsAt - Date.now()) / 1000)
  return Math.max(0, remaining)
}

export default function OnlineRoundStartingScreen() {
  const router = useRouter()
  const { round } = useOnlineMultiplayer()
  const [remaining, setRemaining] = useState(() =>
    round ? getRemainingSeconds(round.startedAt) : 0,
  )

  const categoryLabel = useMemo(
    () => (round?.sourceCategories.length ? round.sourceCategories.join(' • ') : ''),
    [round],
  )

  useEffect(() => {
    if (!round) {
      return
    }

    const updateRemaining = () => {
      const nextRemaining = getRemainingSeconds(round.startedAt)
      setRemaining(nextRemaining)

      if (nextRemaining <= 0) {
        router.replace('/(game)/role-reveal')
      }
    }

    updateRemaining()
    const timer = setInterval(updateRemaining, 250)

    return () => {
      clearInterval(timer)
    }
  }, [round, router])

  if (!round) {
    return (
      <View style={styles.container}>
        <Text style={styles.helper}>Loading round…</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Round {round.roundNumber}</Text>
      <Text style={styles.title}>Get Ready</Text>
      <Text style={styles.subtitle}>
        Keep your screen private when the reveal card appears.
      </Text>

      <View style={styles.countdownCircle}>
        <Text style={styles.countdownValue}>{Math.max(1, remaining || 1)}</Text>
      </View>

      <Text style={styles.helper}>Category pool: {categoryLabel || round.packId}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 24,
    backgroundColor: '#0A0A14',
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  title: {
    color: '#f8fafc',
    fontSize: 42,
    fontWeight: '900',
    fontFamily: 'serif',
  },
  subtitle: {
    color: '#94a3b8',
    textAlign: 'center',
    maxWidth: 280,
  },
  countdownCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
    backgroundColor: 'rgba(124,58,237,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownValue: {
    color: '#a855f7',
    fontSize: 72,
    fontWeight: '900',
    fontFamily: 'serif',
  },
  helper: {
    color: '#94a3b8',
    textAlign: 'center',
  },
})
