-- Wordmask v2: durable identity, community packs, and server-enforced live-game permissions.
-- Ephemeral state (presence, typing, timers, suspicion) intentionally belongs in Realtime Presence
-- or a Redis adapter, never in these durable tables.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 32),
  avatar_url text,
  equipped_title text,
  equipped_border text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table profiles enable row level security;
create policy "profiles readable by authenticated users" on profiles for select to authenticated using (true);
create policy "profiles insert self" on profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles update self" on profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create table if not exists player_statistics (
  profile_id uuid primary key references profiles(id) on delete cascade,
  games_played integer not null default 0 check (games_played >= 0),
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  impostor_wins integer not null default 0 check (impostor_wins >= 0),
  crew_wins integer not null default 0 check (crew_wins >= 0),
  jester_wins integer not null default 0 check (jester_wins >= 0),
  correct_votes integer not null default 0 check (correct_votes >= 0),
  incorrect_votes integer not null default 0 check (incorrect_votes >= 0),
  words_guessed integer not null default 0 check (words_guessed >= 0),
  total_play_seconds bigint not null default 0 check (total_play_seconds >= 0),
  longest_win_streak integer not null default 0 check (longest_win_streak >= 0),
  current_win_streak integer not null default 0 check (current_win_streak >= 0)
);
alter table player_statistics enable row level security;
create policy "statistics readable by authenticated users" on player_statistics for select to authenticated using (true);

create table if not exists community_packs (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 80),
  description text not null check (char_length(description) between 10 and 500),
  language text not null check (char_length(language) between 2 and 16),
  category text not null check (char_length(category) between 1 and 48),
  tags text[] not null default '{}',
  version integer not null default 1 check (version > 0),
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected', 'removed')),
  downloads integer not null default 0 check (downloads >= 0),
  likes integer not null default 0 check (likes >= 0),
  reports integer not null default 0 check (reports >= 0),
  created_at timestamptz not null default now(),
  published_at timestamptz
);
create index if not exists community_packs_discover_idx on community_packs (status, language, category, created_at desc);
alter table community_packs enable row level security;
create policy "published packs are readable" on community_packs for select to authenticated using (status = 'published' or creator_id = (select auth.uid()));
create policy "creators submit packs" on community_packs for insert to authenticated with check (creator_id = (select auth.uid()) and status = 'pending');
create policy "creators edit pending packs" on community_packs for update to authenticated using (creator_id = (select auth.uid()) and status = 'pending') with check (creator_id = (select auth.uid()) and status = 'pending');

create table if not exists community_pack_words (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references community_packs(id) on delete cascade,
  word text not null check (char_length(word) between 1 and 40),
  clues text[] not null check (cardinality(clues) > 0),
  position integer not null check (position >= 0),
  unique (pack_id, position)
);
create unique index if not exists community_pack_words_normalized_word_idx
  on community_pack_words (pack_id, lower(word));
alter table community_pack_words enable row level security;
create policy "words follow pack visibility" on community_pack_words for select to authenticated using (exists (select 1 from community_packs p where p.id = pack_id and (p.status = 'published' or p.creator_id = (select auth.uid()))));
create policy "creators manage their pending words" on community_pack_words for all to authenticated using (exists (select 1 from community_packs p where p.id = pack_id and p.creator_id = (select auth.uid()) and p.status = 'pending')) with check (exists (select 1 from community_packs p where p.id = pack_id and p.creator_id = (select auth.uid()) and p.status = 'pending'));

create table if not exists community_pack_reports (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references community_packs(id) on delete cascade,
  reporter_id uuid not null references profiles(id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 500),
  created_at timestamptz not null default now(), unique (pack_id, reporter_id)
);
alter table community_pack_reports enable row level security;
create policy "users report packs" on community_pack_reports for insert to authenticated with check (reporter_id = (select auth.uid()));
create policy "reporters read own reports" on community_pack_reports for select to authenticated using (reporter_id = (select auth.uid()));

alter table lobbies add column if not exists tv_host_mode boolean not null default false;
alter table rounds add column if not exists jester_ids uuid[] not null default '{}';
alter table rounds add column if not exists final_guess jsonb;

create table if not exists lobby_spectators (
  lobby_id uuid not null references lobbies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 32),
  joined_at timestamptz not null default now(),
  primary key (lobby_id, user_id)
);
alter table lobby_spectators enable row level security;
create policy "spectators see their own membership" on lobby_spectators for select to authenticated using (user_id = (select auth.uid()));

