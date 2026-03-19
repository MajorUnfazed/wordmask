-- Migration: 009_room_moderation_and_chat
-- Adds room moderation, rejoin approval, and cross-platform room chat.
-- Depends on: 001_lobbies, 002_players, 003_rounds, 004_votes, 005_online_phase4,
--             006_social_polish, 007_online_bootstrap_and_parity, 008_fix_vote_progress_counts

create table if not exists room_messages (
  id                   uuid primary key default gen_random_uuid(),
  lobby_id             uuid not null references lobbies (id) on delete cascade,
  player_id            uuid references players (id) on delete set null,
  player_name          text,
  kind                 text not null
                         check (kind in ('text', 'system', 'tombstone')),
  body                 text not null,
  created_at           timestamptz not null default now(),
  deleted_at           timestamptz,
  deleted_by_player_id uuid references players (id) on delete set null
);

create index if not exists room_messages_lobby_idx
  on room_messages (lobby_id, created_at desc);

alter table room_messages enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'room_messages'
      and policyname = 'room_messages_select'
  ) then
    create policy "room_messages_select"
      on room_messages for select
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

create table if not exists room_message_reactions (
  message_id  uuid not null references room_messages (id) on delete cascade,
  player_id   uuid not null references players (id) on delete cascade,
  emoji       text not null
                check (emoji in ('👍', '😂', '😬', '🔥', '👀', '❓')),
  created_at  timestamptz not null default now(),
  primary key (message_id, player_id, emoji)
);

create index if not exists room_message_reactions_message_idx
  on room_message_reactions (message_id);

alter table room_message_reactions enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'room_message_reactions'
      and policyname = 'room_message_reactions_select'
  ) then
    create policy "room_message_reactions_select"
      on room_message_reactions for select
      using (
        player_id in (
          select p.id
          from players p
          where p.user_id = auth.uid()
        )
        or message_id in (
          select rm.id
          from room_messages rm
          join players p on p.lobby_id = rm.lobby_id
          where p.user_id = auth.uid()
        )
      );
  end if;
end
$$;

create table if not exists lobby_access_controls (
  lobby_id              uuid not null references lobbies (id) on delete cascade,
  user_id               uuid not null references auth.users (id) on delete cascade,
  status                text not null check (status in ('blocked', 'allowed')),
  updated_at            timestamptz not null default now(),
  updated_by_player_id  uuid references players (id) on delete set null,
  primary key (lobby_id, user_id)
);

create index if not exists lobby_access_controls_lobby_idx
  on lobby_access_controls (lobby_id, status);

alter table lobby_access_controls enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'lobby_access_controls'
      and policyname = 'lobby_access_controls_select'
  ) then
    create policy "lobby_access_controls_select"
      on lobby_access_controls for select
      using (
        user_id = auth.uid()
        or lobby_id in (
          select l.id
          from lobbies l
          where l.host_id = auth.uid()
        )
      );
  end if;
end
$$;

create table if not exists lobby_join_requests (
  id                    uuid primary key default gen_random_uuid(),
  lobby_id              uuid not null references lobbies (id) on delete cascade,
  user_id               uuid not null references auth.users (id) on delete cascade,
  requested_name        text not null check (char_length(requested_name) between 1 and 32),
  status                text not null check (status in ('pending', 'approved', 'denied')),
  created_at            timestamptz not null default now(),
  reviewed_at           timestamptz,
  reviewed_by_player_id uuid references players (id) on delete set null
);

create index if not exists lobby_join_requests_lobby_idx
  on lobby_join_requests (lobby_id, status, created_at desc);

create index if not exists lobby_join_requests_user_idx
  on lobby_join_requests (user_id, lobby_id, created_at desc);

alter table lobby_join_requests enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'lobby_join_requests'
      and policyname = 'lobby_join_requests_select'
  ) then
    create policy "lobby_join_requests_select"
      on lobby_join_requests for select
      using (
        user_id = auth.uid()
        or lobby_id in (
          select l.id
          from lobbies l
          where l.host_id = auth.uid()
        )
      );
  end if;
end
$$;

create or replace function get_online_schema_version()
returns integer
language sql
security definer
stable
as $$
  select 9;
$$;

create or replace function add_lobby_event(
  p_lobby_id uuid,
  p_type text,
  p_actor_name text,
  p_target_name text,
  p_message text
)
returns void
language plpgsql
security definer
as $$
begin
  insert into lobby_events (lobby_id, type, actor_name, target_name, message)
  values (p_lobby_id, p_type, p_actor_name, p_target_name, p_message);

  insert into room_messages (lobby_id, player_name, kind, body)
  values (p_lobby_id, p_actor_name, 'system', p_message);
