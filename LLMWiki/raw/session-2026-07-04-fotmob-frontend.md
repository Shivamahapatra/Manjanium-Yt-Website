# Session: FotMob Frontend Integration

Date: 2026-07-04
Status: Completed

## Components Built

### FotmobMatchCard.tsx
Expandable match card with:
- Live score display with team logos (images.fotmob.com CDN)
- Minute indicator for live matches
- Click to expand match details
- Lazy loads detail data on expand

### FotmobMatchDetail.tsx
4-tab detail panel:
- Stats: visual bar comparisons for all stat groups
- Lineup: XI per team with player ratings (color coded)
- Shotmap: SVG pitch visualization with xG per shot
- Timeline: goal/card/sub events + momentum bar

### FotmobStandings.tsx
League standings with:
- League switcher (6 major leagues)
- xG and xGA columns
- Win/draw/loss color coded
- Season label

### FotmobLiveMatches.tsx
Live matches feed:
- filterLive prop for live-only mode
- Groups by league
- 30-second auto-refresh
- Last updated timestamp

## Preset Updates
- FootballPresetLiveMatches: 2/3 matches + 1/3 standings
- FootballPresetStandingsFocus: Full xG standings
- FootballPresetCompactStats: 3-column live/today/table

## FotMob CDN for Team Logos
https://images.fotmob.com/image_resources/logo/teamlogo/{team_id}_small.png

## Key Design Decisions
- Match details lazy-loaded (not pre-fetched, saves API calls)
- SVG shotmap drawn in React (no canvas, no WebGL)
- 30s refresh on match feed (not 60s - more responsive)
- xG shown to 1 decimal place in standings, 2 in shotmap
