# Component & Pipeline Integration: Interactive SVG Attacking Half-Pitch Shotmap

**Timestamp:** 2026-09-19T16:18:00+05:30  
**Tags:** [[Football Data]], [[Understat]], [[ShotmapPitch]], [[SVG Visualization]], [[Framer Motion]], [[Telemetry HUD]], [[Stitch Design System]]

## What Was Built
1. **Interactive SVG Pitch Component (`ShotmapPitch.tsx`)**:
   - Mapped Understat's normalized `[0, 1]` float coordinates to real-world pitch dimensions using `viewBox="0 0 68 52.5"` (105m × 68m attacking half-pitch).
   - Eliminated elliptical distortion of the D-arc, penalty arc, and penalty spot across responsive viewports.
   - Built an interactive glassmorphic telemetry HUD overlay displaying live xG telemetry, player, minute, outcome, and assist on hover.
   - Added spring-physics animated `<motion.circle>` nodes with radius proportional to xG and colors mapped to [[Stitch Design System]] telemetry accents.
   - Added defensive normalization to seamlessly support both `0.0–1.0` and `0–100` coordinate schemas.

2. **Telemetry Service Backend (`main.py`)**:
   - Preserved raw `0.0–1.0` float coordinates in the `/api/football/understat/shots/{match_id}` endpoint.

3. **Frontend Integration (`page.tsx`)**:
   - Mounted `ShotmapPitch` into the right-hand match details inspector column, bypassing WebGL overhead.
   - Normalized default `SAMPLE_UNDERSTAT_SHOTS` to 0–1 float coordinates.

## Files Changed
- `Manjanium_App/apps/hub/src/components/football/ShotmapPitch.tsx`
- `Manjanium_App/apps/hub/src/app/football/page.tsx`
- `Manjanium_App/apps/telemetry/main.py`
- `context.md`

## Verification
- Run `pnpm --filter hub build` exited 0 with all 25 pages generated cleanly.
