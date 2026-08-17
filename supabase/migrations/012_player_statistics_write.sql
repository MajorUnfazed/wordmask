-- Wordmask v12: server-side player-statistics writes.
--
-- Before v12, `player_statistics` was SELECT-only with no writer: every stat tile showed 0.
-- This migration adds an internal SECURITY DEFINER function `apply_round_statistics` that
-- derives each signed-in player's outcome for a resolved round purely from the durable
-- `rounds`/`votes`/`players` rows, then upserts their totals. It is invoked from the existing
-- terminal RPCs (`finish_round`, `submit_final_impostor_guess`) at the exact point a round
-- reaches its final `results` phase — never from a client-facing insert policy, so a player
-- cannot forge stat rows.
--
-- The win precedence mirrors the client (OnlineResultsScreen / lib/stats.ts):
--   jester voted out  →  final guess correct (impostor steals it)  →  impostor caught (crew)  →  impostor escaped/tie.
--
-- RPC signatures are unchanged from v11, so a v11 client still works against a v12 backend
-- (and vice versa, minus the stat pipeline). Only get_online_schema_version() bumps to 12.

-- 1. New client-parity column: highest cumulative session score.
alter table player_statistics add column if not exists best_score integer not null default 0 check (best_score >= 0);

-- 2. Internal stats writer. Derives outcomes from durable round state; kept out of the API surface.
create or replace function apply_round_statistics(p_round_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_round rounds;
  v_eliminated uuid;
  v_jester_won boolean;
  v_impostor_caught boolean;
  v_final_correct boolean;
begin
  select * into v_round from rounds where id = p_round_id;
  if v_round.id is null then return; end if;

  v_eliminated := v_round.eliminated_player_id;
  v_jester_won := v_eliminated is not null and v_eliminated = any(v_round.jester_ids);
  v_impostor_caught := v_eliminated is not null and v_eliminated = any(v_round.impostor_ids);
  v_final_correct := coalesce(v_round.final_guess_correct, false);

  -- A player_statistics row references profiles(id); make sure every signed-in player has one.
  insert into profiles (id, display_name)
  select p.user_id, left(coalesce(nullif(trim(p.name), ''), 'Player'), 32)
  from players p
  where p.lobby_id = v_round.lobby_id and p.user_id is not null
  on conflict (id) do nothing;

  with participants as (
    select
      p.id as player_id,
      p.user_id,
      p.score,
      (p.id = any(v_round.impostor_ids)) as is_impostor,
      (p.id = any(v_round.jester_ids)) as is_jester
    from players p
    where p.lobby_id = v_round.lobby_id and p.user_id is not null
  ), outcome as (
    select
      pt.player_id,
      pt.user_id,
      pt.score,
      pt.is_impostor,
      pt.is_jester,
      (not pt.is_impostor and not pt.is_jester) as is_crewmate,
      case
        when v_jester_won then (pt.player_id = v_eliminated)
        when v_impostor_caught and v_final_correct then pt.is_impostor
        when v_impostor_caught then (not pt.is_impostor and not pt.is_jester)
        else pt.is_impostor
      end as won
    from participants pt
  ), votes_agg as (
    select
      v.voter_id,
      count(*) filter (where v.target_id = any(v_round.impostor_ids)) as correct,
      count(*) filter (where v.target_id is not null and not (v.target_id = any(v_round.impostor_ids))) as incorrect
    from votes v
    where v.round_id = p_round_id
    group by v.voter_id
  )
  insert into player_statistics as ps (
    profile_id, games_played, wins, losses,
    impostor_wins, crew_wins, jester_wins,
    correct_votes, incorrect_votes, words_guessed,
    longest_win_streak, current_win_streak, best_score
  )
  select
    o.user_id,
    1,
    case when o.won then 1 else 0 end,
    case when o.won then 0 else 1 end,
    case when o.won and o.is_impostor then 1 else 0 end,
    case when o.won and o.is_crewmate then 1 else 0 end,
    case when o.won and o.is_jester then 1 else 0 end,
    case when o.is_crewmate then coalesce(va.correct, 0) else 0 end,
    case when o.is_crewmate then coalesce(va.incorrect, 0) else 0 end,
    case when o.is_impostor and v_impostor_caught and v_final_correct and o.player_id = v_eliminated then 1 else 0 end,
    case when o.won then 1 else 0 end,
    case when o.won then 1 else 0 end,
    greatest(o.score, 0)
  from outcome o
  left join votes_agg va on va.voter_id = o.player_id
  on conflict (profile_id) do update set
    games_played = ps.games_played + 1,
    wins = ps.wins + excluded.wins,
    losses = ps.losses + excluded.losses,
    impostor_wins = ps.impostor_wins + excluded.impostor_wins,
    crew_wins = ps.crew_wins + excluded.crew_wins,
    jester_wins = ps.jester_wins + excluded.jester_wins,
    correct_votes = ps.correct_votes + excluded.correct_votes,
    incorrect_votes = ps.incorrect_votes + excluded.incorrect_votes,
    words_guessed = ps.words_guessed + excluded.words_guessed,
    current_win_streak = case when excluded.wins > 0 then ps.current_win_streak + 1 else 0 end,
    longest_win_streak = greatest(ps.longest_win_streak, case when excluded.wins > 0 then ps.current_win_streak + 1 else 0 end),
    best_score = greatest(ps.best_score, excluded.best_score);
end;
$$;

-- Internal only: never grant to clients. finish_round / submit_final_impostor_guess PERFORM it as definers.
revoke all on function apply_round_statistics(uuid) from public;

-- 3. Recreate the terminal RPCs verbatim from migration 010, adding a single
--    `perform apply_round_statistics(p_round_id)` immediately before each final `results` return.

create or replace function submit_final_impostor_guess(p_round_id uuid, p_guess text)
returns json language plpgsql security definer set search_path = public as $$
declare v_round rounds; v_player_id uuid; v_correct boolean;
begin
  select * into v_round from rounds where id = p_round_id for update;
  if v_round.id is null or v_round.phase <> 'final_impostor_guess' then raise exception 'No final guess is pending'; end if;
  select id into v_player_id from players where lobby_id = v_round.lobby_id and user_id = auth.uid() limit 1;
  if v_player_id is null or v_player_id <> v_round.eliminated_player_id or not (v_player_id = any(v_round.impostor_ids)) then raise exception 'Only the caught impostor can guess'; end if;
  v_correct := lower(trim(coalesce(p_guess, ''))) = lower(trim(v_round.word));
  update rounds set final_guess = jsonb_build_object('player_id', v_player_id, 'guess', trim(p_guess)), final_guess_correct = v_correct, phase = 'results', ended_at = now() where id = p_round_id;
  update lobbies set status = 'waiting' where id = v_round.lobby_id;
  perform apply_round_statistics(p_round_id);
  return json_build_object('round_id', p_round_id, 'phase', 'results', 'final_guess_correct', v_correct);
end;
$$;

create or replace function finish_round(p_round_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_round rounds; v_eliminated uuid; v_eliminated_name text; v_top_targets uuid[]; v_tie boolean := false;
  v_impostor_caught boolean := false; v_jester_caught boolean := false; v_summary json; v_impostors json;
begin
  select * into v_round from rounds where id = p_round_id for update;
  if v_round.id is null then raise exception 'Round not found'; end if;
  if not exists (select 1 from lobbies where id = v_round.lobby_id and host_id = auth.uid()) then raise exception 'Only the host can finish the round'; end if;
  if v_round.phase <> 'voting' then raise exception 'Round is not in voting phase'; end if;
  with grouped as (
    select target_id, count(*)::int as vote_count from votes where round_id = p_round_id group by target_id
  ), top_votes as (
    select target_id from grouped where vote_count = (select max(vote_count) from grouped)
  ) select array_agg(target_id order by target_id) into v_top_targets from top_votes;
  if coalesce(array_length(v_top_targets, 1), 0) = 1 then
    v_eliminated := v_top_targets[1];
  elsif coalesce(array_length(v_top_targets, 1), 0) > 1 then v_tie := true; end if;
  if v_eliminated is not null then
    select name into v_eliminated_name from players where id = v_eliminated;
    v_impostor_caught := v_eliminated = any(v_round.impostor_ids);
    v_jester_caught := v_eliminated = any(v_round.jester_ids);
  end if;
  select coalesce(json_agg(json_build_object('target_id', target_id, 'vote_count', vote_count) order by vote_count desc, target_id), '[]'::json) into v_summary from (select target_id, count(*)::int as vote_count from votes where round_id = p_round_id group by target_id) grouped;
  select coalesce(json_agg(json_build_object('id', id, 'name', name) order by joined_at), '[]'::json) into v_impostors from players where id = any(v_round.impostor_ids);
  if v_impostor_caught then
    update rounds set phase = 'final_impostor_guess', eliminated_player_id = v_eliminated where id = p_round_id;
    return json_build_object('round_id', p_round_id, 'phase', 'final_impostor_guess', 'impostors_caught', true, 'eliminated_player_id', v_eliminated, 'eliminated_player_name', v_eliminated_name, 'vote_summary', v_summary, 'is_tie', false);
  end if;
  update rounds set phase = 'results', ended_at = now(), eliminated_player_id = v_eliminated where id = p_round_id;
  update lobbies set status = 'waiting' where id = v_round.lobby_id;
  perform apply_round_statistics(p_round_id);
  return json_build_object('round_id', p_round_id, 'phase', 'results', 'word', v_round.word, 'hint', v_round.hint, 'impostors_caught', false, 'jester_won', v_jester_caught, 'impostors', v_impostors, 'eliminated_player_id', v_eliminated, 'eliminated_player_name', v_eliminated_name, 'vote_summary', v_summary, 'is_tie', v_tie);
end;
$$;

-- create or replace preserves existing grants, but re-issue them explicitly to be safe.
revoke all on function submit_final_impostor_guess(uuid, text) from public;
revoke all on function finish_round(uuid) from public;
grant execute on function submit_final_impostor_guess(uuid, text), finish_round(uuid) to authenticated;

-- 4. Advertise the new schema version.
create or replace function get_online_schema_version() returns integer language sql security definer stable as $$ select 12; $$;
