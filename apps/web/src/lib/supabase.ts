import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env['VITE_SUPABASE_URL']?.trim() ?? ''
const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY']?.trim() ?? ''

let supabaseClient: SupabaseClient | null = null

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

function getAuthStorage() {
  if (typeof window === 'undefined') {
    return undefined
  }

  return window.sessionStorage
}

export function getSupabaseRestConfig() {
  if (!isSupabaseConfigured) {
    return null
  }

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'wordmask-supabase-auth',
        storage: getAuthStorage(),
      },
    })
  }

  return supabaseClient
}

export function requireSupabaseClient(): SupabaseClient {
  const client = getSupabaseClient()

  if (!client) {
    throw new Error(
      'Online play is unavailable because VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing.',
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
