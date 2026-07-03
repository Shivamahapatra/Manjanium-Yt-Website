-- Fix missing columns for tournament_brackets
ALTER TABLE public.tournament_brackets 
ADD COLUMN IF NOT EXISTS team1 TEXT,
ADD COLUMN IF NOT EXISTS team2 TEXT,
ADD COLUMN IF NOT EXISTS logo1 TEXT,
ADD COLUMN IF NOT EXISTS logo2 TEXT,
ADD COLUMN IF NOT EXISTS score1 INTEGER,
ADD COLUMN IF NOT EXISTS score2 INTEGER;

-- Optionally, if you haven't dropped the constraint for "Round of 32" yet, do this:
ALTER TABLE public.tournament_brackets DROP CONSTRAINT IF EXISTS tournament_brackets_round_check;
ALTER TABLE public.tournament_brackets ADD CONSTRAINT tournament_brackets_round_check CHECK (round IN ('Round of 32', 'Round of 16', 'Quarter-Finals', 'Semi-Finals', 'Third-Place', 'Final'));