create or replace function join_as_spectator(p_lobby_id uuid, p_name text)
returns json language plpgsql security definer set search_path = public as $$
declare v_status text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select status into v_status from lobbies where id = p_lobby_id;
  if v_status is distinct from 'playing' then raise exception 'Spectators can only join an active game'; end if;
  insert into lobby_spectators (lobby_id, user_id, display_name)
  values (p_lobby_id, auth.uid(), trim(p_name))
  on conflict (lobby_id, user_id) do update set display_name = excluded.display_name;
  return json_build_object('lobby_id', p_lobby_id, 'role', 'spectator');
end; $$;

create or replace function set_tv_host_mode(p_lobby_id uuid, p_enabled boolean)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from lobbies where id = p_lobby_id and host_id = auth.uid() and status = 'waiting') then
    raise exception 'Only the host can change TV mode before a game begins';
  end if;
  update lobbies set tv_host_mode = p_enabled where id = p_lobby_id;
  return json_build_object('lobby_id', p_lobby_id, 'tv_host_mode', p_enabled);
end; $$;

create or replace function get_public_lobby_state(p_code text)
returns json language plpgsql security definer stable set search_path = public as $$
declare v_lobby lobbies;
begin
  select * into v_lobby from lobbies where upper(trim(code)) = upper(trim(p_code)) limit 1;
  if v_lobby.id is null or not v_lobby.tv_host_mode then return null; end if;
  return json_build_object(
    'code', trim(v_lobby.code), 'status', v_lobby.status,
    'players', (select coalesce(json_agg(json_build_object('id', id, 'name', name, 'score', score)), '[]'::json) from players where lobby_id = v_lobby.id),
    'round', (select json_build_object('round_number', round_number, 'phase', phase, 'started_at', started_at) from rounds where lobby_id = v_lobby.id order by started_at desc limit 1)
  );
end; $$;

