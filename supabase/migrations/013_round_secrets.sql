-- Migration: 013_round_secrets
-- =============================================================================
-- SECURITY HARDENING. Closes the audit's Critical/High/Medium findings.
--
-- C1 (CRITICAL) — Secret word + role assignments were world-readable to every
--   lobby member. `rounds` has an RLS SELECT policy that grants row visibility to
--   all members, and Postgres RLS is ROW-level, not COLUMN-level. Combined with
--   Supabase's default `GRANT ALL ... TO authenticated`, that exposed `word`,
--   `impostor_ids`, `jester_ids`, and `final_guess`:
--     - actively, via `supabase.from('rounds').select('word,impostor_ids')`, and
--     - passively, because `rounds` is in the `supabase_realtime` publication, so
--       the full changed row (secrets included) is pushed to every subscriber.
--   The `get_my_role` RPC's per-role redaction was cosmetic — the raw row was there.
--
--   Fix (correct trust boundary): the secrets move into a dedicated `round_secrets`
--   table that has RLS enabled with NO client policy AND has all privileges revoked
--   from anon/authenticated, and is never added to the realtime publication. Only
--   SECURITY DEFINER RPCs (which run as the table owner) can read/write it. The
--   secret columns are dropped from `rounds`, so the broadcastable row can no longer
--   carry them under any code path.
--
-- H1 (HIGH) — `votes_select` let any lobby member read every (voter_id, target_id)
--   during the voting phase (live vote-peeking). Restricted to the caller's own vote
--   until the round reaches `results`, at which point the full tally is visible.
--
-- H2 (HIGH) — `lobby_select using (true)` let any authenticated user enumerate all
--   lobbies (codes, host_ids, configs). Restricted to host/members/spectators, which
--   still satisfies the members-only realtime subscription; pre-join code lookup keeps
--   using the SECURITY DEFINER `get_lobby_by_code` RPC.
--
-- M1 (MEDIUM) — Legacy SECURITY DEFINER functions (migrations 001–009) lacked
--   `SET search_path`, a privilege-escalation vector. A final idempotent pass pins
--   `search_path = public` on every definer function that is still missing it.
--
-- RPC signatures and JSON shapes are UNCHANGED, so the client contract is identical;
-- only the storage location of the secrets and the row/column visibility change.
-- Because the contract is unchanged, get_online_schema_version() STAYS at 12: this is
-- a pure security refactor, and the version is a client<->backend compatibility gate,
-- not a patch-tracking mechanism. Bumping it would force an otherwise-unnecessary
-- coordinated client redeploy. The fix is enforced by applying this migration, full stop.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Part A — C1: relocate round secrets behind a definer-only table.
-- -----------------------------------------------------------------------------

create table if not exists round_secrets (
  round_id     uuid primary key references rounds(id) on delete cascade,
  word         text not null,
  hint         text not null default '',
  impostor_ids uuid[] not null default '{}',
  jester_ids   uuid[] not null default '{}',
  final_guess  jsonb
);

-- RLS on with NO policy => anon/authenticated match no rows. The REVOKE is the
-- stronger, defense-in-depth guarantee: Realtime checks the subscribing role's
-- table privilege before broadcasting, and PostgREST refuses to expose a table the
-- role cannot select. SECURITY DEFINER functions run as the owner and are unaffected.
-- (Supabase's ALTER DEFAULT PRIVILEGES auto-grants new tables to authenticated, so
-- this revoke is required to undo that grant — it is not redundant.)
alter table round_secrets enable row level security;
revoke all on table round_secrets from anon, authenticated;

-- Preserve any secrets from rounds created before this migration, then drop the
-- columns so no realtime payload or REST select can ever carry them again.
insert into round_secrets (round_id, word, hint, impostor_ids, jester_ids, final_guess)
select id, word, hint, impostor_ids, jester_ids, final_guess
from rounds
on conflict (round_id) do nothing;

alter table rounds
  drop column if exists word,
  drop column if exists hint,
  drop column if exists impostor_ids,
  drop column if exists jester_ids,
  drop column if exists final_guess;

