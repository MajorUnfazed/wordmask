/**
 * authorize.test.ts — regression tests for the voice-token authorization logic (audit finding C2).
 *
 * These lock in the security contract of the rewritten voice-token function: a LiveKit grant is
 * minted ONLY for an authenticated user proven to be a member of the requested lobby, and the
 * LiveKit identity is DERIVED from the verified user id — never taken from client input. The
 * original endpoint trusted `?identity=` and `?room=` blindly, letting anyone mint a token to join
 * any room as anyone (impersonation + eavesdropping).
 *
 * Pure logic, no remote imports — run with plain node (v22+ strips the TS types):
 *   node --test supabase/functions/voice-token/authorize.test.ts
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  parseBearerToken,
  normalizeRoomCode,
  resolveVoiceGrant,
  resolveAllowedOrigin,
  parseAllowedOrigins,
} from './authorize.ts'

const USER = 'user-123'
const member = { playerName: 'Alice' }

test('parseBearerToken extracts the credential (case-insensitive), else null', () => {
  assert.equal(parseBearerToken('Bearer abc.def.ghi'), 'abc.def.ghi')
  assert.equal(parseBearerToken('bearer   spaced.token  '), 'spaced.token')
  assert.equal(parseBearerToken('BEARER x'), 'x')
  assert.equal(parseBearerToken(null), null)
  assert.equal(parseBearerToken(undefined), null)
  assert.equal(parseBearerToken(''), null)
  assert.equal(parseBearerToken('Basic abc'), null)
  assert.equal(parseBearerToken('Bearer'), null)
  assert.equal(parseBearerToken('Bearer    '), null)
})

test('normalizeRoomCode accepts only a 6-char [A-Z0-9] code (uppercased), else empty', () => {
  assert.equal(normalizeRoomCode('abc123'), 'ABC123')
  assert.equal(normalizeRoomCode('  Abc123 '), 'ABC123')
  assert.equal(normalizeRoomCode('ABCDEF'), 'ABCDEF')
  assert.equal(normalizeRoomCode('abc'), '') // too short
  assert.equal(normalizeRoomCode('ABCDEFG'), '') // too long
  assert.equal(normalizeRoomCode('abc-12'), '') // bad char
  assert.equal(normalizeRoomCode('ab c12'), '') // whitespace inside
  assert.equal(normalizeRoomCode(''), '')
  assert.equal(normalizeRoomCode(null), '')
  assert.equal(normalizeRoomCode(undefined), '')
  // @ts-expect-error — defends against non-string input at the boundary
  assert.equal(normalizeRoomCode(123456), '')
})

test('C2: no authenticated user → 401, regardless of room/membership', () => {
  const r = resolveVoiceGrant({ verifiedUserId: null, roomParam: 'ABC123', membership: member })
  assert.equal(r.ok, false)
  assert.equal(r.ok === false && r.status, 401)
})

test('C2: authentication is checked BEFORE the room — no user still 401 even with a bad room', () => {
  const r = resolveVoiceGrant({ verifiedUserId: null, roomParam: 'nope', membership: null })
  assert.equal(r.ok === false && r.status, 401)
})

test('C2: authenticated user but missing/invalid room → 400', () => {
  for (const roomParam of [null, undefined, '', 'abc', 'TOOLONG1']) {
    const r = resolveVoiceGrant({ verifiedUserId: USER, roomParam, membership: member })
    assert.equal(r.ok, false, `room=${String(roomParam)} should be rejected`)
    assert.equal(r.ok === false && r.status, 400)
  }
})

test('C2: authenticated user, valid room, but NOT a member → 403', () => {
  const r = resolveVoiceGrant({ verifiedUserId: USER, roomParam: 'ABC123', membership: null })
  assert.equal(r.ok, false)
  assert.equal(r.ok === false && r.status, 403)
})

test('C2: member of the lobby → grant scoped to the normalized room', () => {
  const r = resolveVoiceGrant({ verifiedUserId: USER, roomParam: 'abc123', membership: member })
  assert.equal(r.ok, true)
  if (r.ok) {
    assert.equal(r.room, 'ABC123') // normalized/uppercased
    assert.equal(r.identity, USER) // identity DERIVED from the verified user id
    assert.equal(r.displayName, 'Alice') // from the server-side player row
  }
})

test('C2 core: the LiveKit identity is the verified user id and cannot be spoofed by the client', () => {
  // The client has no way to influence identity — resolveVoiceGrant takes no client identity input;
  // whatever the caller *wanted* to be, the grant is always the server-verified user id.
  const r = resolveVoiceGrant({ verifiedUserId: 'real-server-user', roomParam: 'ROOM01', membership: { playerName: 'Bob' } })
  assert.equal(r.ok, true)
  assert.equal(r.ok && r.identity, 'real-server-user')
})

test('displayName falls back to "Player" when the stored name is blank', () => {
  const r = resolveVoiceGrant({ verifiedUserId: USER, roomParam: 'ABC123', membership: { playerName: '   ' } })
  assert.equal(r.ok && r.displayName, 'Player')
})

test('resolveAllowedOrigin: empty allowlist is permissive (JWT+membership is the boundary)', () => {
  assert.equal(resolveAllowedOrigin('https://app.example', []), 'https://app.example')
  assert.equal(resolveAllowedOrigin('', []), '*')
  assert.equal(resolveAllowedOrigin(null, []), '*')
})

test('resolveAllowedOrigin: non-empty allowlist reflects only listed origins', () => {
  const allow = ['https://app.example', 'https://staging.example']
  assert.equal(resolveAllowedOrigin('https://app.example', allow), 'https://app.example')
  assert.equal(resolveAllowedOrigin('https://evil.example', allow), null)
  assert.equal(resolveAllowedOrigin(null, allow), null)
  assert.equal(resolveAllowedOrigin('', allow), null)
})

test('parseAllowedOrigins splits, trims, and drops empties', () => {
  assert.deepEqual(parseAllowedOrigins('https://a.com, https://b.com ,, https://c.com'), [
    'https://a.com',
    'https://b.com',
    'https://c.com',
  ])
  assert.deepEqual(parseAllowedOrigins(''), [])
  assert.deepEqual(parseAllowedOrigins(null), [])
  assert.deepEqual(parseAllowedOrigins(undefined), [])
})
