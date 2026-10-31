# FastF1 Telemetry Backend

Tags: #entity #backend #fastapi #telemetry #python

## Overview
The **FastF1 Telemetry Backend** (`apps/telemetry`) is the Python `FastAPI` service that powers high-frequency Formula 1 telemetry, live session streaming, and multi-API football data aggregation for [[Manjanium_On_Softs]] (`[[ManjaniumSportsHub]]`).

## Architecture & Modules
- **`apps/telemetry/main.py`**: Primary FastAPI application exposing 18 routes across F1 telemetry and Football data pipelines:
  - **F1 Telemetry (`FastF1`)**: Distance-synchronized lap comparisons (`/api/compare-laps`), available sessions (`/api/available-sessions`), and session drivers (`/api/session-drivers`) backed by an ephemeral `/tmp` cache.
  - **Football Multi-API Aggregation**:
    - **API-Football**: Live fixtures (`/api/matches`, `/api/football/api-football/live`), timelines, and starting XI lineups.
    - **Football-Data.org**: League standings and the pinned FC Barcelona tracker (`/api/team/barcelona`, `/api/football/teams/barcelona/tracker`).
    - **Understat**: Normalized `(0.0–1.0)` shot coordinates and cumulative xG curves (`/api/football/understat/shots/{match_id}`) for `[[ReactSVGShotmap]]`.
    - **FotMob & WorldCup26**: Combined match feeds (`/api/football/combined-matches`) and XML fallback parsing (`[[XMLParsingFastAPI]]`).
- **`apps/telemetry/live.py`**: Asynchronous `OpenF1` poller and WebSocket manager streaming live F1 timing, intervals, race control messages, weather, and camelCase driver metadata to [[F1_Hub]].

## Hygiene & Verification
- Verified during [[DeadCodeAndDependencyHygiene]] (commit `68f4074`): removed unused imports, dead helper functions (`resolve_team_name`, `get_worldcup_teams`, `cache_team_fixtures`), and scratch scripts while preserving all 18 active FastAPI routes.

## Related
- [[ManjaniumSportsHub]]
- [[F1_Hub]]
- [[Football_Center]]
- [[XMLParsingFastAPI]]
- [[ReactSVGShotmap]]
- [[DeadCodeAndDependencyHygiene]]

