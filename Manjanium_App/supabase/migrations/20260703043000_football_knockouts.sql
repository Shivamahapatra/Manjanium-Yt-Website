-- Migration: Tournament Brackets & Live Commentary (2026 World Cup)

CREATE TABLE IF NOT EXISTS public.tournament_brackets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id TEXT NOT NULL,
    match_id TEXT NOT NULL,
    round TEXT NOT NULL CHECK (round IN ('Round of 32', 'Round of 16', 'Quarter-Finals', 'Semi-Finals', 'Third-Place', 'Final')),
    next_match_id TEXT, -- References the match the winner advances to
    
    -- Added fields for self-contained UI rendering before external API is ready
    team1 TEXT,
    team2 TEXT,
    logo1 TEXT,
    logo2 TEXT,
    score1 INTEGER,
    score2 INTEGER,
    
    et_score INTEGER[] DEFAULT NULL, -- e.g., [1, 0] for Extra Time score
    ps_score INTEGER[] DEFAULT NULL, -- e.g., [5, 4] for Penalty Shootout score
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tournament_brackets_match ON public.tournament_brackets(match_id);
CREATE INDEX IF NOT EXISTS idx_tournament_brackets_tournament ON public.tournament_brackets(tournament_id);

CREATE TABLE IF NOT EXISTS public.live_commentary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id TEXT NOT NULL,
    minute INTEGER NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('GOAL', 'CARD', 'VAR', 'SUB', 'TEXT')),
    commentary TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_commentary_match_minute ON public.live_commentary(match_id, minute DESC);

-- RLS Policies
ALTER TABLE public.tournament_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_commentary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on tournament_brackets"
    ON public.tournament_brackets
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access on live_commentary"
    ON public.live_commentary
    FOR SELECT
    USING (true);
