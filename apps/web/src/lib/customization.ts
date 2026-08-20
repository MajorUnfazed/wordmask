export const PLAYER_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#0ea5e9', // Blue
  '#6366f1', // Indigo
  '#a855f7', // Purple
  '#ec4899', // Pink
]

export const PLAYER_EMOJIS = [
  '👽', '👾', '🤖', '👻', '💀', '🤡',
  '🤠', '😎', '🤓', '🥸', '🦊', '🐱',
  '🐶', '🐼', '🐸', '🐙', '🦖', '🦄',
  '🌶️', '🍕', '🍩', '🥑', '🌮', '🍔'
]

export function getRandomColor(): string {
  return PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)] ?? '#ef4444'
}

export function getRandomEmoji(): string {
  return PLAYER_EMOJIS[Math.floor(Math.random() * PLAYER_EMOJIS.length)] ?? '👽'
}

/**
 * Deterministically map a stable player id to one of PLAYER_COLORS, so every player
 * keeps a consistent chat colour across the session with no server-assigned colour.
 * System messages (no player id) fall back to a neutral grey.
 */
export function colorForPlayerId(playerId: string | null | undefined): string {
  if (!playerId) return '#8b8b9e'
  let hash = 0
  for (let index = 0; index < playerId.length; index += 1) {
    hash = (hash * 31 + playerId.charCodeAt(index)) | 0
  }
  return PLAYER_COLORS[Math.abs(hash) % PLAYER_COLORS.length] ?? '#8b8b9e'
}

/**
 * Deterministically map a stable player id to one of PLAYER_EMOJIS, giving every
 * player a consistent avatar glyph in chat with no server-assigned emoji. Uses a
 * different multiplier from colorForPlayerId so a player's emoji and colour don't
 * correlate. System messages (no player id) get a neutral speech bubble.
 */
export function emojiForPlayerId(playerId: string | null | undefined): string {
  if (!playerId) return '💬'
  let hash = 0
  for (let index = 0; index < playerId.length; index += 1) {
    hash = (hash * 33 + playerId.charCodeAt(index)) | 0
  }
  return PLAYER_EMOJIS[Math.abs(hash) % PLAYER_EMOJIS.length] ?? '👤'
}
