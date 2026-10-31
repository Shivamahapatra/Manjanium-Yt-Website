"""Normalized internal data models for Football pipeline.
Preserves existing shapes and fields expected by apps/hub frontend.
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class MatchTeam(BaseModel):
    id: Optional[str] = None
    name: str
    logo: Optional[str] = None
    crest: Optional[str] = None
    score: Optional[int] = None


class NormalizedMatch(BaseModel):
    match_id: str
    home_team: str
    home_team_id: Optional[str] = ""
    home_flag: Optional[str] = ""
    home_score: Optional[int] = None
    away_team: str
    away_team_id: Optional[str] = ""
    away_flag: Optional[str] = ""
    away_score: Optional[int] = None
    status: str
    minute: Optional[str] = ""
    live: bool = False
    finished: bool = False
    started: bool = False
    kickoff: Optional[str] = None
    league_name: Optional[str] = ""
    pitchapi_id: Optional[str] = None
    understat_id: Optional[str] = None
    delayed: Optional[bool] = False  # Added flag for free delayed scores


class NormalizedLeagueGroup(BaseModel):
    league_id: str
    league_name: str
    country: Optional[str] = ""
    logo: Optional[str] = ""
    matches: List[Dict[str, Any]] = Field(default_factory=list)


class NormalizedEvent(BaseModel):
    minute: Optional[int] = None
    extra: Optional[int] = None
    team: Optional[str] = None
    player: Optional[str] = None
    assist: Optional[str] = None
    type: str  # Goal, Card, sub, etc.
    detail: Optional[str] = None
    comments: Optional[str] = None


class NormalizedShot(BaseModel):
    id: str
    minute: int
    result: str  # Goal, SavedShot, MissedShot, BlockedShot, ShotOnPost
    x: float     # 0.0 to 1.0 normalized
    y: float     # 0.0 to 1.0 normalized
    xG: float
    player: str
    team: str    # "home" | "away"
    team_name: Optional[str] = None
    shot_type: Optional[str] = None
    situation: Optional[str] = None
    player_assisted: Optional[str] = None
    last_action: Optional[str] = None
