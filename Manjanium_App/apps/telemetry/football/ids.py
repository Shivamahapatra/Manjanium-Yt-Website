"""Normalized ID mappings across Top 5 Leagues + Champions League.
Translates codes, numeric IDs, and PitchAPI identifiers.
"""
from typing import Dict, Optional

# Supported Competitions Mapping
LEAGUE_MAP: Dict[str, Dict[str, str]] = {
    # Key = Canonical Competition Code
    "PL": {
        "code": "PL",
        "name": "Premier League",
        "country": "England",
        "api_football_id": "39",
        "football_data_id": "2021",
        "football_data_code": "PL",
        "pitchapi_league_name": "Premier League",
        "logo": "https://crests.football-data.org/PL.png",
    },
    "PD": {
        "code": "PD",
        "name": "La Liga EA Sports",
        "country": "Spain",
        "api_football_id": "140",
        "football_data_id": "2014",
        "football_data_code": "PD",
        "pitchapi_league_name": "LaLiga",
        "logo": "https://crests.football-data.org/PD.png",
    },
    "BL1": {
        "code": "BL1",
        "name": "Bundesliga",
        "country": "Germany",
        "api_football_id": "78",
        "football_data_id": "2002",
        "football_data_code": "BL1",
        "pitchapi_league_name": "Bundesliga",
        "logo": "https://crests.football-data.org/BL1.png",
    },
    "SA": {
        "code": "SA",
        "name": "Serie A",
        "country": "Italy",
        "api_football_id": "135",
        "football_data_id": "2019",
        "football_data_code": "SA",
        "pitchapi_league_name": "Serie A",
        "logo": "https://crests.football-data.org/SA.png",
    },
    "FL1": {
        "code": "FL1",
        "name": "Ligue 1",
        "country": "France",
        "api_football_id": "61",
        "football_data_id": "2015",
        "football_data_code": "FL1",
        "pitchapi_league_name": "Ligue 1",
        "logo": "https://crests.football-data.org/FL1.png",
    },
    "CL": {
        "code": "CL",
        "name": "UEFA Champions League",
        "country": "Europe",
        "api_football_id": "2",
        "football_data_id": "2001",
        "football_data_code": "CL",
        "pitchapi_league_name": "Champions League",
        "logo": "https://crests.football-data.org/CL.png",
    },
}

# Lookup by API-Football ID
API_FOOTBALL_TO_CODE = {v["api_football_id"]: k for k, v in LEAGUE_MAP.items()}

# Lookup by Football-Data code
FOOTBALL_DATA_CODE_TO_CANONICAL = {k: k for k in LEAGUE_MAP.keys()}

def resolve_league_code(identifier: str) -> Optional[str]:
    ident = str(identifier).upper()
    if ident in LEAGUE_MAP:
        return ident
    if ident in API_FOOTBALL_TO_CODE:
        return API_FOOTBALL_TO_CODE[ident]
    # Check numeric IDs string
    for code, info in LEAGUE_MAP.items():
        if info["football_data_id"] == ident or info["api_football_id"] == ident:
            return code
    return None
