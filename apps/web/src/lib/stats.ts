/**
 * stats.ts — canonical player-statistics shape + pure reducer.
 *
 * This mirrors the `player_statistics` table (migration 010/012) exactly, plus one
 * client-added field: `bestScore`. The reducer `applyRoundOutcome` and the outcome
 * derivations below intentionally match the server-side `apply_round_statistics`
 * SQL so offline and online games agree on how a round affects a player's totals.
 *
 * Pure module: no React, no Zustand, no Supabase. The display selector lives in
 * `hooks/useDisplayStats.ts` to keep the store ↔ lib dependency one-directional.
 */
import type { PlayerRole, Round, RoundResult } from '@impostor/core'

export interface PlayerStats {
  gamesPlayed: number
  wins: number
  losses: number
  impostorWins: number
  crewWins: number
  jesterWins: number
  correctVotes: number
  incorrectVotes: number
  wordsGuessed: number
  longestWinStreak: number
  currentWinStreak: number
  /** Highest cumulative session score reached in a single game. Client-only field. */
  bestScore: number
}

export const EMPTY_STATS: PlayerStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  impostorWins: 0,
  crewWins: 0,
  jesterWins: 0,
  correctVotes: 0,
  incorrectVotes: 0,
  wordsGuessed: 0,
  longestWinStreak: 0,
  currentWinStreak: 0,
  bestScore: 0,
}

export interface RoundOutcome {
  role: PlayerRole
  won: boolean
  /** true = voted for an impostor, false = voted for a non-impostor, undefined = did not vote / not a crewmate */
  votedCorrectly?: boolean
  /** Caught impostor who guessed the word correctly (online final-guess only). */
  guessedWord?: boolean
  /** The local player's cumulative session score after this round. */
  sessionScore?: number
}

/**
 * Pure reducer: fold one round's outcome into a player's running totals.
 * Streaks and best-score follow the same rules as the server SQL.
 */
export function applyRoundOutcome(prev: PlayerStats, o: RoundOutcome): PlayerStats {
  const won = o.won
  const currentWinStreak = won ? prev.currentWinStreak + 1 : 0
  return {
    gamesPlayed: prev.gamesPlayed + 1,
    wins: prev.wins + (won ? 1 : 0),
    losses: prev.losses + (won ? 0 : 1),
    impostorWins: prev.impostorWins + (won && o.role === 'IMPOSTOR' ? 1 : 0),
    crewWins: prev.crewWins + (won && o.role === 'CREWMATE' ? 1 : 0),
    jesterWins: prev.jesterWins + (won && o.role === 'JESTER' ? 1 : 0),
    correctVotes: prev.correctVotes + (o.votedCorrectly === true ? 1 : 0),
    incorrectVotes: prev.incorrectVotes + (o.votedCorrectly === false ? 1 : 0),
    wordsGuessed: prev.wordsGuessed + (o.guessedWord ? 1 : 0),
    currentWinStreak,
    longestWinStreak: Math.max(prev.longestWinStreak, currentWinStreak),
    bestScore: Math.max(prev.bestScore, o.sessionScore ?? 0),
  }
}

/** Map a player's role to whether their side won, given the resolved winning side. */
function roleWon(role: PlayerRole, winningRole: RoundResult['winningRole']): boolean {
  if (role === 'IMPOSTOR') return winningRole === 'IMPOSTOR'
  if (role === 'JESTER') return winningRole === 'JESTER'
  return winningRole === 'CREW'
}

/**
 * Derive the local player's outcome for an offline STANDARD round.
 * Offline has no final-guess screen, so an impostor being caught is a crew win.
 * Returns null when there is no identified local player in the round.
 */
export function outcomeFromStandardRound(
  round: Round,
  result: RoundResult,
  localPlayerId: string | null,
  scores: Record<string, number>,
): RoundOutcome | null {
  if (!localPlayerId) return null
  const me = round.players.find((p) => p.id === localPlayerId)
  if (!me) return null

  const role = me.role
  const won = roleWon(role, result.winningRole)

  // Only crewmates cast a scored vote; leave votedCorrectly absent otherwise.
  // (exactOptionalPropertyTypes forbids assigning an explicit `undefined`.)
  const outcome: RoundOutcome = {
    role,
    won,
    guessedWord: false,
    sessionScore: scores[localPlayerId] ?? 0,
  }
  if (role === 'CREWMATE') {
    const target = round.votes[localPlayerId]
    if (target !== undefined) {
      outcome.votedCorrectly = result.impostorIds.includes(target)
    }
  }
  return outcome
}

/**
 * Derive the local player's outcome for an offline PASS_THE_PHONE round.
 * No per-player votes are recorded, and the jester never wins in this mode.
 */
export function outcomeFromPassThePhone(
  round: Round,
  impostorCaught: boolean,
  localPlayerId: string | null,
  scores: Record<string, number>,
): RoundOutcome | null {
  if (!localPlayerId) return null
  const me = round.players.find((p) => p.id === localPlayerId)
  if (!me) return null

  const role = me.role
  const won =
    role === 'IMPOSTOR' ? !impostorCaught : role === 'CREWMATE' ? impostorCaught : false

  return {
    role,
    won,
    guessedWord: false,
    sessionScore: scores[localPlayerId] ?? 0,
  }
}

/** Convert a snake_case `player_statistics` row into the client shape. */
export function mapRowToStats(row: Record<string, unknown>): PlayerStats {
  return {
    gamesPlayed: Number(row['games_played'] ?? 0),
    wins: Number(row['wins'] ?? 0),
    losses: Number(row['losses'] ?? 0),
    impostorWins: Number(row['impostor_wins'] ?? 0),
    crewWins: Number(row['crew_wins'] ?? 0),
    jesterWins: Number(row['jester_wins'] ?? 0),
    correctVotes: Number(row['correct_votes'] ?? 0),
    incorrectVotes: Number(row['incorrect_votes'] ?? 0),
    wordsGuessed: Number(row['words_guessed'] ?? 0),
    longestWinStreak: Number(row['longest_win_streak'] ?? 0),
    currentWinStreak: Number(row['current_win_streak'] ?? 0),
    bestScore: Number(row['best_score'] ?? 0),
  }
}
