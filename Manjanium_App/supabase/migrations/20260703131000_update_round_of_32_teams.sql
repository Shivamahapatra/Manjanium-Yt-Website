-- Update 2026 World Cup Bracket Placeholders with Simulated Teams for Round of 32
-- Tournament ID: 'fifa_wc_2026'

-- Match 73
UPDATE public.tournament_brackets 
SET team1 = 'Mexico', team2 = 'Senegal', logo1 = 'https://flagcdn.com/w40/mx.png', logo2 = 'https://flagcdn.com/w40/sn.png', score1 = 2, score2 = 1, is_completed = true
WHERE match_id = 'm73' AND tournament_id = 'fifa_wc_2026';

-- Match 74
UPDATE public.tournament_brackets 
SET team1 = 'England', team2 = 'Uruguay', logo1 = 'https://flagcdn.com/w40/gb-eng.png', logo2 = 'https://flagcdn.com/w40/uy.png', score1 = 3, score2 = 0, is_completed = true
WHERE match_id = 'm74' AND tournament_id = 'fifa_wc_2026';

-- Match 75
UPDATE public.tournament_brackets 
SET team1 = 'France', team2 = 'Japan', logo1 = 'https://flagcdn.com/w40/fr.png', logo2 = 'https://flagcdn.com/w40/jp.png', score1 = 2, score2 = 0, is_completed = true
WHERE match_id = 'm75' AND tournament_id = 'fifa_wc_2026';

-- Match 76
UPDATE public.tournament_brackets 
SET team1 = 'Canada', team2 = 'Morocco', logo1 = 'https://flagcdn.com/w40/ca.png', logo2 = 'https://flagcdn.com/w40/ma.png', score1 = 1, score2 = 2, is_completed = true
WHERE match_id = 'm76' AND tournament_id = 'fifa_wc_2026';

-- Match 77
UPDATE public.tournament_brackets 
SET team1 = 'Spain', team2 = 'Ecuador', logo1 = 'https://flagcdn.com/w40/es.png', logo2 = 'https://flagcdn.com/w40/ec.png', score1 = 2, score2 = 1, is_completed = true
WHERE match_id = 'm77' AND tournament_id = 'fifa_wc_2026';

-- Match 78
UPDATE public.tournament_brackets 
SET team1 = 'Denmark', team2 = 'Switzerland', logo1 = 'https://flagcdn.com/w40/dk.png', logo2 = 'https://flagcdn.com/w40/ch.png', score1 = 1, score2 = 1, ps_score = ARRAY[4,5], is_completed = true
WHERE match_id = 'm78' AND tournament_id = 'fifa_wc_2026';

-- Match 79
UPDATE public.tournament_brackets 
SET team1 = 'Argentina', team2 = 'Iran', logo1 = 'https://flagcdn.com/w40/ar.png', logo2 = 'https://flagcdn.com/w40/ir.png', score1 = 3, score2 = 0, is_completed = true
WHERE match_id = 'm79' AND tournament_id = 'fifa_wc_2026';

-- Match 80
UPDATE public.tournament_brackets 
SET team1 = 'Netherlands', team2 = 'South Korea', logo1 = 'https://flagcdn.com/w40/nl.png', logo2 = 'https://flagcdn.com/w40/kr.png', score1 = 2, score2 = 1, is_completed = true
WHERE match_id = 'm80' AND tournament_id = 'fifa_wc_2026';

-- Match 81
UPDATE public.tournament_brackets 
SET team1 = 'USA', team2 = 'Cameroon', logo1 = 'https://flagcdn.com/w40/us.png', logo2 = 'https://flagcdn.com/w40/cm.png', score1 = 2, score2 = 1, is_completed = true
WHERE match_id = 'm81' AND tournament_id = 'fifa_wc_2026';

-- Match 82
UPDATE public.tournament_brackets 
SET team1 = 'Brazil', team2 = 'Ghana', logo1 = 'https://flagcdn.com/w40/br.png', logo2 = 'https://flagcdn.com/w40/gh.png', score1 = 3, score2 = 1, is_completed = true
WHERE match_id = 'm82' AND tournament_id = 'fifa_wc_2026';

-- Match 83
UPDATE public.tournament_brackets 
SET team1 = 'Germany', team2 = 'Wales', logo1 = 'https://flagcdn.com/w40/de.png', logo2 = 'https://flagcdn.com/w40/gb-wls.png', score1 = 2, score2 = 0, is_completed = true
WHERE match_id = 'm83' AND tournament_id = 'fifa_wc_2026';

