/**
 * security.mjs — real-Postgres regression harness for the WordMask security fixes.
 *
 * Runs an ephemeral PostgreSQL 18 (embedded-postgres, no Docker), reconstructs the parts of the
 * Supabase environment that make the findings reproducible — the `anon`/`authenticated`/`service_role`
 * roles, `auth.users` + `auth.uid()`, Supabase's `ALTER DEFAULT PRIVILEGES ... GRANT ALL ON TABLES
 * TO anon, authenticated`, and the `supabase_realtime` publication — then:
 *
 *   1. applies migrations 001–012 and PROVES the pre-fix leaks (C1 word/role, H1 live votes, H2 lobbies),
 *   2. applies 013 and PROVES each leak is closed at the DB trust boundary,
 *   3. drives a full multiplayer round through the real RPCs to prove the fix didn't break gameplay, and
 *   4. runs adversarial probes against community packs, chat, votes, and role secrecy.
 *
 * The security-critical reads run with `SET LOCAL ROLE authenticated` so RLS + column/table GRANTs are
 * actually enforced (a superuser would bypass them). SECURITY DEFINER RPCs are invoked with the JWT
 * claim GUC set, exactly as PostgREST would, so their internal auth.uid() checks are exercised.
 *
 * Run:  node supabase/tests/security.mjs
 */
import EmbeddedPostgres from 'embedded-postgres'
import { readFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = join(HERE, '..', 'migrations')

// ---- fixed test identities ----------------------------------------------------------------------
const U = {
  host: '11111111-1111-1111-1111-111111111111',
  alice: '22222222-2222-2222-2222-222222222222',
  bob: '33333333-3333-3333-3333-333333333333',
  outsider: '44444444-4444-4444-4444-444444444444',
}
const LOBBY = 'b0000000-0000-0000-0000-000000000001'
const P = {
  host: 'a0000000-0000-0000-0000-000000000001',
  alice: 'a0000000-0000-0000-0000-000000000002',
  bob: 'a0000000-0000-0000-0000-000000000003',
}
const CODE = 'ABC123'
const userForPlayer = (pid) =>
  pid === P.host ? U.host : pid === P.alice ? U.alice : pid === P.bob ? U.bob : null

// ---- tiny test runner ----------------------------------------------------------------------------
let passed = 0
const failures = []
function check(name, cond, detail) {
  if (cond) {
    passed++
    console.log('  ✓ ' + name)
  } else {
    failures.push(name + (detail ? ` — ${detail}` : ''))
    console.log('  ✗ ' + name + (detail ? ` — ${detail}` : ''))
  }
}
async function checkThrows(name, fn, matchRe) {
  try {
    await fn()
    failures.push(`${name} (expected an error, none thrown)`)
    console.log('  ✗ ' + name + ' (expected an error, none thrown)')
  } catch (e) {
    const msg = String(e?.message ?? e)
    if (!matchRe || matchRe.test(msg)) {
      passed++
      console.log('  ✓ ' + name)
    } else {
      failures.push(`${name} (unexpected error: ${msg})`)
      console.log('  ✗ ' + name + ` (unexpected error: ${msg})`)
    }
  }
}

const dataDir = mkdtempSync(join(tmpdir(), 'wm-pg-sec-'))
const engine = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'postgres',
  password: 'postgres',
  port: 54331,
  persistent: false,
  // Force UTF8 like production Supabase — the machine locale is WIN1252, which cannot store the
  // 👍 emoji that migration 009 seeds into room_messages. C locale keeps collation deterministic.
  initdbFlags: ['--encoding=UTF8', '--locale=C'],
})

let su // superuser client
const claims = (sub) => JSON.stringify({ sub, role: 'authenticated' })

/** Read AS an authenticated user with RLS + GRANTs enforced. Always rolls back. May throw (e.g. permission denied). */
async function probeAs(userId, sql, params = []) {
  await su.query('begin')
  try {
    await su.query(`select set_config('request.jwt.claims', $1, true)`, [claims(userId)])
    await su.query('set local role authenticated')
    const res = await su.query(sql, params)
    return res.rows
  } finally {
    await su.query('rollback')
  }
}

