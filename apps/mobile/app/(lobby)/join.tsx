import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'

export default function JoinLobbyScreen() {
  const router = useRouter()
  const [code, setCode] = useState('')

  function handleJoin() {
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length !== 6) return
    router.push(`/(lobby)/${trimmed}`)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Game</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter code"
        placeholderTextColor="#475569"
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
        maxLength={6}
        keyboardType="default"
      />
      <Pressable style={[styles.button, code.trim().length !== 6 && styles.buttonDisabled]} onPress={handleJoin}>
        <Text style={styles.buttonText}>Join</Text>
      </Pressable>
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
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#f1f5f9',
    fontFamily: 'serif',
  },
  input: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    color: '#f1f5f9',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 8,
  },
  button: {
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 20,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})
