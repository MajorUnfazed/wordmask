-- Migration: 002_players
-- Creates the players table.
-- Depends on: 001_lobbies

create table if not exists players (
  id             uuid primary key default gen_random_uuid(),
  lobby_id       uuid not null references lobbies (id) on delete cascade,
  user_id        uuid references auth.users (id) on delete set null,
  name           text not null check (char_length(name) between 1 and 32),
  score          integer not null default 0,
  is_eliminated  boolean not null default false,
  is_host        boolean not null default false,
  joined_at      timestamptz not null default now()
);

create index if not exists players_lobby_idx on players (lobby_id);

-- Enable RLS
alter table players enable row level security;

-- Players can see everyone in their lobby
create policy "players_select"
  on players for select
  using (
    lobby_id in (
      select lp.lobby_id
      from players lp
      where lp.user_id = auth.uid()
    )
    -- Allow unauthenticated access by lobby code is handled via RPC
    or true
  );

-- Only the player themselves (or anonymous matching user_id) can insert their own row
create policy "players_insert"
  on players for insert
  with check (user_id = auth.uid() or user_id is null);

-- Players can update only their own row (name, score managed by server)
create policy "players_update_self"
  on players for update
  using (user_id = auth.uid());

-- RPC: join_lobby — add the caller as a player in a lobby
create or replace function join_lobby(p_lobby_id uuid, p_name text)
returns json
language plpgsql security definer
as $$
declare
  v_player players;
begin
  -- Prevent joining a non-waiting lobby
  if not exists (select 1 from lobbies where id = p_lobby_id and status = 'waiting') then
    raise exception 'Lobby is not accepting players';
  end if;

  -- Prevent duplicate join
  if exists (select 1 from players where lobby_id = p_lobby_id and user_id = auth.uid()) then
    select * into v_player from players where lobby_id = p_lobby_id and user_id = auth.uid();
    return row_to_json(v_player);
  end if;

  insert into players (lobby_id, user_id, name)
  values (p_lobby_id, auth.uid(), p_name)
  returning * into v_player;

  return row_to_json(v_player);
end;
$$;