/** Invoke a SECURITY DEFINER RPC as a user (claims set, called as owner like PostgREST). Commits. */
async function rpcAs(userId, sql, params = []) {
  await su.query('begin')
  try {
    await su.query(`select set_config('request.jwt.claims', $1, true)`, [claims(userId)])
    const res = await su.query(sql, params)
    await su.query('commit')
    return res.rows
  } catch (e) {
    await su.query('rollback')
    throw e
  }
}

/**
 * Direct table write AS an authenticated user with RLS ENFORCED (SET LOCAL ROLE authenticated).
 * Unlike rpcAs (which runs as the owner, so RLS is bypassed — correct only for SECURITY DEFINER RPCs),
 * this is what a client's PostgREST `.insert()`/`.update()` hits, so INSERT/UPDATE WITH CHECK policies
 * actually fire. Commits on success; a policy violation throws and rolls back.
 */
async function writeAs(userId, sql, params = []) {
  await su.query('begin')
  try {
    await su.query(`select set_config('request.jwt.claims', $1, true)`, [claims(userId)])
    await su.query('set local role authenticated')
    const res = await su.query(sql, params)
    await su.query('commit')
    return res.rows
  } catch (e) {
    await su.query('rollback')
    throw e
  }
}

async function resetRounds() {
  await su.query('delete from votes')
  await su.query('delete from rounds') // round_secrets cascades (FK on delete cascade)
  await su.query(`update lobbies set status = 'waiting' where id = $1`, [LOBBY])
  await su.query(
    `update players set is_ready = true, is_eliminated = false, presence_status = 'active', last_seen_at = now() where lobby_id = $1`,
    [LOBBY],
  )
}

async function startRoundSingleWord() {
  const pool = JSON.stringify([{ word: 'apple', hint: 'fruit', category: 'Everyday' }])
  await rpcAs(U.host, `select start_round($1, $2::jsonb, $3, $4, $5)`, [LOBBY, pool, 'everyday', 1, 1])
  const { rows } = await su.query(`select id from rounds where lobby_id = $1 limit 1`, [LOBBY])
  return rows[0].id
}

