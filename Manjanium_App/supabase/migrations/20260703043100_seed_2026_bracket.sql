-- Seed 2026 World Cup Bracket Placeholders
-- Tournament ID: 'fifa_wc_2026'

INSERT INTO public.tournament_brackets (tournament_id, match_id, round, next_match_id, team1, team2) VALUES
-- Round of 32 (16 matches)
('fifa_wc_2026', 'm73', 'Round of 32', 'm89', 'Winner Grp A', '3rd Grp C/D/E/F'),
('fifa_wc_2026', 'm74', 'Round of 32', 'm89', 'Runner-up Grp B', 'Runner-up Grp C'),
('fifa_wc_2026', 'm75', 'Round of 32', 'm90', 'Winner Grp D', '3rd Grp B/E/F/G'),
('fifa_wc_2026', 'm76', 'Round of 32', 'm90', 'Runner-up Grp A', 'Runner-up Grp F'),
('fifa_wc_2026', 'm77', 'Round of 32', 'm91', 'Winner Grp E', '3rd Grp A/B/C/D'),
('fifa_wc_2026', 'm78', 'Round of 32', 'm91', 'Runner-up Grp D', 'Runner-up Grp G'),
('fifa_wc_2026', 'm79', 'Round of 32', 'm92', 'Winner Grp C', '3rd Grp A/B/F/G'),
('fifa_wc_2026', 'm80', 'Round of 32', 'm92', 'Runner-up Grp E', 'Runner-up Grp H'),
('fifa_wc_2026', 'm81', 'Round of 32', 'm93', 'Winner Grp B', '3rd Grp E/F/G/H'),
('fifa_wc_2026', 'm82', 'Round of 32', 'm93', 'Runner-up Grp A', 'Runner-up Grp I'),
('fifa_wc_2026', 'm83', 'Round of 32', 'm94', 'Winner Grp F', '3rd Grp A/B/C/H'),
('fifa_wc_2026', 'm84', 'Round of 32', 'm94', 'Runner-up Grp J', 'Runner-up Grp K'),
('fifa_wc_2026', 'm85', 'Round of 32', 'm95', 'Winner Grp G', '3rd Grp A/B/C/D'),
('fifa_wc_2026', 'm86', 'Round of 32', 'm95', 'Runner-up Grp H', 'Runner-up Grp L'),
('fifa_wc_2026', 'm87', 'Round of 32', 'm96', 'Winner Grp H', '3rd Grp C/D/E/F'),
('fifa_wc_2026', 'm88', 'Round of 32', 'm96', 'Runner-up Grp K', 'Runner-up Grp L'),

-- Round of 16 (8 matches)
('fifa_wc_2026', 'm89', 'Round of 16', 'm97', 'Winner Match 73', 'Winner Match 74'),
('fifa_wc_2026', 'm90', 'Round of 16', 'm97', 'Winner Match 75', 'Winner Match 76'),
('fifa_wc_2026', 'm91', 'Round of 16', 'm98', 'Winner Match 77', 'Winner Match 78'),
('fifa_wc_2026', 'm92', 'Round of 16', 'm98', 'Winner Match 79', 'Winner Match 80'),
('fifa_wc_2026', 'm93', 'Round of 16', 'm99', 'Winner Match 81', 'Winner Match 82'),
('fifa_wc_2026', 'm94', 'Round of 16', 'm99', 'Winner Match 83', 'Winner Match 84'),
('fifa_wc_2026', 'm95', 'Round of 16', 'm100', 'Winner Match 85', 'Winner Match 86'),
('fifa_wc_2026', 'm96', 'Round of 16', 'm100', 'Winner Match 87', 'Winner Match 88'),

-- Quarter-Finals (4 matches)
('fifa_wc_2026', 'm97', 'Quarter-Finals', 'm101', 'Winner Match 89', 'Winner Match 90'),
('fifa_wc_2026', 'm98', 'Quarter-Finals', 'm101', 'Winner Match 91', 'Winner Match 92'),
('fifa_wc_2026', 'm99', 'Quarter-Finals', 'm102', 'Winner Match 93', 'Winner Match 94'),
('fifa_wc_2026', 'm100', 'Quarter-Finals', 'm102', 'Winner Match 95', 'Winner Match 96'),

-- Semi-Finals (2 matches)
('fifa_wc_2026', 'm101', 'Semi-Finals', 'm104', 'Winner Match 97', 'Winner Match 98'),
('fifa_wc_2026', 'm102', 'Semi-Finals', 'm104', 'Winner Match 99', 'Winner Match 100'),

-- Third-Place (1 match)
('fifa_wc_2026', 'm103', 'Third-Place', NULL, 'Loser Match 101', 'Loser Match 102'),

-- Final (1 match)
('fifa_wc_2026', 'm104', 'Final', NULL, 'Winner Match 101', 'Winner Match 102')
ON CONFLICT DO NOTHING;
