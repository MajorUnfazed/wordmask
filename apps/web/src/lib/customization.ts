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
