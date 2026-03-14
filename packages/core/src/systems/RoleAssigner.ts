/**
 * RoleAssigner — assigns IMPOSTOR / CREWMATE roles to players for a round.
 *
 * Inputs:  players[] and impostorCount
 * Outputs: PlayerWithRole[] with randomly assigned roles
 * Edge cases:
 *   - impostorCount must be >= 1
 *   - impostorCount must be < players.length (game needs at least one crewmate)
 */
import type { Player, PlayerWithRole, PlayerRole } from '../types/game'
import { pickN } from '../utils/random'

export function assignRoles(
  players: Player[],
  impostorCount: number,
): PlayerWithRole[] {
  if (impostorCount < 1) throw new Error('impostorCount must be >= 1')
  if (impostorCount >= players.length) {
    throw new Error('impostorCount must be less than player count')
  }

  const impostorIds = new Set(pickN(players, impostorCount).map((p) => p.id))

  return players.map((p) => ({
    ...p,
    role: (impostorIds.has(p.id) ? 'IMPOSTOR' : 'CREWMATE') as PlayerRole,
  }))
}

export function getImpostorIds(players: PlayerWithRole[]): string[] {
  return players.filter((p) => p.role === 'IMPOSTOR').map((p) => p.id)
}