-- Never expose private roles to spectators. Existing get_my_role only succeeds for players.
create or replace function get_my_role(p_round_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_round rounds; v_player_id uuid;
begin
  select * into v_round from rounds where id = p_round_id;
  if v_round.id is null then raise exception 'Round not found'; end if;
  select id into v_player_id from players where lobby_id = v_round.lobby_id and user_id = auth.uid() limit 1;
  if v_player_id is null then raise exception 'Spectators cannot view private roles'; end if;
  if v_player_id = any(v_round.impostor_ids) then return json_build_object('role', 'IMPOSTOR', 'word', null, 'hint', v_round.hint); end if;
  if v_player_id = any(v_round.jester_ids) then return json_build_object('role', 'JESTER', 'word', v_round.word, 'hint', null); end if;
  return json_build_object('role', 'CREWMATE', 'word', v_round.word, 'hint', null);
end; $$;

create or replace function get_online_schema_version() returns integer language sql security definer stable as $$ select 10; $$;

revoke all on function join_as_spectator(uuid, text) from public;
revoke all on function set_tv_host_mode(uuid, boolean) from public;
revoke all on function get_public_lobby_state(text) from public;
grant execute on function join_as_spectator(uuid, text), set_tv_host_mode(uuid, boolean), get_public_lobby_state(text) to authenticated;

-- Extensible v2 round state. A final guess is a real phase, not a client-side modal.
alter table rounds drop constraint if exists rounds_phase_check;
alter table rounds add constraint rounds_phase_check
  check (phase in ('role_reveal', 'discussion', 'voting', 'final_impostor_guess', 'results'));
alter table rounds add column if not exists eliminated_player_id uuid references players(id) on delete set null;
alter table rounds add column if not exists final_guess_correct boolean;

create table if not exists lobby_word_history (
  lobby_id uuid not null references lobbies(id) on delete cascade,
  word_key text not null,
  round_id uuid not null references rounds(id) on delete cascade,
  selected_at timestamptz not null default now(),
  primary key (lobby_id, round_id)
);
create index if not exists lobby_word_history_recent_idx on lobby_word_history (lobby_id, selected_at desc);
alter table lobby_word_history enable row level security;
create policy "members read lobby word history" on lobby_word_history for select to authenticated using (
  exists (select 1 from players p where p.lobby_id = lobby_word_history.lobby_id and p.user_id = (select auth.uid()))
);

create or replace function get_recent_lobby_words(p_lobby_id uuid, p_limit integer default 100)
returns json language sql security definer stable set search_path = public as $$
  select coalesce(json_agg(word_key order by selected_at desc), '[]'::json)
  from (
    select word_key, selected_at
    from lobby_word_history
    where lobby_id = p_lobby_id
      and exists (select 1 from players p where p.lobby_id = p_lobby_id and p.user_id = auth.uid())
    order by selected_at desc
    limit greatest(1, least(coalesce(p_limit, 100), 500))
  ) recent;
$$;

drop function if exists start_next_round(uuid, text, text, text, integer);
drop function if exists start_round(uuid, text, text, text, integer);
create or replace function start_round(
  p_lobby_id uuid,
  p_word text,
  p_hint text,
  p_pack_id text,
  p_impostor_count integer default 1,
  p_jester_count integer default 0
)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_round rounds; v_round_number integer; v_player_count integer; v_not_ready_count integer;
  v_impostor_ids uuid[]; v_jester_ids uuid[]; v_source_categories text[]; v_host_name text;
  v_word_key text := lower(trim(coalesce(p_pack_id, 'everyday'))) || ':' || lower(trim(coalesce(p_word, '')));
begin
  perform normalize_lobby_presence(p_lobby_id);
  if not exists (select 1 from lobbies where id = p_lobby_id and host_id = auth.uid()) then raise exception 'Only the host can start a round'; end if;
  if char_length(trim(coalesce(p_word, ''))) = 0 then raise exception 'A word is required'; end if;
  select count(*) into v_player_count from players where lobby_id = p_lobby_id and presence_status <> 'away';
  select count(*) into v_not_ready_count from players where lobby_id = p_lobby_id and presence_status <> 'away' and is_ready = false;
  if v_player_count < 3 then raise exception 'At least 3 connected players are required'; end if;
  if v_not_ready_count > 0 then raise exception 'All connected players must be ready'; end if;
  if p_impostor_count < 1 or p_jester_count < 0 or p_impostor_count + p_jester_count >= v_player_count then raise exception 'Invalid role counts'; end if;
  if exists (select 1 from rounds where lobby_id = p_lobby_id and ended_at is null) then raise exception 'A round is already in progress'; end if;
  if exists (select 1 from lobby_word_history where lobby_id = p_lobby_id and word_key = v_word_key order by selected_at desc limit 100) then raise exception 'This word was used too recently'; end if;
  select coalesce(max(round_number), 0) + 1 into v_round_number from rounds where lobby_id = p_lobby_id;
  select array_agg(id) into v_impostor_ids from (select id from players where lobby_id = p_lobby_id and presence_status <> 'away' order by random() limit p_impostor_count) roles;
  select array_agg(id) into v_jester_ids from (select id from players where lobby_id = p_lobby_id and presence_status <> 'away' and not (id = any(coalesce(v_impostor_ids, '{}'::uuid[]))) order by random() limit p_jester_count) roles;
  select get_lobby_categories(p_lobby_id) into v_source_categories;
  insert into rounds (lobby_id, round_number, word, hint, pack_id, source_categories, impostor_ids, jester_ids, phase)
  values (p_lobby_id, v_round_number, trim(p_word), coalesce(p_hint, ''), coalesce(p_pack_id, 'everyday'), coalesce(v_source_categories, array['Everyday']::text[]), coalesce(v_impostor_ids, '{}'::uuid[]), coalesce(v_jester_ids, '{}'::uuid[]), 'role_reveal') returning * into v_round;
  insert into lobby_word_history (lobby_id, word_key, round_id) values (p_lobby_id, v_word_key, v_round.id);
  insert into round_player_states (round_id, player_id) select v_round.id, id from players where lobby_id = p_lobby_id and presence_status <> 'away' on conflict do nothing;
  update lobbies set status = 'playing' where id = p_lobby_id;
  select name into v_host_name from players where lobby_id = p_lobby_id and user_id = auth.uid() limit 1;
  perform add_lobby_event(p_lobby_id, 'round_started', v_host_name, null, v_host_name || ' started round ' || v_round.round_number || '.');
  return json_build_object('round', json_build_object('id', v_round.id, 'round_number', v_round.round_number, 'phase', v_round.phase, 'pack_id', v_round.pack_id, 'source_categories', to_json(v_round.source_categories), 'started_at', v_round.started_at, 'discussion_duration', 60, 'ready_to_discuss_count', 0, 'ready_to_discuss_total', v_player_count, 'vote_progress', null));
end;
$$;
create or replace function start_next_round(p_lobby_id uuid, p_word text, p_hint text, p_pack_id text, p_impostor_count integer default 1, p_jester_count integer default 0)
returns json language sql security definer set search_path = public as $$ select start_round(p_lobby_id, p_word, p_hint, p_pack_id, p_impostor_count, p_jester_count); $$;

create or replace function submit_final_impostor_guess(p_round_id uuid, p_guess text)
returns json language plpgsql security definer set search_path = public as $$
declare v_round rounds; v_player_id uuid; v_correct boolean;
begin
  select * into v_round from rounds where id = p_round_id for update;
  if v_round.id is null or v_round.phase <> 'final_impostor_guess' then raise exception 'No final guess is pending'; end if;
  select id into v_player_id from players where lobby_id = v_round.lobby_id and user_id = auth.uid() limit 1;
  if v_player_id is null or v_player_id <> v_round.eliminated_player_id or not (v_player_id = any(v_round.impostor_ids)) then raise exception 'Only the caught impostor can guess'; end if;
  v_correct := lower(trim(coalesce(p_guess, ''))) = lower(trim(v_round.word));
  update rounds set final_guess = jsonb_build_object('player_id', v_player_id, 'guess', trim(p_guess)), final_guess_correct = v_correct, phase = 'results', ended_at = now() where id = p_round_id;
  update lobbies set status = 'waiting' where id = v_round.lobby_id;
  return json_build_object('round_id', p_round_id, 'phase', 'results', 'final_guess_correct', v_correct);
end;
$$;

revoke all on function get_recent_lobby_words(uuid, integer), submit_final_impostor_guess(uuid, text) from public;
grant execute on function get_recent_lobby_words(uuid, integer), submit_final_impostor_guess(uuid, text) to authenticated;

create or replace function finish_round(p_round_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_round rounds; v_eliminated uuid; v_eliminated_name text; v_top_targets uuid[]; v_tie boolean := false;
  v_impostor_caught boolean := false; v_jester_caught boolean := false; v_summary json; v_impostors json;
begin
  select * into v_round from rounds where id = p_round_id for update;
  if v_round.id is null then raise exception 'Round not found'; end if;
  if not exists (select 1 from lobbies where id = v_round.lobby_id and host_id = auth.uid()) then raise exception 'Only the host can finish the round'; end if;
  if v_round.phase <> 'voting' then raise exception 'Round is not in voting phase'; end if;
  with grouped as (
    select target_id, count(*)::int as vote_count from votes where round_id = p_round_id group by target_id
  ), top_votes as (
    select target_id from grouped where vote_count = (select max(vote_count) from grouped)
  ) select array_agg(target_id order by target_id) into v_top_targets from top_votes;
  if coalesce(array_length(v_top_targets, 1), 0) = 1 then
    v_eliminated := v_top_targets[1];
  elsif coalesce(array_length(v_top_targets, 1), 0) > 1 then v_tie := true; end if;
  if v_eliminated is not null then
    select name into v_eliminated_name from players where id = v_eliminated;
    v_impostor_caught := v_eliminated = any(v_round.impostor_ids);
    v_jester_caught := v_eliminated = any(v_round.jester_ids);
  end if;
  select coalesce(json_agg(json_build_object('target_id', target_id, 'vote_count', vote_count) order by vote_count desc, target_id), '[]'::json) into v_summary from (select target_id, count(*)::int as vote_count from votes where round_id = p_round_id group by target_id) grouped;
  select coalesce(json_agg(json_build_object('id', id, 'name', name) order by joined_at), '[]'::json) into v_impostors from players where id = any(v_round.impostor_ids);
  if v_impostor_caught then
    update rounds set phase = 'final_impostor_guess', eliminated_player_id = v_eliminated where id = p_round_id;
    return json_build_object('round_id', p_round_id, 'phase', 'final_impostor_guess', 'impostors_caught', true, 'eliminated_player_id', v_eliminated, 'eliminated_player_name', v_eliminated_name, 'vote_summary', v_summary, 'is_tie', false);
  end if;
  update rounds set phase = 'results', ended_at = now(), eliminated_player_id = v_eliminated where id = p_round_id;
  update lobbies set status = 'waiting' where id = v_round.lobby_id;
  return json_build_object('round_id', p_round_id, 'phase', 'results', 'word', v_round.word, 'hint', v_round.hint, 'impostors_caught', false, 'jester_won', v_jester_caught, 'impostors', v_impostors, 'eliminated_player_id', v_eliminated, 'eliminated_player_name', v_eliminated_name, 'vote_summary', v_summary, 'is_tie', v_tie);
end;
$$;
