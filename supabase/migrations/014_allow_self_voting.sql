-- Migration 014: Allow self-voting in online lobbies
-- Removes the restriction preventing players from voting for themselves.

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

  -- Note: Self-voting is explicitly permitted (e.g. jester strategy, bluffs, or fun)

  insert into votes (round_id, voter_id, target_id)
  values (p_round_id, v_voter_id, p_target_id)
  on conflict (round_id, voter_id) do update
    set target_id = excluded.target_id,
        cast_at   = now()
  returning * into v_vote;

  return row_to_json(v_vote);
end;
$$;
