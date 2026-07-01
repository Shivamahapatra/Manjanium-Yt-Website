import React, { useState, useMemo } from 'react';
import { Search, MapPin, Trophy, Calendar, Filter, X, ChevronRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface GoalScorer {
  player: string;
  team: string;
  minute: number;
  assistPlayer?: string;
}

export interface MatchSummary {
  id: string;
  homeTeam: { id: string; name: string; logo?: string; score: number };
  awayTeam: { id: string; name: string; logo?: string; score: number };
  status: string;
  kickoffTime: string;
  group: string;
  venue: string;
  goalScorers: GoalScorer[];
}

export interface PastMatchesProps {
  matches: MatchSummary[];
  onMatchClick: (match: MatchSummary) => void;
  isLoading: boolean;
}

export function PastMatches({ matches, onMatchClick, isLoading }: PastMatchesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [selectedTeam, setSelectedTeam] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [visibleCount, setVisibleCount] = useState(10);

  // Derive unique filters dynamically from matches
  const uniqueGroups = useMemo(() => {
    const groups = new Set<string>();
    matches.forEach(m => {
      if (m.group) groups.add(m.group);
    });
    return ['All', ...Array.from(groups).sort()];
  }, [matches]);

  const uniqueTeams = useMemo(() => {
    const teams = new Set<string>();
    matches.forEach(m => {
      if (m.homeTeam?.name) teams.add(m.homeTeam.name);
      if (m.awayTeam?.name) teams.add(m.awayTeam.name);
    });
    return ['All', ...Array.from(teams).sort()];
  }, [matches]);

  // Filter and Sort Logic
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      const home = match.homeTeam?.name?.toLowerCase() || '';
      const away = match.awayTeam?.name?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();

      const matchesSearch = home.includes(query) || away.includes(query);
      const matchesGroup = selectedGroup === 'All' || match.group === selectedGroup;
      const matchesTeam = selectedTeam === 'All' || match.homeTeam.name === selectedTeam || match.awayTeam.name === selectedTeam;

      return matchesSearch && matchesGroup && matchesTeam;
    }).sort((a, b) => {
      const timeA = new Date(a.kickoffTime).getTime();
      const timeB = new Date(b.kickoffTime).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });
  }, [matches, searchQuery, selectedGroup, selectedTeam, sortOrder]);

  const visibleMatches = filteredMatches.slice(0, visibleCount);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGroup('All');
    setSelectedTeam('All');
    setSortOrder('newest');
    setVisibleCount(10);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-neutral-500">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filters & Search Header */}
      <div className="bg-surface p-4 md:p-6 rounded-2xl shadow-medium border border-border-color flex flex-col gap-4 transition-colors">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search by team name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-bg-primary border-none rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none transition-all text-text-primary"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-bg-primary px-3 py-2 rounded-xl border border-border-color">
            <Filter className="w-4 h-4 text-neutral-500 shrink-0" />
            <select 
              value={selectedGroup} 
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full bg-transparent border-none text-sm outline-none cursor-pointer dark:text-neutral-200"
            >
              <option value="All" className="bg-bg-primary">All Stages</option>
              {uniqueGroups.filter(g => g !== 'All').map(g => (
                <option key={g} value={g} className="bg-bg-primary">{g}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex items-center gap-2 bg-bg-primary px-3 py-2 rounded-xl border border-border-color">
            <Trophy className="w-4 h-4 text-neutral-500 shrink-0" />
            <select 
              value={selectedTeam} 
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full bg-transparent border-none text-sm outline-none cursor-pointer text-text-primary"
            >
              <option value="All" className="bg-bg-primary">All Teams</option>
              {uniqueTeams.filter(t => t !== 'All').map(t => (
                <option key={t} value={t} className="bg-bg-primary">{t}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex items-center gap-2 bg-bg-primary px-3 py-2 rounded-xl border border-border-color">
            <Calendar className="w-4 h-4 text-neutral-500 shrink-0" />
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full bg-transparent border-none text-sm outline-none cursor-pointer text-text-primary"
            >
              <option value="newest" className="bg-bg-primary">Newest First</option>
              <option value="oldest" className="bg-bg-primary">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Matches List */}
      {filteredMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-surface rounded-2xl border border-border-color text-center shadow-medium transition-colors">
          <Search className="w-12 h-12 text-text-secondary mb-4" />
          <h3 className="text-lg font-bold text-text-primary mb-2">No matches found</h3>
          <p className="text-text-secondary text-sm mb-6 max-w-md">We couldn't find any past matches matching your current filter criteria.</p>
          <button 
            onClick={clearFilters}
            className="flex items-center gap-2 bg-bg-primary hover:bg-bg-primary/80 px-4 py-2 rounded-lg font-medium transition-colors text-sm text-text-primary border border-border-color"
          >
            <X className="w-4 h-4" /> Clear Filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {visibleMatches.map((match) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={match.id}
                onClick={() => onMatchClick(match)}
                className="bg-surface border border-border-color hover:border-accent rounded-2xl overflow-hidden cursor-pointer shadow-medium hover:shadow-[0_4px_20px_rgba(var(--accent-rgb),0.1)] transition-all group"
              >
                {/* Match Header */}
                <div className="bg-bg-primary/50 px-4 py-2.5 flex justify-between items-center text-xs font-semibold text-text-secondary border-b border-border-color">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(match.kickoffTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </span>
                  <span className="flex items-center gap-1.5 text-text-primary bg-bg-primary px-2 py-0.5 rounded-sm border border-border-color">
                    <CheckCircle2 className="w-3 h-3 text-semantic-green" />
                    FULL TIME
                  </span>
                </div>

                {/* Score Section */}
                <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Home */}
                  <div className="flex items-center gap-4 flex-1">
                    <img src={match.homeTeam.logo || '/placeholder.png'} loading="lazy" alt="home" className="w-12 h-12 md:w-14 md:h-14 object-contain" />
                    <span className="text-lg md:text-xl font-bold flex-1 text-text-primary">{match.homeTeam.name}</span>
                    <span className={`text-3xl md:text-4xl font-black tabular-nums w-12 text-center ${match.homeTeam.score > match.awayTeam.score ? 'text-accent' : 'text-text-primary'}`}>
                      {match.homeTeam.score}
                    </span>
                  </div>

                  <div className="hidden md:flex text-text-secondary font-black px-4">
                    -
                  </div>

                  {/* Away */}
                  <div className="flex items-center gap-4 flex-1 flex-row-reverse md:flex-row">
                    <span className={`text-3xl md:text-4xl font-black tabular-nums w-12 text-center ${match.awayTeam.score > match.homeTeam.score ? 'text-accent' : 'text-text-primary'}`}>
                      {match.awayTeam.score}
                    </span>
                    <span className="text-lg md:text-xl font-bold flex-1 text-right md:text-left text-text-primary">{match.awayTeam.name}</span>
                    <img src={match.awayTeam.logo || '/placeholder.png'} loading="lazy" alt="away" className="w-12 h-12 md:w-14 md:h-14 object-contain" />
                  </div>
                </div>

                {/* Goal Scorers (If any) */}
                {match.goalScorers && match.goalScorers.length > 0 && (
                  <div className="px-5 md:px-6 pb-4 flex flex-col md:flex-row justify-between text-xs text-text-secondary gap-2">
                    <div className="flex-1 flex flex-wrap gap-x-2">
                      {match.goalScorers.filter(g => g.team === match.homeTeam.name).map((g, i) => (
                        <span key={i} className="flex items-center gap-1">
                          ⚽ {g.player} ({g.minute}')
                        </span>
                      ))}
                    </div>
                    <div className="flex-1 flex flex-wrap gap-x-2 md:justify-end">
                      {match.goalScorers.filter(g => g.team === match.awayTeam.name).map((g, i) => (
                        <span key={i} className="flex items-center gap-1">
                          ⚽ {g.player} ({g.minute}')
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Info */}
                <div className="bg-bg-primary/50 px-5 md:px-6 py-3 border-t border-border-color flex justify-between items-center text-xs text-text-secondary">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5" /> {match.group}</span>
                    <span className="hidden md:flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {match.venue}</span>
                  </div>
                  <span className="group-hover:text-accent font-bold flex items-center gap-1 transition-colors">
                    View Match <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {visibleCount < filteredMatches.length && (
            <button 
              onClick={handleLoadMore}
              className="mt-4 py-3 w-full bg-surface border border-border-color hover:bg-bg-primary rounded-xl font-bold text-sm text-accent transition-colors shadow-medium"
            >
              Load More Matches ({filteredMatches.length - visibleCount} remaining)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
