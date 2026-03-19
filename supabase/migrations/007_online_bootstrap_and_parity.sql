-- Migration: 007_online_bootstrap_and_parity
-- Adds an authoritative online bootstrap contract, schema versioning,
-- source category tracking, and room repair helpers.
-- Depends on: 001_lobbies, 002_players, 003_rounds, 004_votes, 005_online_phase4, 006_social_polish

alter table rounds
  add column if not exists source_categories text[] not null default array['Everyday']::text[];

create or replace function get_online_schema_version()
returns integer
language sql
security definer
stable
as $$
  select 7;
$$;

create or replace function repair_lobby_presence(p_lobby_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_code text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from lobbies
    where id = p_lobby_id and host_id = auth.uid()
  ) then
    raise exception 'Only the host can repair lobby presence';
  end if;

  perform normalize_lobby_presence(p_lobby_id);

  select code
  into v_code
  from lobbies
  where id = p_lobby_id
  limit 1;

  return get_lobby_state(v_code);
end;
$$;

create or replace function get_lobby_state(p_code text)
returns json
language plpgsql
security definer
as $$
declare
  v_lobby lobbies;
begin
  select *
  into v_lobby
  from lobbies
  where upper(trim(code)) = upper(trim(p_code))
  limit 1;

  if v_lobby.id is null then
    return null;
  end if;

  perform normalize_lobby_presence(v_lobby.id);

  select *
  into v_lobby
  from lobbies
  where id = v_lobby.id;

  return (
    with latest_round as (
      select r.*
      from rounds r
      where r.lobby_id = v_lobby.id
        and (r.ended_at is null or r.phase = 'results')
      order by
        case when r.ended_at is null then 0 else 1 end asc,
        r.started_at desc
      limit 1
    ),
    active_players as (
      select
        ar.id as round_id,
        p.id as player_id
      from latest_round ar
      join players p on p.lobby_id = ar.lobby_id
      where p.presence_status <> 'away'
    ),
    ready_progress as (
      select
        ap.round_id,
        count(*)::int as ready_to_discuss_total,
        count(*) filter (
          where rps.ready_to_discuss_at is not null
        )::int as ready_to_discuss_count
      from active_players ap
      left join round_player_states rps
        on rps.round_id = ap.round_id and rps.player_id = ap.player_id
      group by ap.round_id
    ),
    vote_progress as (
      select
        ap.round_id,
        count(distinct ap.player_id)::int as eligible_votes,
        count(distinct v.voter_id)::int as submitted_votes
      from active_players ap
      left join votes v
        on v.round_id = ap.round_id and v.voter_id = ap.player_id
      group by ap.round_id
    )
    select json_build_object(
      'schema_version', get_online_schema_version(),
      'lobby_id', v_lobby.id,
      'code', trim(v_lobby.code),
      'status', v_lobby.status,
      'host_player_id', (
        select p.id
        from players p
        where p.lobby_id = v_lobby.id and p.is_host = true
        order by p.joined_at asc
        limit 1
      ),
      'selected_categories', coalesce(to_json(get_lobby_categories(v_lobby.id)), '["Everyday"]'::json),
      'players', coalesce((
        select json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'is_host', p.is_host,
            'is_ready', p.is_ready,
            'presence_status', p.presence_status,
            'last_seen_at', p.last_seen_at,
            'score', p.score
          )
          order by p.joined_at asc
        )
        from players p
        where p.lobby_id = v_lobby.id
      ), '[]'::json),
      'events', coalesce((
        select json_agg(
          json_build_object(
            'id', le.id,
            'type', le.type,
            'actor_name', le.actor_name,
            'target_name', le.target_name,
            'created_at', le.created_at,
            'message', le.message
          )
          order by le.created_at desc
        )
        from (
          select *
          from lobby_events
          where lobby_id = v_lobby.id
          order by created_at desc
          limit 20
        ) le
      ), '[]'::json),
      'current_round', (
        select case
          when ar.id is null then null
          else json_build_object(
            'id', ar.id,
            'round_number', ar.round_number,
            'phase', ar.phase,
            'pack_id', ar.pack_id,
            'source_categories', to_json(ar.source_categories),
            'started_at', ar.started_at,
            'discussion_duration', 60,
            'ready_to_discuss_count', coalesce(rdp.ready_to_discuss_count, 0),
            'ready_to_discuss_total', coalesce(rdp.ready_to_discuss_total, 0),
            'vote_progress', case
              when ar.phase in ('voting', 'results') then json_build_object(
                'submitted', coalesce(vp.submitted_votes, 0),
                'total', coalesce(vp.eligible_votes, 0)
              )
              else null
            end
          )
        end
        from latest_round ar
        left join ready_progress rdp on rdp.round_id = ar.id
        left join vote_progress vp on vp.round_id = ar.id
        limit 1
      )
    )
  );
