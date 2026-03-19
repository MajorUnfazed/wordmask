-- Migration: 008_fix_vote_progress_counts
-- Fixes inflated vote_progress totals in get_lobby_state by separating
-- active-player, ready-state, and vote aggregates.
-- Depends on: 006_social_polish, 007_online_bootstrap_and_parity

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