try {
  console.log('Booting ephemeral PostgreSQL...')
  await engine.initialise()
  await engine.start()
  su = engine.getPgClient()
  await su.connect()

  // ============================================================================================
  // Supabase environment shim (must run as the same role that will create the migration tables,
  // so ALTER DEFAULT PRIVILEGES applies to them exactly as it does in a real Supabase project).
  // ============================================================================================
  console.log('\nReconstructing Supabase environment (roles, auth.uid, default privileges, realtime)...')
  await su.query(`
    create role anon nologin noinherit;
    create role authenticated nologin noinherit;
    create role service_role nologin noinherit bypassrls;

    create schema if not exists auth;
    create table auth.users (id uuid primary key, email text, is_anonymous boolean not null default false);

    create or replace function auth.uid() returns uuid language sql stable as $fn$
      select (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid;
    $fn$;

    grant usage on schema auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to public;
    grant usage on schema public to anon, authenticated, service_role;

    -- The exact Supabase default-grant that turns an RLS SELECT policy into full column exposure.
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
    alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

    create publication supabase_realtime;
  `)

  // ============================================================================================
  // Apply migrations 001..012.
  // ============================================================================================
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => /^\d+_.*\.sql$/.test(f))
    .sort()
  const pre013 = files.filter((f) => f < '013')
  const mig013 = files.find((f) => f.startsWith('013'))
  console.log(`\nApplying ${pre013.length} migrations (001..012)...`)
  for (const f of pre013) {
    try {
      await su.query(readFileSync(join(MIGRATIONS_DIR, f), 'utf8'))
    } catch (e) {
      console.error(`FATAL applying ${f}: ${e.message}`)
      throw e
    }
  }

  // Mirror production: rounds is broadcast over Realtime.
  await su.query(`alter publication supabase_realtime add table public.rounds`)

  // ---- Neutralize a PG recursion landmine in the shipped players_select policy (NOT a security change) ----
  // 002's players_select is `(lobby_id in (select lp.lobby_id from players lp where lp.user_id = auth.uid())) OR true`.
  // The `OR true` makes players world-readable to authenticated (the app's deliberate design) and renders the
  // self-referencing subquery DEAD CODE. But under PostgreSQL 18.4, whenever a *dependent* policy sub-queries
  // players (rounds_select, votes_select, lobby_select, room_messages_select, …), RLS applies players_select to
  // that inner `players` reference, whose subquery references players again → "infinite recursion detected in
  // policy for relation players". We replace it with its exact semantic equivalent `using (true)` so the
  // dependent policies we are actually testing evaluate faithfully. This changes NO visibility: `(…) OR true`
  // and `true` grant identically. (Reported separately as a low-severity latent issue: the dead self-reference
  // should be simplified in-migration; behavior may differ on older deployed PG majors.)
  await su.query(`drop policy "players_select" on players`)
  await su.query(`create policy "players_select" on players for select using (true)`)

  // ---- seed: users, lobby, players ----
  await su.query(
    `insert into auth.users (id, email) values ($1,'h@t'),($2,'a@t'),($3,'b@t'),($4,'o@t')`,
    [U.host, U.alice, U.bob, U.outsider],
  )
  await su.query(
    `insert into lobbies (id, code, host_id, status, config) values ($1,$2,$3,'waiting','{"selected_categories":["Everyday"]}'::jsonb)`,
    [LOBBY, CODE, U.host],
  )
  await su.query(
    `insert into players (id, lobby_id, user_id, name, is_host, is_ready, presence_status, last_seen_at)
     values
       ($1,$4,$5,'Host',true,true,'active',now()),
       ($2,$4,$6,'Alice',false,true,'active',now()),
       ($3,$4,$7,'Bob',false,true,'active',now())`,
    [P.host, P.alice, P.bob, LOBBY, U.host, U.alice, U.bob],
  )

  // ============================================================================================
  // BEFORE THE FIX — prove the leaks exist on schema v12.
  // ============================================================================================
  console.log('\n=== PRE-FIX (schema v12): demonstrating the vulnerabilities ===')

  const beforeRound = await startRoundSingleWord()
  // sanity: secret really is stored on the broadcastable rounds row pre-fix
  const secretOnRounds = (
    await su.query(`select word, impostor_ids from rounds where id = $1`, [beforeRound])
  ).rows[0]

  // C1: a plain lobby member reads the secret word + impostor identities straight off `rounds`.
  const c1rows = await probeAs(U.alice, `select word, impostor_ids from rounds where id = $1`, [beforeRound])
  check(
    'C1 leak reproduced: crewmate reads secret word directly from rounds',
    c1rows.length === 1 && typeof c1rows[0].word === 'string' && c1rows[0].word.length > 0,
    `saw word=${JSON.stringify(c1rows[0]?.word)}`,
  )
  check(
    'C1 leak reproduced: crewmate reads impostor_ids directly from rounds',
    Array.isArray(c1rows[0]?.impostor_ids) && c1rows[0].impostor_ids.length >= 1,
    `saw impostor_ids=${JSON.stringify(c1rows[0]?.impostor_ids)}`,
  )
  check(
    'C1 leak reproduced: authenticated has column SELECT on rounds.word',
    (await su.query(`select has_column_privilege('authenticated','public.rounds','word','SELECT') as p`)).rows[0].p === true,
  )

  // H1: during voting, a member sees everyone else's (voter -> target) choices live.
  await su.query(`update rounds set phase = 'voting' where id = $1`, [beforeRound])
  await rpcAs(U.alice, `select submit_vote($1,$2)`, [beforeRound, P.bob])
  await rpcAs(U.bob, `select submit_vote($1,$2)`, [beforeRound, P.alice])
  const h1before = await probeAs(U.alice, `select voter_id, target_id from votes where round_id = $1`, [beforeRound])
  check(
    'H1 leak reproduced: during voting a voter can read other players’ votes',
    h1before.length === 2,
    `voter Alice saw ${h1before.length} vote rows (expected 2 = the live leak)`,
  )

  // H2: a user who is in no lobby can enumerate all lobbies (code + host).
  const h2before = await probeAs(U.outsider, `select code, host_id from lobbies`)
  check(
    'H2 leak reproduced: non-member can enumerate lobbies',
    h2before.some((r) => r.code === CODE),
    `outsider saw ${h2before.length} lobbies`,
  )

  // ============================================================================================
  // Apply the fix.
  // ============================================================================================
  console.log(`\nApplying ${mig013} ...`)
  await su.query(readFileSync(join(MIGRATIONS_DIR, mig013), 'utf8'))

  // ============================================================================================
  // AFTER THE FIX — prove each leak is closed at the DB boundary.
  // ============================================================================================
  console.log('\n=== POST-FIX (schema v12 + 013): verifying the boundary ===')

  // --- C1 closed: secrets are gone from the broadcastable row and unreadable by clients. ---
  const roundsCols = (
    await su.query(
      `select column_name from information_schema.columns where table_schema='public' and table_name='rounds'`,
    )
  ).rows.map((r) => r.column_name)
  for (const col of ['word', 'hint', 'impostor_ids', 'jester_ids', 'final_guess']) {
    check(`C1 closed: rounds.${col} column removed (cannot be broadcast)`, !roundsCols.includes(col))
  }
  check('C1: public results columns retained on rounds', roundsCols.includes('eliminated_player_id') && roundsCols.includes('final_guess_correct'))

  check(
    'C1 closed: authenticated has NO table SELECT on round_secrets',
    (await su.query(`select has_table_privilege('authenticated','public.round_secrets','SELECT') as p`)).rows[0].p === false,
  )
  await checkThrows(
    'C1 closed: authenticated SELECT on round_secrets is denied',
    () => probeAs(U.alice, `select * from round_secrets`),
    /permission denied/i,
  )
  await checkThrows(
    'C1 closed: authenticated SELECT of rounds.word errors (column gone)',
    () => probeAs(U.alice, `select word from rounds`),
    /column .* does not exist/i,
  )
  const pubTables = (
    await su.query(`select tablename from pg_publication_tables where pubname='supabase_realtime'`)
  ).rows.map((r) => r.tablename)
  check('C1 closed: round_secrets is NOT in the realtime publication', !pubTables.includes('round_secrets'))
  check('C1: rounds remains in the realtime publication (gameplay intact)', pubTables.includes('rounds'))

  // --- C1 functional: roles still resolve correctly; impostor never receives the word. ---
  await resetRounds()
  const fnRound = await startRoundSingleWord()
  const secret = (
    await su.query(`select impostor_ids, jester_ids, word, hint from round_secrets where round_id=$1`, [fnRound])
  ).rows[0]
  const roleOf = {}
  for (const [pid, uid] of [[P.host, U.host], [P.alice, U.alice], [P.bob, U.bob]]) {
    roleOf[pid] = (await rpcAs(uid, `select get_my_role($1) as r`, [fnRound]))[0].r
  }
  const impostorPid = secret.impostor_ids[0]
  check(
    'C1 functional: get_my_role tells the impostor their role but NOT the word',
    roleOf[impostorPid].role === 'IMPOSTOR' && roleOf[impostorPid].word === null && typeof roleOf[impostorPid].hint === 'string',
    JSON.stringify(roleOf[impostorPid]),
  )
  const nonImpostors = [P.host, P.alice, P.bob].filter((p) => p !== impostorPid)
  check(
    'C1 functional: non-impostors receive the real word via get_my_role',
    nonImpostors.every((p) => roleOf[p].word === 'apple'),
    JSON.stringify(nonImpostors.map((p) => roleOf[p])),
  )
  check(
    'C1 functional: a crewmate’s role payload does not reveal impostor identities',
    !('impostor_ids' in roleOf[nonImpostors[0]]) && !('jester_ids' in roleOf[nonImpostors[0]]),
  )

  // --- H1 closed: own vote only during voting; full tally at results. ---
  await su.query(`update rounds set phase='voting' where id=$1`, [fnRound])
  await rpcAs(U.alice, `select submit_vote($1,$2)`, [fnRound, P.bob])
  await rpcAs(U.bob, `select submit_vote($1,$2)`, [fnRound, P.alice])
  const h1during = await probeAs(U.alice, `select voter_id, target_id from votes where round_id=$1`, [fnRound])
  check(
    'H1 closed: during voting a voter sees ONLY their own vote',
    h1during.length === 1 && h1during[0].voter_id === P.alice,
    `Alice saw ${h1during.length} rows`,
  )
  await su.query(`update rounds set phase='results' where id=$1`, [fnRound])
  const h1results = await probeAs(U.alice, `select voter_id, target_id from votes where round_id=$1`, [fnRound])
  check('H1 closed: at results the full tally becomes visible to members', h1results.length === 2, `saw ${h1results.length} rows`)

  // --- H2 closed: only host/members/spectators see the lobby. ---
  check('H2 closed: non-member sees zero lobbies', (await probeAs(U.outsider, `select code from lobbies where code=$1`, [CODE])).length === 0)
  check('H2 intact: member still sees their lobby (realtime works)', (await probeAs(U.alice, `select code from lobbies where code=$1`, [CODE])).length === 1)
  check('H2 intact: host still sees their lobby', (await probeAs(U.host, `select code from lobbies where code=$1`, [CODE])).length === 1)

  // ============================================================================================
  // Full gameplay E2E through the real RPCs (proves the refactor didn’t break the game).
  // ============================================================================================
  console.log('\n=== Full multiplayer round via RPCs (post-fix) ===')
  await resetRounds()
  const gRound = await startRoundSingleWord()
  const gsecret = (await su.query(`select impostor_ids from round_secrets where round_id=$1`, [gRound])).rows[0]
  const imp = gsecret.impostor_ids[0]
  const others = [P.host, P.alice, P.bob].filter((p) => p !== imp)
  await su.query(`update rounds set phase='voting' where id=$1`, [gRound])
  // Both non-impostors vote the impostor; impostor votes an innocent -> impostor is the unique top.
  await rpcAs(userForPlayer(others[0]), `select submit_vote($1,$2)`, [gRound, imp])
  await rpcAs(userForPlayer(others[1]), `select submit_vote($1,$2)`, [gRound, imp])
  await rpcAs(userForPlayer(imp), `select submit_vote($1,$2)`, [gRound, others[0]])
  const finish = (await rpcAs(U.host, `select finish_round($1) as r`, [gRound]))[0].r
  check('E2E: finish_round catches the impostor -> final guess phase', finish.phase === 'final_impostor_guess' && finish.impostors_caught === true, JSON.stringify(finish))
  const fg = (await rpcAs(userForPlayer(imp), `select submit_final_impostor_guess($1,$2) as r`, [gRound, 'apple']))[0].r
  check('E2E: caught impostor guesses the word correctly -> results', fg.phase === 'results' && fg.final_guess_correct === true, JSON.stringify(fg))
  const result = (await rpcAs(U.alice, `select get_round_result($1) as r`, [gRound]))[0].r
  check('E2E: get_round_result reveals the word at results', result.word === 'apple' && result.impostors_caught === true, JSON.stringify(result))
  // stats written by apply_round_statistics
  const impUser = userForPlayer(imp)
  const impStats = (await su.query(`select * from player_statistics where profile_id=$1`, [impUser])).rows[0]
  check('E2E: apply_round_statistics recorded the impostor’s win + word guess', impStats && impStats.games_played === 1 && impStats.impostor_wins === 1 && impStats.words_guessed === 1, JSON.stringify(impStats))
  const totalStats = (await su.query(`select count(*)::int c from player_statistics`)).rows[0].c
  check('E2E: statistics recorded for all three participants', totalStats === 3, `rows=${totalStats}`)

  // --- vote integrity (RPC guards still hold) ---
  await resetRounds()
  const vRound = await startRoundSingleWord()
  await su.query(`update rounds set phase='voting' where id=$1`, [vRound])
  await checkThrows('Vote guard: self-vote rejected', () => rpcAs(U.alice, `select submit_vote($1,$2)`, [vRound, P.alice]), /yourself/i)
  await checkThrows('Vote guard: non-member cannot vote', () => rpcAs(U.outsider, `select submit_vote($1,$2)`, [vRound, P.alice]), /member/i)

  // ============================================================================================
  // Adversarial: community packs, reports, chat.
  // ============================================================================================
  console.log('\n=== Adversarial: community packs / chat ===')
  await su.query(`insert into profiles (id, display_name) values ($1,'Alice'),($2,'Bob') on conflict do nothing`, [U.alice, U.bob])
  // Alice submits a draft (pending) pack through the REAL insert policy (RLS enforced).
  const packRows = await writeAs(
    U.alice,
    `insert into community_packs (creator_id, title, description, language, category, status)
     values ($1,'Alice Draft Pack','A private work in progress pack.','en','Custom','pending') returning id`,
    [U.alice],
  )
  const packId = packRows[0].id
  check('Packs: a legitimate pending draft passes the insert policy', !!packId)
  check('Packs: creator can read their own pending draft', (await probeAs(U.alice, `select id from community_packs where id=$1`, [packId])).length === 1)
  check('Packs: another user CANNOT read someone’s pending draft', (await probeAs(U.bob, `select id from community_packs where id=$1`, [packId])).length === 0)
  await checkThrows(
    'Packs: cannot INSERT a pack attributed to another user (creator_id spoof)',
    () => writeAs(U.bob, `insert into community_packs (creator_id,title,description,language,category,status) values ($1,'Spoofed Pack','Trying to forge ownership here.','en','Custom','pending')`, [U.alice]),
    /row-level security|violates|policy/i,
  )
  await checkThrows(
    'Packs: cannot self-publish (insert must be status=pending)',
    () => writeAs(U.bob, `insert into community_packs (creator_id,title,description,language,category,status) values ($1,'Insta Publish','Attempting to publish without review.','en','Custom','published')`, [U.bob]),
    /row-level security|violates|policy/i,
  )
  await su.query(`update community_packs set status='published', published_at=now() where id=$1`, [packId])
  check('Packs: once published, any authenticated user can read it', (await probeAs(U.bob, `select id from community_packs where id=$1`, [packId])).length === 1)

  // reports are private to the reporter
  await writeAs(U.bob, `insert into community_pack_reports (pack_id, reporter_id, reason) values ($1,$2,'Inappropriate content reported.')`, [packId, U.bob])
  check('Packs: reporter can read their own report', (await probeAs(U.bob, `select id from community_pack_reports where pack_id=$1`, [packId])).length === 1)
  check('Packs: a different user cannot read someone else’s report', (await probeAs(U.alice, `select id from community_pack_reports where pack_id=$1`, [packId])).length === 0)

  // chat visibility is lobby-scoped. (Gameplay also emits 'system' room_messages during the round,
  // so the lobby holds several messages by now — a member must see them all, a non-member none.)
  await su.query(`insert into room_messages (lobby_id, player_id, player_name, kind, body) values ($1,$2,'Alice','text','hello lobby')`, [LOBBY, P.alice])
  const suMsgCount = (await su.query(`select count(*)::int c from room_messages where lobby_id=$1`, [LOBBY])).rows[0].c
  const memberMsgCount = (await probeAs(U.alice, `select id from room_messages where lobby_id=$1`, [LOBBY])).length
  check('Chat: a lobby member can read every message in their lobby', memberMsgCount === suMsgCount && memberMsgCount >= 1, `member saw ${memberMsgCount} of ${suMsgCount}`)
  check('Chat: a non-member cannot read room messages', (await probeAs(U.outsider, `select id from room_messages where lobby_id=$1`, [LOBBY])).length === 0)

  // ============================================================================================
  // M1: every SECURITY DEFINER function in public has search_path pinned.
  // ============================================================================================
  console.log('\n=== M1: SECURITY DEFINER search_path hardening ===')
  const unpinned = (
    await su.query(`
      select p.oid::regprocedure::text as sig
      from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.prosecdef
        and not exists (select 1 from unnest(coalesce(p.proconfig,'{}'::text[])) c where c like 'search_path=%')
    `)
  ).rows.map((r) => r.sig)
  check('M1: no SECURITY DEFINER function is left without search_path', unpinned.length === 0, unpinned.join(', '))

  // ============================================================================================
  console.log(`\n============================================================`)
  console.log(`RESULT: ${passed} passed, ${failures.length} failed`)
  if (failures.length) {
    console.log('FAILURES:')
    for (const f of failures) console.log('  - ' + f)
  }
  console.log(`============================================================`)
} catch (e) {
  console.error('\nHARNESS ERROR:', e?.stack || e?.message || e)
  failures.push('harness crashed: ' + (e?.message ?? e))
} finally {
  try { await su?.end() } catch {}
  try { await engine.stop() } catch {}
  try { rmSync(dataDir, { recursive: true, force: true }) } catch {}
}

process.exit(failures.length ? 1 : 0)