-- -----------------------------------------------------------------------------
-- Part B — recreate every RPC that touched the relocated columns so it reads/writes
--          `round_secrets` instead. Signatures and JSON output are unchanged.
--          (eliminated_player_id and final_guess_correct remain on `rounds` — they
--           are public results data, not secrets.)
-- -----------------------------------------------------------------------------

-- start_round: latest signature is the v11 server-side word-selection variant.
create or replace function start_round(
  p_lobby_id uuid,
  p_word_pool jsonb,
  p_pack_id text,
  p_impostor_count integer default 1,
  p_jester_count integer default 0
)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_round rounds; v_round_number integer; v_player_count integer; v_not_ready_count integer;
  v_impostor_ids uuid[]; v_jester_ids uuid[]; v_source_categories text[]; v_host_name text;
  v_default_pack text := coalesce(nullif(trim(p_pack_id), ''), 'everyday');
  v_word text; v_hint text; v_pack text; v_word_key text;
begin
  perform normalize_lobby_presence(p_lobby_id);
  if not exists (select 1 from lobbies where id = p_lobby_id and host_id = auth.uid()) then raise exception 'Only the host can start a round'; end if;
  if p_word_pool is null or jsonb_typeof(p_word_pool) <> 'array' or jsonb_array_length(p_word_pool) = 0 then raise exception 'A word pool is required'; end if;
  select count(*) into v_player_count from players where lobby_id = p_lobby_id and presence_status <> 'away';
  select count(*) into v_not_ready_count from players where lobby_id = p_lobby_id and presence_status <> 'away' and is_ready = false;
  if v_player_count < 3 then raise exception 'At least 3 connected players are required'; end if;
  if v_not_ready_count > 0 then raise exception 'All connected players must be ready'; end if;
  if p_impostor_count < 1 or p_jester_count < 0 or p_impostor_count + p_jester_count >= v_player_count then raise exception 'Invalid role counts'; end if;
  if exists (select 1 from rounds where lobby_id = p_lobby_id and ended_at is null) then raise exception 'A round is already in progress'; end if;

  -- Server-side selection: prefer words not used in the lobby's recent history, falling back to the
  -- full pool only when every candidate is recent. The host cannot influence which index is chosen.
  with candidates as (
    select
      trim(elem->>'word') as word,
      elem->>'hint' as hint,
      coalesce(nullif(trim(elem->>'category'), ''), v_default_pack) as pack,
      lower(coalesce(nullif(trim(elem->>'category'), ''), v_default_pack)) || ':' || lower(trim(elem->>'word')) as word_key
    from jsonb_array_elements(p_word_pool) as elem
    where coalesce(trim(elem->>'word'), '') <> ''
  ), recent as (
    select word_key from lobby_word_history where lobby_id = p_lobby_id order by selected_at desc limit 100
  )
  select word, coalesce(hint, ''), pack, word_key
    into v_word, v_hint, v_pack, v_word_key
  from candidates c
  order by (c.word_key in (select word_key from recent)) asc, random()
  limit 1;

  if v_word is null then raise exception 'A word pool is required'; end if;

  select coalesce(max(round_number), 0) + 1 into v_round_number from rounds where lobby_id = p_lobby_id;
  select array_agg(id) into v_impostor_ids from (select id from players where lobby_id = p_lobby_id and presence_status <> 'away' order by random() limit p_impostor_count) roles;
  select array_agg(id) into v_jester_ids from (select id from players where lobby_id = p_lobby_id and presence_status <> 'away' and not (id = any(coalesce(v_impostor_ids, '{}'::uuid[]))) order by random() limit p_jester_count) roles;
  select get_lobby_categories(p_lobby_id) into v_source_categories;

  -- Public round row (no secrets).
  insert into rounds (lobby_id, round_number, pack_id, source_categories, phase)
  values (p_lobby_id, v_round_number, v_pack, coalesce(v_source_categories, array['Everyday']::text[]), 'role_reveal')
  returning * into v_round;

  -- Secrets go to the definer-only side table.
  insert into round_secrets (round_id, word, hint, impostor_ids, jester_ids)
  values (v_round.id, v_word, v_hint, coalesce(v_impostor_ids, '{}'::uuid[]), coalesce(v_jester_ids, '{}'::uuid[]));

  insert into lobby_word_history (lobby_id, word_key, round_id) values (p_lobby_id, v_word_key, v_round.id);
  insert into round_player_states (round_id, player_id) select v_round.id, id from players where lobby_id = p_lobby_id and presence_status <> 'away' on conflict do nothing;
  update lobbies set status = 'playing' where id = p_lobby_id;
  select name into v_host_name from players where lobby_id = p_lobby_id and user_id = auth.uid() limit 1;
  perform add_lobby_event(p_lobby_id, 'round_started', v_host_name, null, v_host_name || ' started round ' || v_round.round_number || '.');
  return json_build_object('round', json_build_object('id', v_round.id, 'round_number', v_round.round_number, 'phase', v_round.phase, 'pack_id', v_round.pack_id, 'source_categories', to_json(v_round.source_categories), 'started_at', v_round.started_at, 'discussion_duration', 60, 'ready_to_discuss_count', 0, 'ready_to_discuss_total', v_player_count, 'vote_progress', null));