end;
$$;

create or replace function get_online_bootstrap(p_code text default null)
returns json
language plpgsql
security definer
as $$
declare
  v_code text := nullif(trim(coalesce(p_code, '')), '');
  v_lobby json;
begin
  if v_code is null and auth.uid() is not null then
    select l.code
    into v_code
    from lobbies l
    join players p on p.lobby_id = l.id
    where p.user_id = auth.uid()
    order by p.joined_at desc
    limit 1;
  end if;

  if v_code is not null then
    v_lobby := get_lobby_state(v_code);
  end if;

  return json_build_object(
    'schema_version', get_online_schema_version(),
    'capabilities', json_build_object(
      'repair_lobby_presence', true,
      'source_categories', true,
      'mobile_full_gameplay', true,
      'start_next_round', true
    ),
    'lobby', v_lobby
  );
end;
$$;

create or replace function start_round(
  p_lobby_id uuid,
  p_word text,
  p_hint text,
  p_pack_id text,
  p_impostor_count integer default 1
)
returns json
language plpgsql
security definer
as $$
declare
  v_round rounds;
  v_round_number int;
  v_player_count int;
  v_not_ready_count int;
  v_impostor_ids uuid[];
  v_host_name text;
  v_source_categories text[];
begin
  perform normalize_lobby_presence(p_lobby_id);

  if not exists (select 1 from lobbies where id = p_lobby_id and host_id = auth.uid()) then
    raise exception 'Only the host can start a round';
  end if;

  select count(*)
  into v_player_count
  from players
  where lobby_id = p_lobby_id
    and presence_status <> 'away';

  if v_player_count < 3 then
    raise exception 'At least 3 connected players are required';
  end if;

  select count(*)
  into v_not_ready_count
  from players
  where lobby_id = p_lobby_id
    and presence_status <> 'away'
    and is_ready = false;

  if v_not_ready_count > 0 then
    raise exception 'All connected players must be ready';
  end if;

  if p_impostor_count < 1 or p_impostor_count >= v_player_count then
    raise exception 'Invalid impostor count';
  end if;

  if exists (
    select 1
    from rounds
    where lobby_id = p_lobby_id and ended_at is null
  ) then
    raise exception 'A round is already in progress';
  end if;

  select coalesce(max(round_number), 0) + 1
  into v_round_number
  from rounds
  where lobby_id = p_lobby_id;

  select array_agg(id order by random())
  into v_impostor_ids
  from (
    select id
    from players
    where lobby_id = p_lobby_id
      and presence_status <> 'away'
    order by random()
    limit p_impostor_count
  ) selected_players;

  select get_lobby_categories(p_lobby_id)
  into v_source_categories;

  insert into rounds (
    lobby_id,
    round_number,
    word,
    hint,
    pack_id,
    source_categories,
    impostor_ids,
    phase
  )
  values (
    p_lobby_id,
    v_round_number,
    p_word,
    coalesce(p_hint, ''),
    coalesce(p_pack_id, 'everyday'),
    coalesce(v_source_categories, array['Everyday']::text[]),
    coalesce(v_impostor_ids, '{}'::uuid[]),
    'role_reveal'
  )
  returning * into v_round;

  insert into round_player_states (round_id, player_id)
  select v_round.id, p.id
  from players p
  where p.lobby_id = p_lobby_id
    and p.presence_status <> 'away'
  on conflict (round_id, player_id) do nothing;

  update lobbies
  set status = 'playing'
  where id = p_lobby_id;

  select name
  into v_host_name
  from players
  where lobby_id = p_lobby_id and user_id = auth.uid()
  limit 1;

  perform add_lobby_event(
    p_lobby_id,
    'round_started',
    v_host_name,
    null,
    v_host_name || ' started round ' || v_round.round_number || '.'
  );

  return json_build_object(
    'round', json_build_object(
      'id', v_round.id,
      'round_number', v_round.round_number,
      'phase', v_round.phase,
      'pack_id', v_round.pack_id,
      'source_categories', to_json(v_round.source_categories),
      'started_at', v_round.started_at,
      'discussion_duration', 60,
      'ready_to_discuss_count', 0,
      'ready_to_discuss_total', (
        select count(*)::int
        from players
        where lobby_id = p_lobby_id and presence_status <> 'away'
      ),
      'vote_progress', null
    )
  );
end;
$$;

create or replace function start_next_round(
  p_lobby_id uuid,
  p_word text,
  p_hint text,
  p_pack_id text,
  p_impostor_count integer default 1
)
returns json
language sql
security definer
as $$
  select start_round(
    p_lobby_id,
    p_word,
    p_hint,
    p_pack_id,
    p_impostor_count
  );
$$;
