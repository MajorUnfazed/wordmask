import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { AccessToken } from 'https://esm.sh/livekit-server-sdk@2.6.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.5'
import {
  parseAllowedOrigins,
  parseBearerToken,
  resolveAllowedOrigin,
  resolveVoiceGrant,
  normalizeRoomCode,
} from './authorize.ts'

// Impure Deno wiring around the pure decision logic in ./authorize.ts.
//
// SECURITY (audit finding C2): tokens are minted ONLY for an authenticated Supabase user who
// is a proven member of the requested lobby, and the LiveKit identity is derived from the
// verified user id — never from client input — so a caller cannot join arbitrary rooms or
// impersonate another player. See authorize.ts for the rationale.

function buildCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    Vary: 'Origin',
  }
  if (origin) headers['Access-Control-Allow-Origin'] = origin
  return headers
}

function json(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  const allowlist = parseAllowedOrigins(Deno.env.get('VOICE_ALLOWED_ORIGINS'))
  const allowedOrigin = resolveAllowedOrigin(req.headers.get('origin'), allowlist)
  const cors = buildCorsHeaders(allowedOrigin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  if (req.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405, cors)
  }

  try {
    const apiKey = Deno.env.get('LIVEKIT_API_KEY')
    const apiSecret = Deno.env.get('LIVEKIT_API_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!apiKey || !apiSecret) {
      return json({ error: 'LIVEKIT_API_KEY or LIVEKIT_API_SECRET not set' }, 500, cors)
    }
    if (!supabaseUrl || !anonKey || !serviceKey) {
      return json({ error: 'Supabase environment is not configured' }, 500, cors)
    }

    // 1. Verify the caller's Supabase JWT server-side. The anon apikey is a JWT with no `sub`,
    //    so getUser rejects it — only a real signed-in (incl. anonymous-auth) user resolves.
    const bearer = parseBearerToken(req.headers.get('authorization'))
    let verifiedUserId: string | null = null
    if (bearer) {
      const authClient = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const { data, error } = await authClient.auth.getUser(bearer)
      if (!error && data.user) {
        verifiedUserId = data.user.id
      }
    }

    // 2. Look up lobby membership with the service role (bypasses RLS for a trusted read).
    const url = new URL(req.url)
    const room = normalizeRoomCode(url.searchParams.get('room'))
    let membership: { playerName: string } | null = null
    if (verifiedUserId && room) {
      const admin = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const { data: rows } = await admin
        .from('players')
        .select('name, lobbies!inner(code)')
        .eq('user_id', verifiedUserId)
        .eq('lobbies.code', room)
        .limit(1)
      const row = rows?.[0] as { name?: string } | undefined
      if (row) membership = { playerName: String(row.name ?? 'Player') }
    }

    // 3. Pure decision.
    const grant = resolveVoiceGrant({ verifiedUserId, roomParam: url.searchParams.get('room'), membership })
    if (!grant.ok) {
      return json({ error: grant.error }, grant.status, cors)
    }

    // 4. Mint a room-scoped token identified by the verified user.
    const at = new AccessToken(apiKey, apiSecret, {
      identity: grant.identity,
      name: grant.displayName,
      ttl: '1h',
    })
    at.addGrant({ roomJoin: true, room: grant.room, canPublish: true, canSubscribe: true })
    const token = await at.toJwt()

    return json({ token, room: grant.room, identity: grant.identity }, 200, cors)
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : 'Token generation failed' },
      400,
      cors,
    )
  }
})
