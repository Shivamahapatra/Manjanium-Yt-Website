-- Migration: Tournament Brackets & Live Commentary

CREATE TABLE public.tournament_brackets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id TEXT NOT NULL,
    match_id TEXT NOT NULL,
    round TEXT NOT NULL CHECK (round IN ('Round of 16', 'Quarter-Finals', 'Semi-Finals', 'Final')),
    next_match_id TEXT, -- References the match the winner advances to
    et_score INTEGER[] DEFAULT NULL, -- e.g., [1, 0] for Extra Time score
    ps_score INTEGER[] DEFAULT NULL, -- e.g., [5, 4] for Penalty Shootout score
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tournament_brackets_match ON public.tournament_brackets(match_id);

CREATE TABLE public.live_commentary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id TEXT NOT NULL,
    minute INTEGER NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('GOAL', 'CARD', 'VAR', 'SUB', 'TEXT')),
    commentary TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_live_commentary_match_minute ON public.live_commentary(match_id, minute DESC);
