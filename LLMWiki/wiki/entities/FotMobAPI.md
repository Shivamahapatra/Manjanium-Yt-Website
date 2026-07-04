# FotMob API

The FotMob API is an unofficial, public API used by Manjanium Sports UI to fetch rich football telemetry and live match data. Because it is unofficial, it requires careful implementation to avoid rate limiting.

## Integration Architecture

We use a proxy pattern to interact with FotMob:
1. **Python FastAPI Backend (`apps/telemetry`)**: Fetches data from FotMob using `httpx`. The API base is now `api.fotmob.com` and returns XML data instead of JSON. The backend parses this using `xml.etree.ElementTree` and checks `Content-Type` headers to handle fallback JSON routes. It also sets specific headers (`User-Agent`, `Referer`, `Origin`) to mimic a standard browser request and avoid 403 Forbidden errors.
2. **Next.js API Routes (`apps/hub/api/football/fotmob/*`)**: Proxies the requests from the frontend client to the Python backend.

## Key Endpoints
- `/matches`: Retrieves all matches for a given date (YYYYMMDD format).
- `/match/{id}`: Detailed match data including xG (expected goals), momentum bars, timelines, and SVG shotmaps.
- `/league/{id}`: League standings, including advanced metrics like xG_for and xG_against.
- `/team/{id}`: Team overview.
- `/search`: Player/team/league search.

## CDN Usage
Team logos are fetched directly from FotMob's CDN in the frontend components, saving backend bandwidth:
`https://images.fotmob.com/image_resources/logo/teamlogo/{team_id}_small.png`

## Best Practices
- **Do not aggressively poll**. 30 seconds is the standard polling interval for live matches feed.
- **Lazy Load Details**: See [[ReactSVGShotmap]] and [[FotMobReactComponents]] for how detailed match data is deferred until a user clicks on a match card to prevent rate limiting.