end;
$$;

create or replace function join_lobby(p_lobby_id uuid, p_name text)
returns json
language plpgsql
security definer
as $$
declare
  v_player players;
  v_code char(6);
  v_name text := trim(coalesce(p_name, ''));
  v_existing_request lobby_join_requests;
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

  if exists (
    select 1
    from lobby_access_controls
    where lobby_id = p_lobby_id
      and user_id = auth.uid()
      and status = 'blocked'
  ) then
    select *
    into v_existing_request
    from lobby_join_requests
    where lobby_id = p_lobby_id
      and user_id = auth.uid()
      and status = 'pending'
    order by created_at desc
    limit 1;

    if v_existing_request.id is null then
      insert into lobby_join_requests (lobby_id, user_id, requested_name, status)
      values (p_lobby_id, auth.uid(), v_name, 'pending')
      returning * into v_existing_request;

      perform add_lobby_event(
        p_lobby_id,
        'rejoin_requested',
        v_name,
        null,
        v_name || ' requested to rejoin the lobby.'
      );
    end if;

    return json_build_object(
      'status', 'pending_approval',
      'code', trim(v_code),
      'request_id', v_existing_request.id
    );
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

    delete from lobby_access_controls
    where lobby_id = p_lobby_id and user_id = auth.uid() and status = 'allowed';

    perform add_lobby_event(
      p_lobby_id,
      'player_joined',
      v_name,
      null,
      v_name || ' joined the lobby.'
    );
  end if;

  return json_build_object(
    'status', 'joined',
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

create or replace function kick_player(p_lobby_id uuid, p_player_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_target players;
  v_host_player_id uuid;
  v_host_name text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select id, name
  into v_host_player_id, v_host_name
  from players
  where lobby_id = p_lobby_id and user_id = auth.uid() and is_host = true
  limit 1;

  if v_host_player_id is null then
    raise exception 'Only the host can remove players';
  end if;

  if not exists (
    select 1
    from lobbies
    where id = p_lobby_id and status = 'waiting'
  ) then
    raise exception 'Players can only be removed while the lobby is waiting';
  end if;

  select *
  into v_target
  from players
  where id = p_player_id and lobby_id = p_lobby_id
  limit 1;

  if v_target.id is null then
    raise exception 'Player not found';
  end if;

  if v_target.is_host then
    raise exception 'The host cannot remove themselves';
  end if;

  if v_target.user_id is null then
    raise exception 'This player cannot be removed by the host';
  end if;

  insert into lobby_access_controls (lobby_id, user_id, status, updated_at, updated_by_player_id)
  values (p_lobby_id, v_target.user_id, 'blocked', now(), v_host_player_id)
  on conflict (lobby_id, user_id) do update
    set status = 'blocked',
        updated_at = now(),
        updated_by_player_id = excluded.updated_by_player_id;

  update lobby_join_requests
  set status = 'denied',
      reviewed_at = now(),
      reviewed_by_player_id = v_host_player_id
  where lobby_id = p_lobby_id
    and user_id = v_target.user_id
    and status = 'pending';

  delete from players
  where id = v_target.id;

  perform add_lobby_event(
    p_lobby_id,
    'player_removed',
    v_host_name,
    v_target.name,
    v_target.name || ' was removed from the lobby.'
  );

  return json_build_object(
    'removed_player_id', p_player_id,
    'removed_user_id', v_target.user_id
  );
end;
$$;

create or replace function review_join_request(p_request_id uuid, p_decision text)
returns json
language plpgsql
security definer
as $$
declare
  v_request lobby_join_requests;
  v_host_player players;
  v_decision text := lower(trim(coalesce(p_decision, '')));
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if v_decision not in ('approve', 'deny') then
    raise exception 'Invalid decision';
  end if;

  select *
  into v_request
  from lobby_join_requests
  where id = p_request_id
  limit 1;

  if v_request.id is null then
    raise exception 'Join request not found';
  end if;

  select *
  into v_host_player
  from players
  where lobby_id = v_request.lobby_id
    and user_id = auth.uid()
    and is_host = true
  limit 1;

  if v_host_player.id is null then
    raise exception 'Only the host can review join requests';
  end if;

  if not exists (
    select 1
    from lobbies
    where id = v_request.lobby_id and status = 'waiting'
  ) then
    raise exception 'Join requests can only be reviewed while the lobby is waiting';
  end if;

  update lobby_join_requests
  set status = case when v_decision = 'approve' then 'approved' else 'denied' end,
      reviewed_at = now(),
      reviewed_by_player_id = v_host_player.id
  where id = v_request.id;

  insert into lobby_access_controls (lobby_id, user_id, status, updated_at, updated_by_player_id)
  values (
    v_request.lobby_id,
    v_request.user_id,
    case when v_decision = 'approve' then 'allowed' else 'blocked' end,
    now(),
    v_host_player.id
  )
  on conflict (lobby_id, user_id) do update
    set status = excluded.status,
        updated_at = excluded.updated_at,
        updated_by_player_id = excluded.updated_by_player_id;

  perform add_lobby_event(
    v_request.lobby_id,
    case when v_decision = 'approve' then 'rejoin_approved' else 'rejoin_denied' end,
    v_host_player.name,
    v_request.requested_name,
    case
      when v_decision = 'approve'
        then v_request.requested_name || ' was approved to rejoin.'
      else v_request.requested_name || ' was denied re-entry.'
    end
  );

  return json_build_object(
    'request_id', v_request.id,
    'status', case when v_decision = 'approve' then 'approved' else 'denied' end
  );
end;
$$;

create or replace function get_join_request_status(p_request_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_request lobby_join_requests;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select *
  into v_request
  from lobby_join_requests
  where id = p_request_id
  limit 1;

  if v_request.id is null then
    raise exception 'Join request not found';
  end if;

  if v_request.user_id <> auth.uid() and not exists (
    select 1
    from players
    where lobby_id = v_request.lobby_id
      and user_id = auth.uid()
      and is_host = true
  ) then
    raise exception 'Not allowed to view this join request';
  end if;

  return json_build_object(
    'request_id', v_request.id,
    'status', v_request.status
  );
end;
$$;

create or replace function send_room_message(p_lobby_id uuid, p_body text)
returns json
language plpgsql
security definer
as $$
declare
  v_player players;
  v_body text := trim(coalesce(p_body, ''));
  v_message room_messages;
  v_blocked_round rounds;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if char_length(v_body) < 1 or char_length(v_body) > 280 then
    raise exception 'Messages must be between 1 and 280 characters';
  end if;

  select *
  into v_player
  from players
  where lobby_id = p_lobby_id and user_id = auth.uid()
  limit 1;

  if v_player.id is null then
    raise exception 'Not a member of this lobby';
  end if;

  select *
  into v_blocked_round
  from rounds
  where lobby_id = p_lobby_id
    and ended_at is null
    and phase = 'role_reveal'
  order by started_at desc
  limit 1;

  if v_blocked_round.id is not null then
    raise exception 'Chat is unavailable during the private reveal';
  end if;

  insert into room_messages (lobby_id, player_id, player_name, kind, body)
  values (p_lobby_id, v_player.id, v_player.name, 'text', v_body)
  returning * into v_message;

  return json_build_object(
    'id', v_message.id,
    'lobby_id', v_message.lobby_id,
    'player_id', v_message.player_id,
    'player_name', v_message.player_name,
    'kind', v_message.kind,
    'body', v_message.body,
    'created_at', v_message.created_at
  );
end;
$$;

create or replace function delete_room_message(p_message_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_message room_messages;
  v_host_player players;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select *
  into v_message
  from room_messages
  where id = p_message_id
  limit 1;

  if v_message.id is null then
    raise exception 'Message not found';
  end if;

  select *
  into v_host_player
  from players
  where lobby_id = v_message.lobby_id
    and user_id = auth.uid()
    and is_host = true
  limit 1;

  if v_host_player.id is null then
    raise exception 'Only the host can delete room messages';
  end if;

  if v_message.kind <> 'text' then
    raise exception 'Only text messages can be deleted';
  end if;

  update room_messages
  set kind = 'tombstone',
      body = 'Message removed by host.',
      deleted_at = now(),
      deleted_by_player_id = v_host_player.id
  where id = p_message_id
  returning * into v_message;

  delete from room_message_reactions
  where message_id = p_message_id;

  return json_build_object(
    'message_id', v_message.id,
    'kind', v_message.kind,
    'body', v_message.body
  );
end;
$$;

create or replace function toggle_room_message_reaction(p_message_id uuid, p_emoji text)
returns json
language plpgsql
security definer
as $$
declare
  v_message room_messages;
  v_player players;
  v_emoji text := trim(coalesce(p_emoji, ''));
  v_exists boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if v_emoji not in ('👍', '😂', '😬', '🔥', '👀', '❓') then
    raise exception 'Unsupported reaction';
  end if;

  select *
  into v_message
  from room_messages
  where id = p_message_id
  limit 1;

  if v_message.id is null then
    raise exception 'Message not found';
  end if;

  if v_message.kind <> 'text' then
    raise exception 'Only text messages can be reacted to';
  end if;

  select *
  into v_player
  from players
  where lobby_id = v_message.lobby_id and user_id = auth.uid()
  limit 1;

  if v_player.id is null then
    raise exception 'Not a member of this lobby';
  end if;

  select exists(
    select 1
    from room_message_reactions
    where message_id = p_message_id
      and player_id = v_player.id
      and emoji = v_emoji
  )
  into v_exists;

  if v_exists then
    delete from room_message_reactions
    where message_id = p_message_id
      and player_id = v_player.id
      and emoji = v_emoji;
  else
    insert into room_message_reactions (message_id, player_id, emoji)
    values (p_message_id, v_player.id, v_emoji);
  end if;

  return json_build_object(
    'message_id', p_message_id,
    'emoji', v_emoji,
    'reacted', not v_exists
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
  v_viewer_player_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select *
  into v_lobby
  from lobbies
  where upper(trim(code)) = upper(trim(p_code))
  limit 1;

  if v_lobby.id is null then
    return null;
  end if;

  select id
  into v_viewer_player_id
  from players
  where lobby_id = v_lobby.id and user_id = auth.uid()
  limit 1;

  if v_viewer_player_id is null then
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
    ),
    latest_messages as (
      select *
      from room_messages
      where lobby_id = v_lobby.id
      order by created_at desc
      limit 50
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
      'messages', coalesce((
        select json_agg(
          json_build_object(
            'id', m.id,
            'player_id', m.player_id,
            'player_name', m.player_name,
            'kind', m.kind,
            'body', m.body,
            'created_at', m.created_at,
            'deleted_at', m.deleted_at,
            'reactions', coalesce((
              select json_agg(
                json_build_object(
                  'emoji', reaction_rollup.emoji,
                  'count', reaction_rollup.reaction_count,
                  'reacted_by_me', reaction_rollup.reacted_by_me
                )
                order by reaction_rollup.emoji
              )
              from (
                select
                  r.emoji,
                  count(*)::int as reaction_count,
                  bool_or(r.player_id = v_viewer_player_id) as reacted_by_me
                from room_message_reactions r
                where r.message_id = m.id
                group by r.emoji
              ) reaction_rollup
            ), '[]'::json)
          )
          order by m.created_at asc
        )
        from latest_messages m
      ), '[]'::json),
      'pending_join_requests', case
        when exists (
          select 1
          from players
          where lobby_id = v_lobby.id
            and user_id = auth.uid()
            and is_host = true
        ) then coalesce((
          select json_agg(
            json_build_object(
              'id', req.id,
              'requested_name', req.requested_name,
              'status', req.status,
              'created_at', req.created_at
            )
            order by req.created_at asc
          )
          from lobby_join_requests req
          where req.lobby_id = v_lobby.id
            and req.status = 'pending'
        ), '[]'::json)
        else '[]'::json
      end,
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
  v_member_code text;
  v_lobby_id uuid;
  v_lobby json;
  v_access_status text := 'none';
  v_request_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select l.code
  into v_member_code
  from lobbies l
  join players p on p.lobby_id = l.id
  where p.user_id = auth.uid()
  order by p.joined_at desc
  limit 1;

  if v_member_code is not null then
    v_code := coalesce(v_code, v_member_code);
  end if;

  if v_code is not null then
    select id
    into v_lobby_id
    from lobbies
    where upper(trim(code)) = upper(trim(v_code))
    limit 1;
  end if;

  if v_lobby_id is not null and exists (
    select 1
    from players
    where lobby_id = v_lobby_id and user_id = auth.uid()
  ) then
    v_access_status := 'member';
    v_lobby := get_lobby_state(v_code);
  elsif v_lobby_id is not null then
    select req.id
    into v_request_id
    from lobby_join_requests req
    where req.lobby_id = v_lobby_id
      and req.user_id = auth.uid()
      and req.status = 'pending'
    order by req.created_at desc
    limit 1;

    if v_request_id is not null then
      v_access_status := 'pending_approval';
    elsif exists (
      select 1
      from lobby_access_controls
      where lobby_id = v_lobby_id
        and user_id = auth.uid()
        and status = 'blocked'
    ) then
      v_access_status := 'blocked';
    end if;
  end if;

  return json_build_object(
    'schema_version', get_online_schema_version(),
    'capabilities', json_build_object(
      'repair_lobby_presence', true,
      'source_categories', true,
      'mobile_full_gameplay', true,
      'start_next_round', true,
      'room_chat', true,
      'kick_player', true,
      'join_approval', true
    ),
    'access_state', v_access_status,
    'request_id', v_request_id,
    'lobby', v_lobby
  );
end;
$$;
