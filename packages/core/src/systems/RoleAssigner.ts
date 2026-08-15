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
  jesterCount = 0,
): PlayerWithRole[] {
  if (impostorCount < 1) throw new Error('impostorCount must be >= 1')
  if (jesterCount < 0) throw new Error('jesterCount must not be negative')
  const eligiblePlayers = players.filter((player) => !player.isSpectator)
  if (impostorCount + jesterCount >= eligiblePlayers.length) {
    throw new Error('Impostors and Jesters must leave at least one crewmate')
  }

  const impostorIds = new Set(pickN(eligiblePlayers, impostorCount).map((p) => p.id))
  const jesterIds = new Set(
    pickN(eligiblePlayers.filter((player) => !impostorIds.has(player.id)), jesterCount)
      .map((player) => player.id),
  )

  return players.map((p) => ({
    ...p,
    role: (impostorIds.has(p.id)
      ? 'IMPOSTOR'
      : jesterIds.has(p.id)
        ? 'JESTER'
        : 'CREWMATE') as PlayerRole,
  }))
}

export function getImpostorIds(players: PlayerWithRole[]): string[] {
  return players.filter((p) => p.role === 'IMPOSTOR').map((p) => p.id)
}

export function getJesterIds(players: PlayerWithRole[]): string[] {
  return players.filter((player) => player.role === 'JESTER').map((player) => player.id)
}
