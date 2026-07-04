# React SVG Shotmap (UX Pattern)

A core feature of the [[FotMobReactComponents]] is the ability to visualize shot locations and Expected Goals (xG) on a 2D pitch.

## Implementation Details

Instead of relying on heavy Canvas or WebGL libraries, the shotmap is implemented purely using inline SVG in React. This provides several benefits:
- **Zero Dependencies**: Keeps the bundle size small.
- **Crisp Rendering**: SVGs scale perfectly across all device resolutions without pixelation.
- **Easy Styling**: The pitch and shots can be easily colored using standard Tailwind classes and [[Stitch_Design_System]] tokens (e.g., `#10B981` for goals).

### The Pitch
The pitch is drawn using standard SVG elements:
- `<rect>` for the pitch boundaries and penalty boxes.
- `<circle>` for the center circle.
- `<line>` for the halfway line.

### Coordinates Mapping
FotMob's API returns shot locations as `(x, y)` coordinates. These are mapped directly to SVG `<circle>` coordinates. 
Because FotMob returns the `x, y` relative to the attacking team, the component dynamically flips the `x` coordinate (`100 - x`) for away teams to ensure they shoot towards the opposite goal.

### Lazy Loading
Because shotmap data requires fetching the full match details (which is a heavy API call to the [[FotMobAPI]]), the shotmap component is strictly lazy-loaded. It is only rendered, and the data is only fetched, when a user explicitly expands a `FotmobMatchCard`.
