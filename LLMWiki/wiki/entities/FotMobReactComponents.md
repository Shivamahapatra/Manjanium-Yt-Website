# FotMob React Components

These are the core frontend components used in the [[Football_Center]] to display data fetched from the [[FotMobAPI]].

## Components

- **FotmobMatchCard**: Displays live match scores, kickoff times, and minute indicators. Uses a lazy-loading pattern to fetch match details only when the user expands the card. This protects against rate limits.
- **FotmobMatchDetail**: A 4-tab panel that renders the expanded match data.
  - **Stats**: Visual bars for comparing metrics (possession, shots, etc).
  - **Lineup**: Starting XI with color-coded player ratings.
  - **Shotmap**: Custom SVG pitch rendering. See [[ReactSVGShotmap]].
  - **Timeline**: Goals, cards, and a momentum bar visualizer.
- **FotmobStandings**: Interactive standings table supporting xG and xGA columns, with a switcher for the top 6 leagues.
- **FotmobLiveMatches**: A feed of matches that auto-refreshes every 30 seconds.

## Design Integration
These components are styled using the [[Stitch_Design_System]], heavily utilizing framer-motion for smooth expansions, and `bg-[#0a0a0a]/80 backdrop-blur-md` for the signature glassmorphic effect. The accent color used for Football is `#10B981` (Green).
