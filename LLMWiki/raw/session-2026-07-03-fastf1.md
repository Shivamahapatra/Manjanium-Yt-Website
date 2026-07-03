# Session: FastF1 Telemetry Backend Integration

## What was built/fixed
- Created a dedicated Python FastAPI service (`apps/telemetry/`) to serve distance-synchronized F1 telemetry data using the `FastF1` library.
- Refactored `apps/hub/src/components/f1/tabs/F1TelemetryTab.tsx` to handle the new structured payload with dynamic Recharts comparisons (Speed, Delta, Throttle, Gear).
- Updated the Next.js `route.ts` API endpoint to proxy requests directly to the Python backend.
- Configured deployment to Railway with environment variables for seamless Next.js frontend integration.

## Key decisions made and why
- **Python Backend**: FastF1 provides the most accurate and rich telemetry data available for F1, but relies entirely on Python data structures. We created a FastAPI microservice to process Pandas DataFrames into JSON and serve it to our React frontend.
- **Distance-synchronized interpolation**: Raw driver telemetry is rarely aligned perfectly on timestamps. We interpolated all driver traces onto a unified normalized distance grid (e.g. 0 to track length) to allow direct Delta/Speed comparison charts.
- **Railway Deployment**: Python services require heavier dependencies (numpy/pandas) and C++ build tools which Vercel serverless functions struggle with. Railway provides an elegant, scalable runtime for stateful Python services.

## Gotchas and lessons learned
- **Pandas Build failures**: When using vanilla `pip install pandas` on a fresh Windows Python 3.11 environment, compilation from source can fail if MSVC build tools are missing. Always prefer pre-compiled wheel binaries.
- **Railway Monorepo configuration**: When deploying a specific application from a monorepo (like `apps/telemetry`), you must explicitly configure the **Root Directory** in Railway's Source settings to prevent it from building the Next.js workspace root.
- **Cold Starts**: FastF1 requires downloading large amounts of data from the ergast/f1 livetime APIs on first load per session (~50MB), resulting in 30-60 second cold starts.

## Files changed
- `apps/telemetry/main.py`
- `apps/telemetry/requirements.txt`
- `apps/telemetry/.gitignore`
- `apps/telemetry/.python-version`
- `apps/hub/src/app/api/f1/telemetry/route.ts`
- `apps/hub/src/components/f1/tabs/F1TelemetryTab.tsx`
- `apps/hub/.env.local`
- `ping.txt`
- `context.md`

## Next steps
- Add a persistent volume to the Railway deployment to cache FastF1 data across container restarts.
- Add WebSockets to the Python backend for live-race telemetry streaming if required in the future.