end;
$$;

-- get_my_role: reads the caller's role/word from round_secrets. Impostor gets the
-- hint and no word; jester and crewmates get the word.
create or replace function get_my_role(p_round_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_round rounds; v_secret round_secrets; v_player_id uuid;
begin
  select * into v_round from rounds where id = p_round_id;
  if v_round.id is null then raise exception 'Round not found'; end if;
  select * into v_secret from round_secrets where round_id = p_round_id;
  select id into v_player_id from players where lobby_id = v_round.lobby_id and user_id = auth.uid() limit 1;
  if v_player_id is null then raise exception 'Spectators cannot view private roles'; end if;
  if v_player_id = any(v_secret.impostor_ids) then return json_build_object('role', 'IMPOSTOR', 'word', null, 'hint', v_secret.hint); end if;
  if v_player_id = any(v_secret.jester_ids) then return json_build_object('role', 'JESTER', 'word', v_secret.word, 'hint', null); end if;
  return json_build_object('role', 'CREWMATE', 'word', v_secret.word, 'hint', null);
end; $$;

-- finish_round: resolves the vote, sourcing impostor/jester/word/hint from round_secrets.
create or replace function finish_round(p_round_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_round rounds; v_secret round_secrets; v_eliminated uuid; v_eliminated_name text; v_top_targets uuid[]; v_tie boolean := false;
  v_impostor_caught boolean := false; v_jester_caught boolean := false; v_summary json; v_impostors json;
begin
  select * into v_round from rounds where id = p_round_id for update;
  if v_round.id is null then raise exception 'Round not found'; end if;
  if not exists (select 1 from lobbies where id = v_round.lobby_id and host_id = auth.uid()) then raise exception 'Only the host can finish the round'; end if;
  if v_round.phase <> 'voting' then raise exception 'Round is not in voting phase'; end if;
  select * into v_secret from round_secrets where round_id = p_round_id;
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
    v_impostor_caught := v_eliminated = any(v_secret.impostor_ids);
    v_jester_caught := v_eliminated = any(v_secret.jester_ids);
  end if;
  select coalesce(json_agg(json_build_object('target_id', target_id, 'vote_count', vote_count) order by vote_count desc, target_id), '[]'::json) into v_summary from (select target_id, count(*)::int as vote_count from votes where round_id = p_round_id group by target_id) grouped;
  select coalesce(json_agg(json_build_object('id', id, 'name', name) order by joined_at), '[]'::json) into v_impostors from players where id = any(v_secret.impostor_ids);
  if v_impostor_caught then
    update rounds set phase = 'final_impostor_guess', eliminated_player_id = v_eliminated where id = p_round_id;
    return json_build_object('round_id', p_round_id, 'phase', 'final_impostor_guess', 'impostors_caught', true, 'eliminated_player_id', v_eliminated, 'eliminated_player_name', v_eliminated_name, 'vote_summary', v_summary, 'is_tie', false);
  end if;
  update rounds set phase = 'results', ended_at = now(), eliminated_player_id = v_eliminated where id = p_round_id;
  update lobbies set status = 'waiting' where id = v_round.lobby_id;
  perform apply_round_statistics(p_round_id);
  return json_build_object('round_id', p_round_id, 'phase', 'results', 'word', v_secret.word, 'hint', v_secret.hint, 'impostors_caught', false, 'jester_won', v_jester_caught, 'impostors', v_impostors, 'eliminated_player_id', v_eliminated, 'eliminated_player_name', v_eliminated_name, 'vote_summary', v_summary, 'is_tie', v_tie);
end;
$$;

-- submit_final_impostor_guess: the caught impostor guesses the word. The guess is
-- checked against round_secrets.word and stored in round_secrets.final_guess; only
-- the public boolean outcome (final_guess_correct) stays on rounds.
create or replace function submit_final_impostor_guess(p_round_id uuid, p_guess text)
returns json language plpgsql security definer set search_path = public as $$
declare v_round rounds; v_secret round_secrets; v_player_id uuid; v_correct boolean;
begin
  select * into v_round from rounds where id = p_round_id for update;
  if v_round.id is null or v_round.phase <> 'final_impostor_guess' then raise exception 'No final guess is pending'; end if;
  select * into v_secret from round_secrets where round_id = p_round_id for update;
  select id into v_player_id from players where lobby_id = v_round.lobby_id and user_id = auth.uid() limit 1;
  if v_player_id is null or v_player_id <> v_round.eliminated_player_id or not (v_player_id = any(v_secret.impostor_ids)) then raise exception 'Only the caught impostor can guess'; end if;
  v_correct := lower(trim(coalesce(p_guess, ''))) = lower(trim(v_secret.word));
  update round_secrets set final_guess = jsonb_build_object('player_id', v_player_id, 'guess', trim(p_guess)) where round_id = p_round_id;
  update rounds set final_guess_correct = v_correct, phase = 'results', ended_at = now() where id = p_round_id;
  update lobbies set status = 'waiting' where id = v_round.lobby_id;
  perform apply_round_statistics(p_round_id);
  return json_build_object('round_id', p_round_id, 'phase', 'results', 'final_guess_correct', v_correct);
end;
$$;

-- apply_round_statistics: internal stats writer. Derives impostor/jester membership
-- from round_secrets; eliminated_player_id / final_guess_correct stay on rounds.
create or replace function apply_round_statistics(p_round_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_round rounds;
  v_secret round_secrets;
  v_eliminated uuid;
  v_jester_won boolean;
  v_impostor_caught boolean;
  v_final_correct boolean;
begin
  select * into v_round from rounds where id = p_round_id;
  if v_round.id is null then return; end if;
  select * into v_secret from round_secrets where round_id = p_round_id;

  v_eliminated := v_round.eliminated_player_id;
  v_jester_won := v_eliminated is not null and v_eliminated = any(v_secret.jester_ids);
  v_impostor_caught := v_eliminated is not null and v_eliminated = any(v_secret.impostor_ids);
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
      (p.id = any(v_secret.impostor_ids)) as is_impostor,
      (p.id = any(v_secret.jester_ids)) as is_jester
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
      count(*) filter (where v.target_id = any(v_secret.impostor_ids)) as correct,
      count(*) filter (where v.target_id is not null and not (v.target_id = any(v_secret.impostor_ids))) as incorrect
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

-- get_round_result: results re-fetch path. Sources word/hint/impostors from round_secrets.
create or replace function get_round_result(p_round_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_round rounds;
  v_secret round_secrets;
  v_vote_summary json;
  v_top_targets uuid[];
  v_eliminated_player_id uuid;
  v_eliminated_player_name text;
  v_is_tie boolean := false;
  v_impostors_caught boolean := false;
  v_impostors json;
begin
  select * into v_round from rounds where id = p_round_id;
  if v_round.id is null then raise exception 'Round not found'; end if;

  if not exists (
    select 1 from players where lobby_id = v_round.lobby_id and user_id = auth.uid()
  ) then
    raise exception 'Not a member of this lobby';
  end if;

  if v_round.phase <> 'results' then
    raise exception 'Results are not ready';
  end if;

  select * into v_secret from round_secrets where round_id = p_round_id;

  select coalesce(json_agg(
    json_build_object('target_id', ranked.target_id, 'vote_count', ranked.vote_count)
    order by ranked.vote_count desc, ranked.target_id asc
  ), '[]'::json)
  into v_vote_summary
  from (
    select target_id, count(*)::int as vote_count from votes where round_id = p_round_id group by target_id
  ) ranked;

  select array_agg(top_target.target_id order by top_target.target_id asc)
  into v_top_targets
  from (
    select grouped.target_id
    from (
      select target_id, count(*)::int as vote_count from votes where round_id = p_round_id group by target_id
    ) grouped
    where grouped.vote_count = (
      select max(counts.vote_count)
      from (select count(*)::int as vote_count from votes where round_id = p_round_id group by target_id) counts
    )
  ) top_target;

  if coalesce(array_length(v_top_targets, 1), 0) = 1 then
    v_eliminated_player_id := v_top_targets[1];
  elsif coalesce(array_length(v_top_targets, 1), 0) > 1 then
    v_is_tie := true;
  end if;

  if v_eliminated_player_id is not null then
    select name into v_eliminated_player_name from players where id = v_eliminated_player_id limit 1;
    v_impostors_caught := v_eliminated_player_id = any(v_secret.impostor_ids);
  end if;

  select coalesce(json_agg(json_build_object('id', p.id, 'name', p.name) order by p.joined_at asc), '[]'::json)
  into v_impostors
  from players p
  where p.id = any(v_secret.impostor_ids);

  return json_build_object(
    'round_id', v_round.id,
    'phase', 'results',
    'word', v_secret.word,
    'hint', v_secret.hint,
    'impostors_caught', v_impostors_caught,
    'impostors', v_impostors,
    'eliminated_player_id', v_eliminated_player_id,
    'eliminated_player_name', v_eliminated_player_name,
    'vote_summary', v_vote_summary,
    'is_tie', v_is_tie
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- Part C — H1: votes are private during voting; full tally only at results.
-- -----------------------------------------------------------------------------
drop policy if exists "votes_select" on votes;
create policy "votes_select" on votes for select to authenticated
using (
  -- A player can always see their own vote.
  exists (
    select 1 from players p
    where p.id = votes.voter_id and p.user_id = auth.uid()
  )
  or
  -- Once the round is resolved, members can see the full tally.
  exists (
    select 1 from rounds r
    join players p on p.lobby_id = r.lobby_id
    where r.id = votes.round_id and p.user_id = auth.uid() and r.phase = 'results'
  )
);

-- -----------------------------------------------------------------------------
-- Part D — H2: lobbies are visible only to their host, players, and spectators.
-- -----------------------------------------------------------------------------
drop policy if exists "lobby_select" on lobbies;
create policy "lobby_select" on lobbies for select to authenticated
using (
  host_id = auth.uid()
  or exists (select 1 from players p where p.lobby_id = lobbies.id and p.user_id = auth.uid())
  or exists (select 1 from lobby_spectators s where s.lobby_id = lobbies.id and s.user_id = auth.uid())
);

-- -----------------------------------------------------------------------------
-- Part E — M1: pin search_path on every SECURITY DEFINER function still missing it.
-- -----------------------------------------------------------------------------
do $$
declare r record;
begin
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prosecdef
      and not exists (
        select 1 from unnest(coalesce(p.proconfig, '{}'::text[])) c where c like 'search_path=%'
      )
  loop
    execute format('alter function %s set search_path = public', r.sig);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- Preserve grants (create or replace keeps them, but re-assert to be safe).
-- -----------------------------------------------------------------------------
revoke all on function apply_round_statistics(uuid) from public;
revoke all on function start_round(uuid, jsonb, text, integer, integer) from public;
revoke all on function get_my_role(uuid) from public;
revoke all on function finish_round(uuid) from public;
revoke all on function submit_final_impostor_guess(uuid, text) from public;
revoke all on function get_round_result(uuid) from public;
grant execute on function
  start_round(uuid, jsonb, text, integer, integer),
  get_my_role(uuid),
  finish_round(uuid),
  submit_final_impostor_guess(uuid, text),
  get_round_result(uuid)
to authenticated;
