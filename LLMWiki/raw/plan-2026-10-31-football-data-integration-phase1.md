# Football Data Integration: Phase 1 Audit & Plan (2026-10-31)

Scope: [[Football_Center]] data pipeline in [[FastF1TelemetryBackend]] (`apps/telemetry`) and [[ManjaniumSportsHub]] (`apps/hub`). No code was changed in Phase 1. Related: [[FotMobAPI]], [[ReactSVGShotmap]], [[DeadCodeAndDependencyHygiene]].

## 1. Current state

### 1.1 Backend football endpoints (`apps/telemetry/main.py`)
| Path | Provider | Params | Tested here (no keys set) |
|---|---|---|---|
| `GET /api/matches` | API-Football `/fixtures?date=` | `date` (required, YYYY-MM-DD) | 200, `source:"fallback"`, **fabricated** Sept-19 fixtures (Barca 2-1 Real "live") |
| `GET /api/team/barcelona` | API-Football `/standings`, `/fixtures?team=529&next=1` | none (season hardcoded 2026) | 200, **invented** rank 1 / 12 pts / "WWWWW" / next fixture Girona; **not cached** (2 provider calls per request when keyed) |
| `GET /api/football/api-football/live` | API-Football `/fixtures?live=all` | none | 200 `{"status":"api_key_required","data":[]}` |
| `GET /api/football/api-football/timeline/{id}` | API-Football `/fixtures/events` | fixture id | 200 `api_key_required` |
| `GET /api/football/api-football/lineups/{id}` | API-Football `/fixtures/lineups` | fixture id | 200 `api_key_required` |
| `GET /api/football/football-data/standings/{code}` | football-data.org `/competitions/{code}/standings` | PD, PL, BL1, SA, FL1, CL | 200 `api_key_required`, `table:[]` |
| `GET /api/football/teams/barcelona/tracker` | football-data.org (3 calls) | none | 200 `api_key_required`, placeholder `"-"` ranks plus fabricated `recent_form` WWDWW |
| `GET /api/football/understat/shots/{id}` | Understat via `understat` lib (**scrapes understat.com**) | Understat match id | 200 real data, but id 22676 = Cagliari v Fiorentina (frontend default for "Barca v Real") |
| `GET /api/football/combined-matches` | API-Football, else football-data.org | `date_str` | 200 `{"total_matches":0,"leagues":[]}` (no key) |

Env: `API_FOOTBALL_KEY`/`RAPIDAPI_KEY`, `FOOTBALL_DATA_ORG_KEY`/`FOOTBALL_DATA_KEY` are all **unset** (process env, `apps/telemetry/.env` absent, hub `.env.local` has no football keys). `apps/telemetry/.env.example` documents them. `.env` is gitignored.

### 1.2 Frontend consumers
| Caller | Calls | Fields consumed |
|---|---|---|
| `app/football/page.tsx:223` | **`http://localhost:8000/api/matches?date=`** (hardcoded, browser-side) then proxy | `leagues[]` / grouped dict -> `match_id, home_team, home_flag, home_score, away_*, status, minute, live, finished, started, kickoff, league_name, understat_id` |
| `app/football/page.tsx:229` | `/api/football/fotmob/matches?date=YYYYMMDD` -> `combined-matches?date_str=YYYYMMDD&expand_days=3` | same shape |
| `page.tsx:390/392` | `localhost:8000/api/team/barcelona`, then `/teams/barcelona/tracker` | `data.la_liga / rank / team / next_match / recent_form` |
| `page.tsx:485` | `localhost:8000/api/football/understat/shots/{understat_id || '22676'}` | `data.shots[], xG_momentum[], home_team, away_team` |
| `app/football/[matchId]`, `matches/[matchId]` | Next routes `/api/football/matches/{id}/{details,commentary,stats}` | proxies **ESPN** `site.api.espn.com/.../fifa.world/summary` (unofficial) |

**Never called by any frontend code (verified by search):** `api-football/live`, `timeline`, `lineups`, `football-data/standings`.

