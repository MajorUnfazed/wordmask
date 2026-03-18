import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = (process.env['EXPO_PUBLIC_SUPABASE_URL'] ?? '').trim()
const supabaseAnonKey = (process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'] ?? '').trim()

let supabaseClient: SupabaseClient | null = null

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseClient
}

export function requireSupabaseClient(): SupabaseClient {
  const client = getSupabaseClient()

  if (!client) {
    throw new Error(
      'Online play is unavailable because EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY is missing.',
    )
  }

  return client
}

export async function ensureAnonymousSession(): Promise<SupabaseClient> {
  const client = requireSupabaseClient()
  const {
    data: { session },
    error: sessionError,
  } = await client.auth.getSession()

  if (sessionError) {
    throw sessionError
  }

  if (session) {
    return client
  }

  const { error } = await client.auth.signInAnonymously()

  if (error) {
    throw error
  }

  return client
}
