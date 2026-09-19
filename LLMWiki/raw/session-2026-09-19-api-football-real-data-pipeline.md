# Real Data Pipeline: API-Football Direct Live Data & FC Barcelona Telemetry

**Timestamp:** 2026-09-19T16:45:00+05:30  
**Tags:** [[Football Data]], [[API-Football]], [[FastAPI]], [[Next.js 14]], [[FC Barcelona]], [[Live Matches]], [[Telemetry Engine]]

## What Was Implemented
1. **API-Football Live Feeds (`main.py`)**:
   - Implemented `GET /api/matches?date=YYYY-MM-DD` accepting standard dates, pulling from `v3.football.api-sports.io/fixtures`, filtering across top competitions (`SUPPORTED_LEAGUES`: Premier League [39], La Liga [140], Bundesliga [78], Serie A [135], Ligue 1 [61], Champions League [2]), and grouping into both dictionary accordions and normalized `LeagueGroup[]` records.
   - Implemented `GET /api/team/barcelona` querying live La Liga standings, current rank, points, recent form string, and upcoming fixture opponent/date with defensive fallback.
   - Added `dotenv.load_dotenv()` and support for both RapidAPI (`x-rapidapi-key`) and direct API-Sports (`x-apisports-key`) credentials.
   - Preserved all FastF1 F1 telemetry endpoints, Understat shot coordinates, and FotMob proxies.

2. **Frontend Wiring (`apps/hub/src/app/football/page.tsx`)**:
   - Updated `fetchMatches()` to directly query `http://localhost:8000/api/matches?date=${dateStr}` with seamless fallback to Next.js API route proxy.
   - Implemented `parseMatchesData()` to normalize both raw API-Football fixture payloads and pre-grouped records into the reactive center-column feed.
   - Updated `loadBarcaTracker()` to query `http://localhost:8000/api/team/barcelona` and populate the left-column telemetry card.

3. **Dependencies & Environment**:
   - Added `cachetools`, `understat`, `aiohttp`, and `beautifulsoup4` to `apps/telemetry/requirements.txt`.
   - Created `apps/telemetry/.env.example` as configuration template.

## Files Changed
- `Manjanium_App/apps/telemetry/main.py`
- `Manjanium_App/apps/telemetry/requirements.txt`
- `Manjanium_App/apps/telemetry/.env.example`
- `Manjanium_App/apps/hub/src/app/football/page.tsx`
- `.gitignore`
- `context.md`

## Verification
- Python FastAPI routes verified with `.venv\Scripts\python.exe -c "import main; print(len(main.app.routes))"` -> 18 routes active.
- `pnpm --filter hub build` verified: zero errors, 25 static pages generated cleanly.