-- Match 84
UPDATE public.tournament_brackets 
SET team1 = 'Portugal', team2 = 'Saudi Arabia', logo1 = 'https://flagcdn.com/w40/pt.png', logo2 = 'https://flagcdn.com/w40/sa.png', score1 = 4, score2 = 0, is_completed = true
WHERE match_id = 'm84' AND tournament_id = 'fifa_wc_2026';

-- Match 85
UPDATE public.tournament_brackets 
SET team1 = 'Italy', team2 = 'Ivory Coast', logo1 = 'https://flagcdn.com/w40/it.png', logo2 = 'https://flagcdn.com/w40/ci.png', score1 = 1, score2 = 0, is_completed = true
WHERE match_id = 'm85' AND tournament_id = 'fifa_wc_2026';

-- Match 86
UPDATE public.tournament_brackets 
SET team1 = 'Colombia', team2 = 'Australia', logo1 = 'https://flagcdn.com/w40/co.png', logo2 = 'https://flagcdn.com/w40/au.png', score1 = 2, score2 = 1, is_completed = true
WHERE match_id = 'm86' AND tournament_id = 'fifa_wc_2026';

-- Match 87
UPDATE public.tournament_brackets 
SET team1 = 'Belgium', team2 = 'Nigeria', logo1 = 'https://flagcdn.com/w40/be.png', logo2 = 'https://flagcdn.com/w40/ng.png', score1 = 3, score2 = 2, is_completed = true
WHERE match_id = 'm87' AND tournament_id = 'fifa_wc_2026';

-- Match 88
UPDATE public.tournament_brackets 
SET team1 = 'Croatia', team2 = 'Sweden', logo1 = 'https://flagcdn.com/w40/hr.png', logo2 = 'https://flagcdn.com/w40/se.png', score1 = 1, score2 = 0, is_completed = true
WHERE match_id = 'm88' AND tournament_id = 'fifa_wc_2026';

-- Propagate winners to Round of 16 (matches 89-96)
UPDATE public.tournament_brackets SET team1 = 'Mexico', team2 = 'England', logo1 = 'https://flagcdn.com/w40/mx.png', logo2 = 'https://flagcdn.com/w40/gb-eng.png' WHERE match_id = 'm89' AND tournament_id = 'fifa_wc_2026';
UPDATE public.tournament_brackets SET team1 = 'France', team2 = 'Morocco', logo1 = 'https://flagcdn.com/w40/fr.png', logo2 = 'https://flagcdn.com/w40/ma.png' WHERE match_id = 'm90' AND tournament_id = 'fifa_wc_2026';
UPDATE public.tournament_brackets SET team1 = 'Spain', team2 = 'Switzerland', logo1 = 'https://flagcdn.com/w40/es.png', logo2 = 'https://flagcdn.com/w40/ch.png' WHERE match_id = 'm91' AND tournament_id = 'fifa_wc_2026';
UPDATE public.tournament_brackets SET team1 = 'Argentina', team2 = 'Netherlands', logo1 = 'https://flagcdn.com/w40/ar.png', logo2 = 'https://flagcdn.com/w40/nl.png' WHERE match_id = 'm92' AND tournament_id = 'fifa_wc_2026';
UPDATE public.tournament_brackets SET team1 = 'USA', team2 = 'Brazil', logo1 = 'https://flagcdn.com/w40/us.png', logo2 = 'https://flagcdn.com/w40/br.png' WHERE match_id = 'm93' AND tournament_id = 'fifa_wc_2026';
UPDATE public.tournament_brackets SET team1 = 'Germany', team2 = 'Portugal', logo1 = 'https://flagcdn.com/w40/de.png', logo2 = 'https://flagcdn.com/w40/pt.png' WHERE match_id = 'm94' AND tournament_id = 'fifa_wc_2026';
UPDATE public.tournament_brackets SET team1 = 'Italy', team2 = 'Colombia', logo1 = 'https://flagcdn.com/w40/it.png', logo2 = 'https://flagcdn.com/w40/co.png' WHERE match_id = 'm95' AND tournament_id = 'fifa_wc_2026';
UPDATE public.tournament_brackets SET team1 = 'Belgium', team2 = 'Croatia', logo1 = 'https://flagcdn.com/w40/be.png', logo2 = 'https://flagcdn.com/w40/hr.png' WHERE match_id = 'm96' AND tournament_id = 'fifa_wc_2026';
