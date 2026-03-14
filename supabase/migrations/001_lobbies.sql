-- Migration: 001_lobbies
-- Creates the lobbies table and related RPC functions.

create table if not exists lobbies (
  id          uuid primary key default gen_random_uuid(),
  code        char(6) not null unique,
  host_id     uuid not null,
  status      text not null default 'waiting'
                check (status in ('waiting', 'playing', 'finished')),
  config      jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- Index for fast code look-ups
create index if not exists lobbies_code_idx on lobbies (code);

-- Enable RLS
alter table lobbies enable row level security;

-- Anyone can read a lobby they are in or know the code for
create policy "lobby_select"
  on lobbies for select
  using (true);

-- Only the host can update their own lobby
create policy "lobby_update_host"
  on lobbies for update
  using (host_id = auth.uid());

-- Anyone authenticated can create a lobby
create policy "lobby_insert"
  on lobbies for insert
  with check (host_id = auth.uid());

-- RPC: create_lobby — generates a random 6-char code and inserts a lobby row
create or replace function create_lobby(p_config jsonb default '{}')
returns json
language plpgsql security definer
as $$
declare
  v_code    char(6);
  v_lobby   lobbies;
  v_attempt int := 0;
begin
  -- Generate a unique code (retry up to 10 times to avoid collisions)
  loop
    v_code := upper(substr(md5(random()::text), 1, 6));
    exit when not exists (select 1 from lobbies where code = v_code);
    v_attempt := v_attempt + 1;
    if v_attempt >= 10 then
      raise exception 'Could not generate unique lobby code';
    end if;
  end loop;

  insert into lobbies (code, host_id, config)
  values (v_code, auth.uid(), p_config)
  returning * into v_lobby;

  return row_to_json(v_lobby);
end;
$$;

-- RPC: get_lobby_by_code — look up a lobby by its join code
create or replace function get_lobby_by_code(p_code text)
returns json
language sql security definer
as $$
  select row_to_json(l)
  from lobbies l
  where upper(l.code) = upper(p_code)
  limit 1;
$$;
