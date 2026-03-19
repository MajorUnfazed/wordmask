-- Migration: 006_social_polish
-- Adds readiness, presence, lobby activity feed, and richer lobby snapshots for online multiplayer.
-- Depends on: 001_lobbies, 002_players, 003_rounds, 004_votes, 005_online_phase4

alter table players
  add column if not exists is_ready boolean not null default false,
  add column if not exists presence_status text not null default 'active',
  add column if not exists last_seen_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'players_presence_status_check'
  ) then
    alter table players
      add constraint players_presence_status_check
      check (presence_status in ('active', 'reconnecting', 'away'));
  end if;
end
$$;

create table if not exists lobby_events (
  id          uuid primary key default gen_random_uuid(),
  lobby_id    uuid not null references lobbies (id) on delete cascade,
  type        text not null,
  actor_name  text,
  target_name text,
  message     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists lobby_events_lobby_idx
  on lobby_events (lobby_id, created_at desc);

alter table lobby_events enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'lobby_events'
      and policyname = 'lobby_events_select'
  ) then
    create policy "lobby_events_select"
      on lobby_events for select
      using (
        lobby_id in (
          select p.lobby_id
          from players p
          where p.user_id = auth.uid()
        )
      );
  end if;
end
$$;

create table if not exists round_player_states (
  round_id               uuid not null references rounds (id) on delete cascade,
  player_id              uuid not null references players (id) on delete cascade,
  ready_to_discuss_at    timestamptz,
  primary key (round_id, player_id)
);

create index if not exists round_player_states_round_idx
  on round_player_states (round_id);

alter table round_player_states enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'round_player_states'
      and policyname = 'round_player_states_select'
  ) then
    create policy "round_player_states_select"
      on round_player_states for select
      using (
        round_id in (
          select r.id
          from rounds r
          join players p on p.lobby_id = r.lobby_id
          where p.user_id = auth.uid()
        )
      );
  end if;
end
$$;

create or replace function add_lobby_event(
  p_lobby_id uuid,
  p_type text,
  p_actor_name text,
  p_target_name text,
  p_message text
)
returns void
language sql
security definer
as $$
  insert into lobby_events (lobby_id, type, actor_name, target_name, message)
  values (p_lobby_id, p_type, p_actor_name, p_target_name, p_message);
$$;

create or replace function get_lobby_categories(p_lobby_id uuid)
returns text[]
language sql
security definer
stable
as $$
  select coalesce(
    array(
      select jsonb_array_elements_text(
        coalesce(l.config -> 'selected_categories', '["Everyday"]'::jsonb)
      )
    ),
    array['Everyday']::text[]
  )
  from lobbies l
  where l.id = p_lobby_id
  limit 1;
$$;

