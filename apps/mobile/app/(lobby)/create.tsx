import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'

export default function CreateLobbyScreen() {
  const router = useRouter()

  async function handleCreate() {
    const { data, error } = await supabase.rpc('create_lobby')
    if (error || !data) return
    router.push(`/(lobby)/${data.code}`)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Host a Game</Text>
      <Pressable style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Create Lobby</Text>
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
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#f1f5f9',
    fontFamily: 'serif',
  },
  button: {
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})