### 1.3 Why things return nothing / wrong data (root causes)
1. **Missing keys**: both providers unset, so every keyed endpoint returns empty or fallback.
2. **Fabricated fallbacks presented as real**: `DEFAULT_MATCHDAY_FIXTURES`, Barca defaults and the tracker's fake form (backend); `fallbackGroups`, `INITIAL_LA_LIGA_STANDINGS`, `SAMPLE_UNDERSTAT_SHOTS`, sample xG momentum, hardcoded timeline (Yamal/Lewandowski/Mbappé), fallback Barca tracker (frontend `page.tsx:102-113, 253-471, 497-521`). Violates the strict-data-accuracy rule.
3. **Standings tab is static**: `const [standings] = useState(INITIAL_LA_LIGA_STANDINGS)` is never fetched.
4. **Timeline tab is static**: `setTimelineEvents([...hardcoded])` on every match select.
5. **Wrong IDs**: shotmap uses Understat id `'22676'` for any match without `understat_id`; no API-Football-to-Understat mapping exists. `league_id` is mixed: `140/39/2` (API-Football), `PD/PL/CL` (football-data), `87/47` (FotMob IDs in frontend fallback). Barca is `529` in `/api/team/barcelona` but `81` in the tracker.
6. **Param bug**: proxy sends `date_str=20261031` (YYYYMMDD); backend expects `YYYY-MM-DD`. `expand_days` is ignored.
7. **Quota burn**: `/api/team/barcelona` has no cache; `cache_live_fixtures` (maxsize 32) is shared by live scores and every date key, so entries evict each other.
8. **Quota/auth errors are masked**: 429 returns HTTP 200 with a `status` field, other upstream errors become 500, and nothing tracks usage.
9. **Understat is scraping**: conflicts with the "official APIs only" rule. The ESPN routes are also an undocumented API (existing, World Cup-only).

## 2. Verified provider limits
| Provider | Verified (source) | Free tier |
|---|---|---|
| **football-data.org** | Official pricing page fetched 2026-10-31: https://www.football-data.org/pricing and /coverage | 12 competitions (CL, PL, PD, BL1, SA, FL1, Primeira, Eredivisie, Championship, Brasileirao A, World Cup, Euros); **scores delayed**; fixtures, schedules (delayed), league tables; **10 calls/min**. Paid-only: live scores (EUR 12), line-ups/subs, goal scorers, bookings (EUR 29), squads, stats add-on (EUR 15). Daily cap: none stated. |
| **API-Football** | **NOT verified from official page**: api-football.com / api-sports.io return Cloudflare 403 to automated fetch. Search results attributed to the official site say: Free = 100 req/day, 10 req/min, all endpoints, reset 00:00 UTC | **UNVERIFIED RISK**: the free plan reportedly blocks the *current season* (error "Free plans do not have access to this season"). If true, live scores, lineups and events for the 2026 season are paid-only. **Must be confirmed with your dashboard / one real call.** Score delay not documented. |
| **PitchAPI** | Official docs fetched: https://pitchapi.dev | Free, no card, **no advertised request limit** (unadvertised fair-use burst guard -> 429 + Retry-After). 77 leagues, history to 2021, shots (xG/xGOT, coordinates), lineups, momentum, events, stats, advanced/pass-network. Docs say listings are historical by default and a pre-kickoff lineup may be a prediction; "post-match only" is from third-party summaries. **Live support unverified.** Requires `X-API-KEY`. |
| ESPN (existing) | Unofficial; no docs | Works today (tested: World Cup event 760517, 173 commentary items). Not extendable under the official-only rule. |
| Understat (existing) | Scraping library | Works today; non-compliant with the rule. |

Unverified claims: API-Football free season access; API-Football score delay; football-data free score delay (unquantified); football-data free `/scorers` access (not on the pricing page; test with a real key); PitchAPI live coverage and exact burst limit.

## 3. Plan
| Feature | Primary | Fallback | Endpoint | TTL | Est. calls/day |
|---|---|---|---|---|---|
| Live matches | API-Football `fixtures?live=all` (only if free key allows current season) | football-data `/matches` (delayed) | existing `/api/matches`, `/api/football/combined-matches` | 60s on poll, poll every 10 min free budget, only while a match is live | AF ≤48 |
| Fixtures (by date) | football-data `/matches?dateFrom&dateTo` (all 12 comps in 1 call) | API-Football `fixtures?date` | same | 1 h (live day: 15 min) | FD 24 |
| Match events/timeline | API-Football `fixtures/events` | PitchAPI `matches/{id}/events` (post-match) | existing `timeline/{id}` | live 120s; finished permanent | AF ≤10, PA 15 |
| Lineups | API-Football `fixtures/lineups` | PitchAPI lineups | existing `lineups/{id}` | until FT then permanent | AF ≤12 |
| Match stats | PitchAPI `matches/{id}/stats` | none free | new optional field | permanent once finished | PA 15 |
| Standings | football-data `/competitions/{c}/standings` | API-Football `standings` | existing `standings/{code}` | 15 min in match window, 3 h otherwise | FD 270 |
| Top scorers | football-data `/competitions/{c}/scorers` (**verify free**) | API-Football `players/topscorers` | **new** `/api/football/scorers/{code}` | 1 h | FD ≤72 |
| Shot map | PitchAPI `matches/{id}/shots` (replaces Understat scraping) | none (empty, no fake) | existing `understat/shots/{id}` (same shape, source changes) | permanent once finished | PA 15 |
| Team / Barca pages | derived from cached standings + 1 team-matches call | API-Football | existing tracker + `/api/team/barcelona` | 1 h | FD 24 |
| World Cup groups/brackets | football-data `WC` standings/matches (free, tournament over) | existing ESPN routes untouched | n/a | finished = permanent | ≈0 |

