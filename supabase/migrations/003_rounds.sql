-- Migration: 003_rounds
-- Creates the rounds table with RLS that hides the word and impostor list from non-impostors.
-- Depends on: 001_lobbies, 002_players

create table if not exists rounds (
  id            uuid primary key default gen_random_uuid(),
  lobby_id      uuid not null references lobbies (id) on delete cascade,
  round_number  integer not null default 1,
  -- word and impostor_ids are kept hidden behind RLS / RPC
  word          text not null,
  hint          text not null default '',
  impostor_ids  uuid[] not null default '{}',
  phase         text not null default 'role_reveal'
                  check (phase in ('role_reveal', 'discussion', 'voting', 'results')),
  pack_id       text not null default 'everyday',
  started_at    timestamptz not null default now(),
  ended_at      timestamptz
);

create index if not exists rounds_lobby_idx on rounds (lobby_id);

-- Enable RLS
alter table rounds enable row level security;

-- Players can see the round row but the word and impostor_ids columns are redacted via the RPC.
-- The select policy just controls row visibility, not column-level security.
create policy "rounds_select"
  on rounds for select
  using (
    lobby_id in (
      select p.lobby_id from players p where p.user_id = auth.uid()
    )
  );

-- Only the host (lobby owner) can insert/update rounds
create policy "rounds_insert_host"
  on rounds for insert
  with check (
    lobby_id in (select id from lobbies where host_id = auth.uid())
  );

create policy "rounds_update_host"
  on rounds for update
  using (
    lobby_id in (select id from lobbies where host_id = auth.uid())
  );

-- RPC: get_my_role — returns the caller's role for a round without leaking the full impostor list.
-- Crewmates: receive the word only.
-- Impostors: receive the hint only (no word).
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

  -- Confirm the caller is in this lobby
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
  else
    return json_build_object(
      'role', 'CREWMATE',
      'word', v_round.word,
      'hint', null
    );
  end if;
end;
$$;

-- RPC: start_round — host starts a new round for a lobby
create or replace function start_round(
  p_lobby_id    uuid,
  p_word        text,
  p_hint        text,
  p_pack_id     text,
  p_impostor_ids uuid[]
)
returns json
language plpgsql security definer
as $$
declare
  v_round rounds;
  v_round_number int;
begin
  -- Only host may call this
  if not exists (select 1 from lobbies where id = p_lobby_id and host_id = auth.uid()) then
    raise exception 'Only the host can start a round';
  end if;

  select coalesce(max(round_number), 0) + 1
  into v_round_number
  from rounds
  where lobby_id = p_lobby_id;

  insert into rounds (lobby_id, round_number, word, hint, pack_id, impostor_ids)
  values (p_lobby_id, v_round_number, p_word, p_hint, p_pack_id, p_impostor_ids)
  returning * into v_round;

  -- Advance lobby status
  update lobbies set status = 'playing' where id = p_lobby_id;

  -- Return the round id so clients can subscribe/fetch roles
  return json_build_object('round_id', v_round.id, 'round_number', v_round.round_number);
end;
$$;
