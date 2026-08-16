-- Wordmask v11: move round-word selection into the server.
--
-- Prior to v11 the host's client picked the round word and sent it to start_round, which meant
-- the host always knew the secret word. Now the host sends a *candidate pool* (an array of
-- {word, hint, category} objects — all already public in the client bundle) and the server picks
-- one at random. The chosen word is only ever revealed through get_my_role to non-impostors, so
-- the host no longer learns it in advance.
--
-- This changes the start_round / start_next_round signatures (text word/hint -> jsonb pool), so a
-- v11 client cannot talk to a pre-v11 backend. The client's schema-compatibility floor is bumped
-- to 11 to force this migration to be applied.

-- Drop the previous word-supplied signatures (both the v10 6-arg and the older 5-arg variants).
drop function if exists start_next_round(uuid, text, text, text, integer, integer);
drop function if exists start_next_round(uuid, text, text, text, integer);
drop function if exists start_round(uuid, text, text, text, integer, integer);
drop function if exists start_round(uuid, text, text, text, integer);

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
  insert into rounds (lobby_id, round_number, word, hint, pack_id, source_categories, impostor_ids, jester_ids, phase)
  values (p_lobby_id, v_round_number, v_word, v_hint, v_pack, coalesce(v_source_categories, array['Everyday']::text[]), coalesce(v_impostor_ids, '{}'::uuid[]), coalesce(v_jester_ids, '{}'::uuid[]), 'role_reveal') returning * into v_round;
  insert into lobby_word_history (lobby_id, word_key, round_id) values (p_lobby_id, v_word_key, v_round.id);
  insert into round_player_states (round_id, player_id) select v_round.id, id from players where lobby_id = p_lobby_id and presence_status <> 'away' on conflict do nothing;
  update lobbies set status = 'playing' where id = p_lobby_id;
  select name into v_host_name from players where lobby_id = p_lobby_id and user_id = auth.uid() limit 1;
  perform add_lobby_event(p_lobby_id, 'round_started', v_host_name, null, v_host_name || ' started round ' || v_round.round_number || '.');
  return json_build_object('round', json_build_object('id', v_round.id, 'round_number', v_round.round_number, 'phase', v_round.phase, 'pack_id', v_round.pack_id, 'source_categories', to_json(v_round.source_categories), 'started_at', v_round.started_at, 'discussion_duration', 60, 'ready_to_discuss_count', 0, 'ready_to_discuss_total', v_player_count, 'vote_progress', null));
end;
$$;

create or replace function start_next_round(p_lobby_id uuid, p_word_pool jsonb, p_pack_id text, p_impostor_count integer default 1, p_jester_count integer default 0)
returns json language sql security definer set search_path = public as $$ select start_round(p_lobby_id, p_word_pool, p_pack_id, p_impostor_count, p_jester_count); $$;

revoke all on function start_round(uuid, jsonb, text, integer, integer) from public;
revoke all on function start_next_round(uuid, jsonb, text, integer, integer) from public;
grant execute on function start_round(uuid, jsonb, text, integer, integer), start_next_round(uuid, jsonb, text, integer, integer) to authenticated;

create or replace function get_online_schema_version() returns integer language sql security definer stable as $$ select 11; $$;