create or replace function normalize_lobby_presence(p_lobby_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_host_player players;
  v_next_host players;
begin
  update players
  set presence_status = case
    when now() - last_seen_at <= interval '12 seconds' then 'active'
    when now() - last_seen_at <= interval '45 seconds' then 'reconnecting'
    else 'away'
  end
  where lobby_id = p_lobby_id
    and presence_status is distinct from case
      when now() - last_seen_at <= interval '12 seconds' then 'active'
      when now() - last_seen_at <= interval '45 seconds' then 'reconnecting'
      else 'away'
    end;

  select *
  into v_host_player
  from players
  where lobby_id = p_lobby_id and is_host = true
  order by joined_at asc
  limit 1;

  if v_host_player.id is null or v_host_player.presence_status <> 'away' then
    return;
  end if;

  select *
  into v_next_host
  from players
  where lobby_id = p_lobby_id
    and id <> v_host_player.id
    and presence_status <> 'away'
  order by joined_at asc
  limit 1;

  if v_next_host.id is null then
    return;
  end if;

  update players
  set is_host = case when id = v_next_host.id then true else false end
  where lobby_id = p_lobby_id
    and (is_host = true or id = v_next_host.id);

  update lobbies
  set host_id = v_next_host.user_id
  where id = p_lobby_id;

  perform add_lobby_event(
    p_lobby_id,
    'host_changed',
    v_next_host.name,
    null,
    v_next_host.name || ' is now the host.'
  );
end;
$$;

create or replace function create_lobby(
  p_name text,
  p_config jsonb default '{}'::jsonb
)
returns json
language plpgsql
security definer
as $$
declare
  v_code      char(6);
  v_lobby     lobbies;
  v_player    players;
  v_attempt   int := 0;
  v_name      text := trim(coalesce(p_name, ''));
  v_config    jsonb := coalesce(p_config, '{}'::jsonb);
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if char_length(v_name) < 1 or char_length(v_name) > 32 then
    raise exception 'Display name must be between 1 and 32 characters';
  end if;

  v_config := jsonb_set(
    v_config,
    '{selected_categories}',
    coalesce(v_config -> 'selected_categories', '["Everyday"]'::jsonb),
    true
  );

  loop
    v_code := upper(substr(md5(random()::text), 1, 6));
    exit when not exists (select 1 from lobbies where code = v_code);
    v_attempt := v_attempt + 1;
    if v_attempt >= 10 then
      raise exception 'Could not generate unique lobby code';
    end if;
  end loop;

  insert into lobbies (code, host_id, config)
  values (v_code, auth.uid(), v_config)
  returning * into v_lobby;

  insert into players (lobby_id, user_id, name, is_host, is_ready, presence_status, last_seen_at)
  values (v_lobby.id, auth.uid(), v_name, true, false, 'active', now())
  returning * into v_player;

  perform add_lobby_event(
    v_lobby.id,
    'lobby_created',
    v_name,
    null,
    v_name || ' created the lobby.'
  );

  return json_build_object(
    'lobby_id', v_lobby.id,
    'code', trim(v_lobby.code),
    'player_id', v_player.id,
    'host_player_id', v_player.id
  );
end;
$$;

create or replace function join_lobby(p_lobby_id uuid, p_name text)
returns json
language plpgsql
security definer
as $$
declare
  v_player players;
  v_code   char(6);
  v_name   text := trim(coalesce(p_name, ''));
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if char_length(v_name) < 1 or char_length(v_name) > 32 then
    raise exception 'Display name must be between 1 and 32 characters';
  end if;

  perform normalize_lobby_presence(p_lobby_id);

  select code into v_code
  from lobbies
  where id = p_lobby_id and status = 'waiting'
  limit 1;

  if v_code is null then
    raise exception 'Lobby is not accepting players';
  end if;

  if exists (select 1 from players where lobby_id = p_lobby_id and user_id = auth.uid()) then
    update players
    set name = v_name,
        presence_status = 'active',
        last_seen_at = now()
    where lobby_id = p_lobby_id and user_id = auth.uid()
    returning * into v_player;

    perform add_lobby_event(
      p_lobby_id,
      'player_rejoined',
      v_name,
      null,
      v_name || ' rejoined the lobby.'
    );
  else
    insert into players (
      lobby_id,
      user_id,
      name,
      is_ready,
      presence_status,
      last_seen_at
    )
    values (p_lobby_id, auth.uid(), v_name, false, 'active', now())
    returning * into v_player;

    perform add_lobby_event(
      p_lobby_id,
      'player_joined',
      v_name,
      null,
      v_name || ' joined the lobby.'
    );
  end if;

  return json_build_object(
    'lobby_id', v_player.lobby_id,
    'code', trim(v_code),
    'player_id', v_player.id,
    'host_player_id', (
      select id
      from players
      where lobby_id = p_lobby_id and is_host = true
      order by joined_at asc
      limit 1
    )
  );
end;
$$;

create or replace function leave_lobby(p_lobby_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_player players;
  v_lobby_status text;
  v_next_host players;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select status
  into v_lobby_status
  from lobbies
  where id = p_lobby_id
  limit 1;

  if v_lobby_status is null then
    raise exception 'Lobby not found';
  end if;

  if v_lobby_status <> 'waiting' then
    raise exception 'Cannot leave a lobby while a round is in progress';
  end if;

  select *
  into v_player
  from players
  where lobby_id = p_lobby_id and user_id = auth.uid()
  limit 1;

  if v_player.id is null then
    return json_build_object('left', false);
  end if;

  delete from players
  where id = v_player.id;

  perform add_lobby_event(
    p_lobby_id,
    'player_left',
    v_player.name,
    null,
    v_player.name || ' left the lobby.'
  );

  select *
  into v_next_host
  from players
  where lobby_id = p_lobby_id
    and presence_status <> 'away'
  order by joined_at asc
  limit 1;

  if v_next_host.id is null then
    select *
    into v_next_host
    from players
    where lobby_id = p_lobby_id
    order by joined_at asc
    limit 1;
  end if;

  if v_next_host.id is null then
    delete from lobbies
    where id = p_lobby_id;

    return json_build_object(
      'left', true,
      'deleted_lobby', true,
      'host_player_id', null
    );
  end if;

  if v_player.is_host then
    update players
    set is_host = case when id = v_next_host.id then true else false end
    where lobby_id = p_lobby_id and (is_host = true or id = v_next_host.id);

    update lobbies
    set host_id = v_next_host.user_id
    where id = p_lobby_id;

    perform add_lobby_event(
      p_lobby_id,
      'host_changed',
      v_next_host.name,
      null,
      v_next_host.name || ' is now the host.'
    );

    return json_build_object(
      'left', true,
      'deleted_lobby', false,
      'host_player_id', v_next_host.id
    );
  end if;

  return json_build_object(
    'left', true,
    'deleted_lobby', false,
    'host_player_id', (
      select id
      from players
      where lobby_id = p_lobby_id and is_host = true
      order by joined_at asc
      limit 1
    )
  );
end;
$$;

create or replace function set_player_ready(p_lobby_id uuid, p_ready boolean)
returns json
language plpgsql
security definer
as $$
declare
  v_player players;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from lobbies
    where id = p_lobby_id and status = 'waiting'
  ) then
    raise exception 'Lobby is not accepting readiness changes';
  end if;

  update players
  set is_ready = p_ready,
      presence_status = 'active',
      last_seen_at = now()
  where lobby_id = p_lobby_id and user_id = auth.uid()
  returning * into v_player;

  if v_player.id is null then
    raise exception 'Not a member of this lobby';
  end if;

  perform add_lobby_event(
    p_lobby_id,
    case when p_ready then 'player_ready' else 'player_unready' end,
    v_player.name,
    null,
    v_player.name || case when p_ready then ' is ready.' else ' is not ready.' end
  );

  return json_build_object(
    'player_id', v_player.id,
    'is_ready', v_player.is_ready
  );
end;
$$;

create or replace function heartbeat_player(p_lobby_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_player players;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  update players
  set last_seen_at = now(),
      presence_status = 'active'
  where lobby_id = p_lobby_id and user_id = auth.uid()
  returning * into v_player;

  if v_player.id is null then
    raise exception 'Not a member of this lobby';
  end if;

  perform normalize_lobby_presence(p_lobby_id);

  return json_build_object(
    'player_id', v_player.id,
    'presence_status', 'active',
    'last_seen_at', now()
  );
end;
$$;

create or replace function set_lobby_categories(p_lobby_id uuid, p_categories text[])
returns json
language plpgsql
security definer
as $$
declare
  v_categories text[] := coalesce(
    (
      select array_agg(trim(value))
      from unnest(coalesce(p_categories, array[]::text[])) value
      where trim(value) <> ''
    ),
    array['Everyday']::text[]
  );
begin
  if not exists (
    select 1
    from lobbies
    where id = p_lobby_id and host_id = auth.uid() and status = 'waiting'
  ) then
    raise exception 'Only the host can change categories while the lobby is waiting';
  end if;

  update lobbies
  set config = jsonb_set(
    coalesce(config, '{}'::jsonb),
    '{selected_categories}',
    to_jsonb(v_categories),
    true
  )
  where id = p_lobby_id;

  perform add_lobby_event(
    p_lobby_id,
    'categories_changed',
    (
      select name
      from players
      where lobby_id = p_lobby_id and user_id = auth.uid()
      limit 1
    ),
    null,
    'Round categories updated.'
  );

  return json_build_object('selected_categories', v_categories);
end;
$$;

create or replace function mark_ready_to_discuss(p_round_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_round rounds;
  v_player_id uuid;
begin
  select *
  into v_round
  from rounds
  where id = p_round_id;

  if v_round.id is null then
    raise exception 'Round not found';
  end if;

  select id
  into v_player_id
  from players
  where lobby_id = v_round.lobby_id and user_id = auth.uid()
  limit 1;

  if v_player_id is null then
    raise exception 'Not a member of this lobby';
  end if;

  insert into round_player_states (round_id, player_id, ready_to_discuss_at)
  values (p_round_id, v_player_id, now())
  on conflict (round_id, player_id) do update
    set ready_to_discuss_at = coalesce(round_player_states.ready_to_discuss_at, excluded.ready_to_discuss_at);

  return json_build_object(
    'round_id', p_round_id,
    'player_id', v_player_id,
    'ready_to_discuss', true
  );
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

  insert into rounds (lobby_id, round_number, word, hint, pack_id, impostor_ids, phase)
  values (
    p_lobby_id,
    v_round_number,
    p_word,
    coalesce(p_hint, ''),
    coalesce(p_pack_id, 'everyday'),
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
    'round_id', v_round.id,
    'round_number', v_round.round_number,
    'phase', v_round.phase
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

create or replace function finish_round(p_round_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_round rounds;
  v_vote_summary json;
  v_top_targets uuid[];
  v_eliminated_player_id uuid;
  v_eliminated_player_name text;
  v_is_tie boolean := false;
  v_impostors_caught boolean := false;
  v_impostors json;
begin
  select *
  into v_round
  from rounds
  where id = p_round_id;

  if not found then
    raise exception 'Round not found';
  end if;

  if not exists (
    select 1
    from lobbies
    where id = v_round.lobby_id and host_id = auth.uid()
  ) then
    raise exception 'Only the host can finish the round';
  end if;

  if v_round.phase <> 'voting' then
    raise exception 'Round is not in voting phase';
  end if;

  select coalesce(json_agg(
    json_build_object(
      'target_id', ranked.target_id,
      'vote_count', ranked.vote_count
    )
    order by ranked.vote_count desc, ranked.target_id asc
  ), '[]'::json)
  into v_vote_summary
  from (
    select target_id, count(*)::int as vote_count
    from votes
    where round_id = p_round_id
    group by target_id
  ) ranked;

  select array_agg(top_target.target_id order by top_target.target_id asc)
  into v_top_targets
  from (
    select grouped.target_id
    from (
      select target_id, count(*)::int as vote_count
      from votes
      where round_id = p_round_id
      group by target_id
    ) grouped
    where grouped.vote_count = (
      select max(counts.vote_count)
      from (
        select count(*)::int as vote_count
        from votes
        where round_id = p_round_id
        group by target_id
      ) counts
    )
  ) top_target;

  if coalesce(array_length(v_top_targets, 1), 0) = 1 then
    v_eliminated_player_id := v_top_targets[1];
  elsif coalesce(array_length(v_top_targets, 1), 0) > 1 then
    v_is_tie := true;
  end if;

  if v_eliminated_player_id is not null then
    select name
    into v_eliminated_player_name
    from players
    where id = v_eliminated_player_id
    limit 1;

    v_impostors_caught := v_eliminated_player_id = any(v_round.impostor_ids);
  end if;

  select coalesce(json_agg(
    json_build_object(
      'id', p.id,
      'name', p.name
    )
    order by p.joined_at asc
  ), '[]'::json)
  into v_impostors
  from players p
  where p.id = any(v_round.impostor_ids);

  update rounds
  set phase = 'results',
      ended_at = now()
  where id = p_round_id;

  update lobbies
  set status = 'waiting'
  where id = v_round.lobby_id;

  perform add_lobby_event(
    v_round.lobby_id,
    'round_ended',
    (
      select name
      from players
      where lobby_id = v_round.lobby_id and user_id = auth.uid()
      limit 1
    ),
    null,
    'Round ' || v_round.round_number || ' ended.'
  );

  return json_build_object(
    'round_id', v_round.id,
    'phase', 'results',
    'word', v_round.word,
    'hint', v_round.hint,
    'impostors_caught', v_impostors_caught,
    'impostors', v_impostors,
    'eliminated_player_id', v_eliminated_player_id,
    'eliminated_player_name', v_eliminated_player_name,
    'vote_summary', v_vote_summary,
    'is_tie', v_is_tie
  );
end;
$$;
