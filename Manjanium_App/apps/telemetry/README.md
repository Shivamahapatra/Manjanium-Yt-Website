# Manjanium Telemetry API

FastF1-powered Python backend for F1 telemetry comparisons.

## Setup

```bash
cd apps/telemetry

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Mac/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
python main.py
```

## Endpoints

- `GET /health` — Health check
- `GET /api/compare-laps` — Distance-synchronized lap comparison
- `GET /api/available-sessions` — List events for a season
- `GET /api/session-drivers` — List drivers in a session

## Environment Variables

```env
FASTF1_CACHE_DIR=/tmp/fastf1_cache  # Cache location
HUB_URL=https://your-hub-url.vercel.app  # CORS origin
PORT=8000
```
