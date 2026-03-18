-- Migration: 004_votes
-- Creates the votes table, enforces one vote per player per round, and provides submit_vote RPC.
-- Depends on: 001_lobbies, 002_players, 003_rounds

create table if not exists votes (
  id          uuid primary key default gen_random_uuid(),
  round_id    uuid not null references rounds (id) on delete cascade,
  voter_id    uuid not null references players (id) on delete cascade,
  target_id   uuid not null references players (id) on delete cascade,
  cast_at     timestamptz not null default now(),

  -- Each player may cast exactly one vote per round
  constraint votes_unique_voter_round unique (round_id, voter_id)
);

create index if not exists votes_round_idx on votes (round_id);

-- Enable RLS
alter table votes enable row level security;

-- Players in the lobby can read all votes for a round (used to show results)
create policy "votes_select"
  on votes for select
  using (
    round_id in (
      select r.id from rounds r
      join players p on p.lobby_id = r.lobby_id
      where p.user_id = auth.uid()
    )
  );

-- Inserts handled exclusively via RPC (no direct insert policy)

-- RPC: submit_vote — cast or replace a vote for the authenticated player
create or replace function submit_vote(p_round_id uuid, p_target_id uuid)
returns json
language plpgsql security definer
as $$
declare
  v_round     rounds;
  v_voter_id  uuid;
  v_vote      votes;
begin
  select * into v_round from rounds where id = p_round_id;
  if not found then
    raise exception 'Round not found';
  end if;

  if v_round.phase <> 'voting' then
    raise exception 'Voting is not open';
  end if;

  -- Resolve the caller's player row in this lobby
  select id into v_voter_id
  from players
  where lobby_id = v_round.lobby_id and user_id = auth.uid()
  limit 1;

  if v_voter_id is null then
    raise exception 'Not a member of this lobby';
  end if;

  -- Confirm target is in the same lobby
  if not exists (
    select 1 from players where id = p_target_id and lobby_id = v_round.lobby_id
  ) then
    raise exception 'Target player is not in this lobby';
  end if;

  -- Prevent self-vote
  if v_voter_id = p_target_id then
    raise exception 'Cannot vote for yourself';
  end if;

  insert into votes (round_id, voter_id, target_id)
  values (p_round_id, v_voter_id, p_target_id)
  on conflict (round_id, voter_id) do update
    set target_id = excluded.target_id,
        cast_at   = now()
  returning * into v_vote;

  return row_to_json(v_vote);
end;
$$;

-- RPC: get_vote_summary — return aggregated vote counts for a round (safe to expose post-voting)
create or replace function get_vote_summary(p_round_id uuid)
returns json
language sql security definer
as $$
  select coalesce(
    (
      select json_agg(
        json_build_object(
          'target_id', grouped.target_id,
          'vote_count', grouped.vote_count
        )
        order by grouped.vote_count desc, grouped.target_id asc
      )
      from (
        select target_id, count(*)::int as vote_count
        from votes
        where round_id = p_round_id
        group by target_id
      ) grouped
    ),
    '[]'::json
  );
$$;
