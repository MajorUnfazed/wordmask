import { View, Text, TextInput, StyleSheet, ScrollView, Pressable } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import type { Player } from '@impostor/core'

export default function OfflineSetupScreen() {
  const router = useRouter()
  const [names, setNames] = useState(['', '', '', ''])

  function updateName(i: number, value: string) {
    setNames((prev) => prev.map((n, idx) => (idx === i ? value : n)))
  }

  function handleStart() {
    const valid = names.filter((n) => n.trim().length > 0)
    if (valid.length < 3) return
    // TODO: initialise game store and navigate
    router.push('/(game)/role-reveal')
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Setup</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Players</Text>
        {names.map((name, i) => (
          <TextInput
            key={i}
            style={styles.input}
            placeholder={`Player ${i + 1}`}
            placeholderTextColor="#475569"
            value={name}
            onChangeText={(v) => updateName(i, v)}
            maxLength={20}
            autoCapitalize="words"
          />
        ))}
        {names.length < 10 && (
          <Pressable onPress={() => setNames((p) => [...p, ''])}>
            <Text style={styles.addBtn}>+ Add player</Text>
          </Pressable>
        )}
      </View>

      <Pressable
        style={[styles.button, names.filter((n) => n.trim()).length < 3 && styles.buttonDisabled]}
        onPress={handleStart}
        disabled={names.filter((n) => n.trim()).length < 3}
      >
        <Text style={styles.buttonText}>Continue →</Text>
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
    fontSize: 32,
    fontWeight: '900',
    color: '#f1f5f9',
    fontFamily: 'serif',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
    padding: 16,
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f1f5f9',
    fontSize: 15,
  },
  addBtn: {
    color: '#a855f7',
    fontSize: 13,
    marginTop: 4,
  },
  button: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#7c3aed',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
})
