"""Record / compare response shapes of the existing football endpoints.

Usage (service must be running):
    python tests/record_baseline.py record  <out_dir> [--base http://localhost:8000]
    python tests/record_baseline.py compare <baseline_dir> [--base http://localhost:8000]

`record` stores the full JSON body and a shape summary (field names + JSON types) per endpoint.
`compare` re-calls every endpoint and reports fields/types that were removed or changed versus the
baseline. Fields that were added are reported as additions (allowed). Values are never compared,
only structure, so live data changing between runs is not a diff. No API keys are read or printed.
"""
import json
import sys
from pathlib import Path

import httpx

ENDPOINTS = {
    "matches": "/api/matches?date=2026-10-31",
    "team_barcelona": "/api/team/barcelona",
    "api_football_live": "/api/football/api-football/live",
    "api_football_timeline": "/api/football/api-football/timeline/1208021",
    "api_football_lineups": "/api/football/api-football/lineups/1208021",
    "football_data_standings_pd": "/api/football/football-data/standings/PD",
    "barcelona_tracker": "/api/football/teams/barcelona/tracker",
    "understat_shots": "/api/football/understat/shots/22676",
    "combined_matches": "/api/football/combined-matches?date_str=2026-10-31",
}


def shape(value):
    if isinstance(value, dict):
        return {k: shape(v) for k, v in sorted(value.items())}
    if isinstance(value, list):
        return [shape(value[0])] if value else []
    if value is None:
        return "null"
    return type(value).__name__


def diff(base, new, path=""):
    """Yield (kind, path, detail). kind in removed | type_changed | added."""
    if isinstance(base, dict) and isinstance(new, dict):
        for k in base:
            if k not in new:
                yield ("removed", f"{path}.{k}", base[k])
            else:
                yield from diff(base[k], new[k], f"{path}.{k}")
        for k in new:
            if k not in base:
                yield ("added", f"{path}.{k}", new[k])
    elif isinstance(base, list) and isinstance(new, list):
        if base and new:
            yield from diff(base[0], new[0], f"{path}[]")
    elif base != new and "null" not in (base, new):
        yield ("type_changed", path, f"{base} -> {new}")


def fetch(base_url, path):
    try:
        r = httpx.get(base_url + path, timeout=90)
        try:
            body = r.json()
        except ValueError:
            body = {"_non_json": r.text[:200]}
        return r.status_code, body
    except Exception as exc:  # network failure is recorded, not raised
        return 0, {"_error": type(exc).__name__}


def main(argv):
    if len(argv) < 2 or argv[0] not in ("record", "compare"):
        print(__doc__)
        return 2
    mode, out = argv[0], Path(argv[1])
    base_url = argv[argv.index("--base") + 1] if "--base" in argv else "http://localhost:8000"
    exit_code = 0
    if mode == "record":
        out.mkdir(parents=True, exist_ok=True)
    for name, path in ENDPOINTS.items():
        status, body = fetch(base_url, path)
        if mode == "record":
            (out / f"{name}.json").write_text(
                json.dumps({"path": path, "status": status, "shape": shape(body), "body": body}, indent=2, ensure_ascii=False),
                encoding="utf-8",
            )
            print(f"recorded {name}: HTTP {status}")
            continue
        saved = json.loads((out / f"{name}.json").read_text(encoding="utf-8"))
        problems = [d for d in diff(saved["shape"], shape(body)) if d[0] != "added"]
        added = [d for d in diff(saved["shape"], shape(body)) if d[0] == "added"]
        print(f"{name}: HTTP {status} (baseline {saved['status']}) removed/changed={len(problems)} added={len(added)}")
        for kind, p, detail in problems:
            print(f"   {kind} {p}: {detail}")
        for kind, p, _ in added:
            print(f"   added(optional) {p}")
        if problems or status >= 500:
            exit_code = 1
    return exit_code


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

