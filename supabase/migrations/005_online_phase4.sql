-- Migration: 005_online_phase4
-- Updates multiplayer RPC contracts for the phase 4 online flow.
-- Depends on: 001_lobbies, 002_players, 003_rounds, 004_votes

drop function if exists create_lobby(jsonb);

create or replace function create_lobby(
  p_name text,
  p_config jsonb default '{}'::jsonb
)
returns json
language plpgsql security definer
as $$
declare
  v_code      char(6);
  v_lobby     lobbies;
  v_player    players;
  v_attempt   int := 0;
  v_name      text := trim(coalesce(p_name, ''));
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if char_length(v_name) < 1 or char_length(v_name) > 32 then
    raise exception 'Display name must be between 1 and 32 characters';
  end if;

  loop
    v_code := upper(substr(md5(random()::text), 1, 6));
    exit when not exists (select 1 from lobbies where code = v_code);
    v_attempt := v_attempt + 1;
    if v_attempt >= 10 then
      raise exception 'Could not generate unique lobby code';
    end if;
  end loop;

  insert into lobbies (code, host_id, config)
  values (v_code, auth.uid(), coalesce(p_config, '{}'::jsonb))
  returning * into v_lobby;

  insert into players (lobby_id, user_id, name, is_host)
  values (v_lobby.id, auth.uid(), v_name, true)
  returning * into v_player;

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
language plpgsql security definer
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

  select code into v_code
  from lobbies
  where id = p_lobby_id and status = 'waiting'
  limit 1;

  if v_code is null then
    raise exception 'Lobby is not accepting players';
  end if;

  if exists (select 1 from players where lobby_id = p_lobby_id and user_id = auth.uid()) then
    select * into v_player
    from players
    where lobby_id = p_lobby_id and user_id = auth.uid()
    limit 1;
  else
    insert into players (lobby_id, user_id, name)
    values (p_lobby_id, auth.uid(), v_name)
    returning * into v_player;
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
language plpgsql security definer
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

  select *
  into v_next_host
  from players
  where lobby_id = p_lobby_id
  order by joined_at asc
  limit 1;

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

create or replace function get_lobby_state(p_code text)
returns json
language sql security definer
stable
as $$
  with target_lobby as (
    select *
    from lobbies
    where upper(trim(code)) = upper(trim(p_code))
    limit 1
  ),
  latest_round as (
    select r.*
    from rounds r
    join target_lobby l on l.id = r.lobby_id
    where r.ended_at is null or r.phase = 'results'
    order by
      case when r.ended_at is null then 0 else 1 end asc,
      r.started_at desc
    limit 1
  )
  select json_build_object(
    'lobby_id', l.id,
    'code', trim(l.code),
    'status', l.status,
    'host_player_id', (
      select p.id
      from players p
      where p.lobby_id = l.id and p.is_host = true
      order by p.joined_at asc
      limit 1
    ),
    'players', coalesce((
      select json_agg(
        json_build_object(
          'id', p.id,
          'name', p.name,
          'is_host', p.is_host,
          'is_ready', true,
          'score', p.score
        )
        order by p.joined_at asc
      )
      from players p
      where p.lobby_id = l.id
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
          'discussion_duration', 60
        )
      end
      from latest_round ar
      right join target_lobby tl on true
      limit 1
    )
  )
  from target_lobby l;
$$;

create or replace function get_my_role(p_round_id uuid)
returns json
language plpgsql security definer
as $$
declare
  v_round       rounds;
  v_player_id   uuid;
  v_is_impostor boolean;
begin
  select * into v_round from rounds where id = p_round_id;
  if not found then
    raise exception 'Round not found';
  end if;

  select id into v_player_id
  from players
  where lobby_id = v_round.lobby_id and user_id = auth.uid()
  limit 1;

  if v_player_id is null then
    raise exception 'Not a member of this lobby';
  end if;

  v_is_impostor := v_player_id = any(v_round.impostor_ids);

  if v_is_impostor then
    return json_build_object(
      'role', 'IMPOSTOR',
      'word', null,
      'hint', v_round.hint
    );
  end if;

  return json_build_object(
    'role', 'CREWMATE',
    'word', v_round.word,
    'hint', null
  );
end;
$$;

drop function if exists start_round(uuid, text, text, text, uuid[]);

create or replace function start_round(
  p_lobby_id uuid,
  p_word text,
  p_hint text,
  p_pack_id text,
  p_impostor_count integer default 1
)
returns json
language plpgsql security definer
as $$
declare
  v_round rounds;
  v_round_number int;
  v_player_count int;
  v_impostor_ids uuid[];
begin
  if not exists (select 1 from lobbies where id = p_lobby_id and host_id = auth.uid()) then
    raise exception 'Only the host can start a round';
  end if;

  select count(*)
  into v_player_count
  from players
  where lobby_id = p_lobby_id;

  if v_player_count < 3 then
    raise exception 'At least 3 players are required';
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

  update lobbies
  set status = 'playing'
  where id = p_lobby_id;

  return json_build_object(
    'round_id', v_round.id,
    'round_number', v_round.round_number,
    'phase', v_round.phase
  );
end;
$$;

create or replace function set_round_phase(p_round_id uuid, p_phase text)
returns json
language plpgsql security definer
as $$
declare
  v_round rounds;
begin
  if p_phase not in ('discussion', 'voting') then
    raise exception 'Unsupported phase transition';
  end if;

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
    raise exception 'Only the host can update the round phase';
  end if;

  update rounds
  set phase = p_phase
  where id = p_round_id
  returning * into v_round;

  return json_build_object(
    'round_id', v_round.id,
    'phase', v_round.phase
  );
end;
$$;

create or replace function finish_round(p_round_id uuid)
returns json
language plpgsql security definer
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

create or replace function get_round_result(p_round_id uuid)
returns json
language plpgsql security definer
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
    from players
    where lobby_id = v_round.lobby_id and user_id = auth.uid()
  ) then
    raise exception 'Not a member of this lobby';
  end if;

  if v_round.phase <> 'results' then
    raise exception 'Results are not ready';
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
