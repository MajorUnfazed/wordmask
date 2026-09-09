/**
 * authorize.ts — pure, dependency-free authorization logic for the voice-token function.
 *
 * Kept free of remote imports and runtime globals so it can be unit-tested with plain
 * `node` (Node ≥ 22 strips the TS types). index.ts performs the impure work — verifying
 * the Supabase JWT and looking up lobby membership — then hands the *already-verified*
 * facts to these functions, which decide whether a LiveKit grant may be minted.
 *
 * SECURITY (audit finding C2): the original endpoint took `identity` and `room` straight
 * from the query string with no authentication, so anyone could mint a token to join any
 * room under any identity (impersonation + eavesdropping). The fix moves every trust
 * decision here:
 *   - the caller MUST present a verified user id (from a real Supabase JWT), and
 *   - the identity is DERIVED from that verified user id — never taken from the client, so
 *     a player cannot impersonate another, and
 *   - a grant is issued only for a room the user is proven to be a member of.
 */

/** Extract the bearer credential from an Authorization header, or null if absent/malformed. */
export function parseBearerToken(header: string | null | undefined): string | null {
  if (!header) return null
  const match = /^Bearer\s+(.+)$/i.exec(header.trim())
  const token = match?.[1]?.trim()
  return token ? token : null
}

/**
 * Normalize a lobby code the way the DB stores it (create_lobby uppercases a 6-char code).
 * Returns '' for anything that cannot be a valid code so callers can reject it uniformly.
 */
export function normalizeRoomCode(room: string | null | undefined): string {
  if (typeof room !== 'string') return ''
  const trimmed = room.trim().toUpperCase()
  // Lobby codes are exactly 6 chars of [A-Z0-9] (upper(substr(md5(...),1,6))).
  return /^[A-Z0-9]{6}$/.test(trimmed) ? trimmed : ''
}

export interface VoiceGrantInput {
  /** The `sub` of a *verified* Supabase JWT, or null when the JWT was missing/invalid/anonymous. */
  verifiedUserId: string | null
  /** The raw `?room=` parameter (the lobby code). */
  roomParam: string | null | undefined
  /**
   * Membership lookup result: the caller's display name if they are a member of the lobby
   * whose code equals the normalized room, or null if they are not a member (or no such lobby).
   */
  membership: { playerName: string } | null
}

export interface VoiceGrantAllowed {
  ok: true
  /** Non-spoofable LiveKit identity — the verified user id, never the client's input. */
  identity: string
  /** LiveKit display name, taken from the server-side player row (not the client). */
  displayName: string
  /** The normalized room the grant is scoped to. */
  room: string
}

export interface VoiceGrantDenied {
  ok: false
  status: number
  error: string
}

export type VoiceGrantResult = VoiceGrantAllowed | VoiceGrantDenied

/**
 * Decide whether to mint a LiveKit token from already-verified inputs. Pure: no I/O.
 *
 * Order of checks matters for the returned status code:
 *   401 when the request carried no valid authenticated user,
 *   400 when the room code is missing/malformed,
 *   403 when the verified user is not a member of that lobby,
 *   otherwise a grant scoped to the room, identified by the verified user id.
 */
export function resolveVoiceGrant(input: VoiceGrantInput): VoiceGrantResult {
  if (!input.verifiedUserId) {
    return { ok: false, status: 401, error: 'Authentication required' }
  }

  const room = normalizeRoomCode(input.roomParam)
  if (!room) {
    return { ok: false, status: 400, error: 'A valid room code is required' }
  }

  if (!input.membership) {
    return { ok: false, status: 403, error: 'You are not a member of this lobby' }
  }

  const displayName = input.membership.playerName.trim() || 'Player'
  return { ok: true, identity: input.verifiedUserId, displayName, room }
}

/** Resolve the CORS Access-Control-Allow-Origin value for a request origin against an allowlist.
 *
 * `allowlist` comes from the VOICE_ALLOWED_ORIGINS env (comma-separated). When it is empty the
 * origin is reflected (permissive) — acceptable because the JWT+membership check, not CORS, is
 * the security boundary; configure the allowlist in production to also get strict CORS. When the
 * allowlist is non-empty, only listed origins are reflected; others receive no ACAO header. */
export function resolveAllowedOrigin(
  requestOrigin: string | null | undefined,
  allowlist: string[],
): string | null {
  const origin = (requestOrigin ?? '').trim()
  if (allowlist.length === 0) return origin || '*'
  if (!origin) return null
  return allowlist.includes(origin) ? origin : null
}

/** Parse the VOICE_ALLOWED_ORIGINS env string into a clean allowlist. */
export function parseAllowedOrigins(raw: string | null | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}