## 4. Daily request budget (all users served from cache, so cost is independent of concurrent users N)
| Provider | Limit | Normal day | Match-day worst case (6 leagues + UCL, 20 matches, 8 h live) | Guard threshold |
|---|---|---|---|---|
| API-Football | 100/day, 10/min | live 24 + lineups 6 + events 6 + on-demand 5 = **41** | live 48 + lineups 12 + events 12 + on-demand 10 = **82** | refuse at 90/day, 8/min; reserve 10 for retries |
| football-data.org | 10/min, no daily cap stated | standings 6x(5 off-peak+8)=78 + fixtures 24 + scorers 24 + team 24 = **150** | 270 + 24 + 72 + 24 = **390** (stagger; peak 6/min) | refuse at 8/min |
| PitchAPI | none advertised | 20 matches x 5 + 24 = **124** | 20 x 5 + 24 = **124** | self-limit 30/min |

Caps are enforced by the quota guard, not predicted: if demand exceeds the cap the guard serves cached data. Per-user cost is zero because users only hit FastAPI cache.

## 5. Architecture
- `apps/telemetry/football/providers/{api_football,football_data,pitchapi}.py`: one adapter per provider returning internal Pydantic models (`Match`, `LeagueGroup`, `Event`, `Lineup`, `StandingRow`, `Scorer`, `Shot`).
- `football/cache.py`: in-memory `TTLCache` per data class (separate stores, fixing the shared-32-slot eviction) plus Supabase persistence table `football_cache(key, provider, payload jsonb, fetched_at, expires_at null=permanent)` for finished matches and standings. New migration; RLS on, service-role only.
- `football/quota.py`: per-provider per-minute and per-day counters (memory + `provider_quota` table so restarts don't reset), `allow(provider)`, 429/403 detection, circuit breaker, ordered fallback: cache -> secondary provider -> stale cache -> honest empty (`status`, `data: []`).
- `football/ids.py` + table `football_id_map(entity, canonical_id, provider, provider_id)`: leagues (PL = 39 AF / PL FD / PitchAPI `l_...`), teams (Barca = 529 / 81 / PitchAPI), matches. The `PD/PL` vs `140/39` mismatch is fixed only here.
- Existing endpoints keep path and response shape; they call adapters through a shape serializer verified against baseline fixtures.
- Frontend never calls providers; only FastAPI. The hardcoded `localhost:8000` URLs become the hub proxy (`TELEMETRY_API_URL`) in Phase 2 step 8.
- Live polling only while a fixture is `1H/2H/HT/ET/P`; finished matches fetched once and stored permanently.
- Missing key: provider marked `disabled` at startup (warning logged), app still boots; endpoints return documented empty responses.

## 6. Risks to existing behavior and tests
| Risk | Test |
|---|---|
| Response shape drift | Baseline JSON fixtures (step 1) diffed field/type per endpoint |
| Removing fabricated fallbacks changes what users see (empty states) | Needs your approval; test /football renders empty-state with no console errors |
| `/api/matches` spreads league names as top-level keys (`**grouped_matches`) | Preserve in serializer; fixture diff |
| Cache TTL change shifts freshness | Unit tests with a fake clock |
| Quota guard blocks too early | Simulated exhaustion test; fallback returns cached data and no 500 |
| ID mapping changes `league_id`/team ids the UI keys on | Mapping unit tests; page keyed on string ids; UI smoke test |
| Understat -> PitchAPI changes shot coordinate scale | Normalize to 0..1 in adapter; test ShotmapPitch with recorded sample |
| New env vars missing in prod | Startup test with no keys -> boots, all routes return 200 |
| Provider timeout | Mocked `httpx` timeout -> fallback/stale served |
| Supabase table writes fail | Persistence layer must be best-effort; test with no Supabase env |
| `date` proxy bug fix (YYYYMMDD) | Backend accepts both formats; test both |
| No pytest in `apps/telemetry/.venv` | Add pytest as dev dependency in Phase 2 |

## 7. Decisions requested
1. Replace fabricated fallbacks with honest empty states? (conflicts with "don't change visible behavior")
2. Replace Understat scraping with PitchAPI (official), losing live shotmaps?
3. Leave the ESPN World Cup routes as-is (unofficial) or retire them later?
4. Provide `API_FOOTBALL_KEY`, `FOOTBALL_DATA_ORG_KEY`, `PITCHAPI_API_KEY` for Phase 2 live verification.
5. Allow new Supabase tables (`football_cache`, `provider_quota`, `football_id_map`) via a new migration.

