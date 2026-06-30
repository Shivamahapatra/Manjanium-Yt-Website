"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Rss, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { timeAgo, matchesTeamFilter, classifyNewsTags } from '@/lib/f1-helpers';

const TEAM_FILTERS = ['Red Bull', 'Aston Martin', 'McLaren', 'Ferrari', 'Mercedes', 'All'] as const;

const SOURCE_COLORS: Record<string, string> = {
  'Motorsport.com': 'bg-blue-600/20 text-blue-400 border-blue-500/30',
  'The Race': 'bg-green-600/20 text-green-400 border-green-500/30',
  'Autosport': 'bg-red-600/20 text-red-400 border-red-500/30',
};

const TAG_COLORS: Record<string, string> = {
  Upgrade: 'bg-green-500/20 text-green-400',
  Regulation: 'bg-blue-500/20 text-blue-400',
  Engine: 'bg-red-500/20 text-red-400',
  Aero: 'bg-purple-500/20 text-purple-400',
  Strategy: 'bg-amber-500/20 text-amber-400',
  Protest: 'bg-orange-500/20 text-orange-400',
  General: 'bg-neutral-500/20 text-neutral-400',
};

function getTagColor(tag: string): string {
  return TAG_COLORS[tag] || TAG_COLORS.General;
}

function getSourceColor(source: string): string {
  return SOURCE_COLORS[source] || 'bg-neutral-600/20 text-neutral-400 border-neutral-500/30';
}

export function F1UpdatesTab() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(
    new Set(['Red Bull', 'Aston Martin'])
  );

  useEffect(() => {
    const fetchUpdates = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/f1/updates');
        const data = await res.json();
        if (data.updates) {
          setUpdates(data.updates);
        }
      } catch (error) {
        console.error('Failed to fetch updates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, []);

  const handleTeamToggle = (team: string) => {
    if (team === 'All') {
      setSelectedTeams(new Set());
      return;
    }

    const next = new Set(selectedTeams);
    if (next.has(team)) {
      next.delete(team);
    } else {
      next.add(team);
    }
    setSelectedTeams(next);
  };

  const isAllSelected = selectedTeams.size === 0;

  const filteredUpdates = useMemo(() => {
    if (isAllSelected) return updates;

    const teamsArray = Array.from(selectedTeams);
    return updates.filter((item) => {
      const text = `${item.title || ''} ${item.contentSnippet || ''}`;
      return matchesTeamFilter(text, teamsArray);
    });
  }, [updates, selectedTeams, isAllSelected]);

  return (
    <div className="p-4 md:p-8 min-h-full">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500 mb-2 flex items-center gap-3">
            <Rss className="w-8 h-8 text-white" />
            TECHNICAL UPDATES
          </h1>
          <p className="text-neutral-500">
            Latest F1 news and technical developments from top motorsport sources.
          </p>
        </header>

        {/* Team Filter Bar */}
        <div className="mb-8 flex flex-wrap gap-2">
          {TEAM_FILTERS.map((team) => {
            const isActive =
              team === 'All' ? isAllSelected : selectedTeams.has(team);
            return (
              <button
                key={team}
                onClick={() => handleTeamToggle(team)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-[#1f1f1f] text-[#737373] border-[#1f1f1f] hover:text-white hover:border-[#333]'
                }`}
              >
                {team}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-[#111111] border border-[#1f1f1f] rounded-xl h-56"
              />
            ))}
          </div>
        ) : filteredUpdates.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">
            <p className="text-lg font-medium">No articles match the selected filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredUpdates.map((item, idx) => {
              const tags: string[] =
                item.tags && Array.isArray(item.tags)
                  ? item.tags
                  : classifyNewsTags(
                      item.title || '',
                      item.contentSnippet || ''
                    );

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.link || idx}
                  className="bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden hover:border-blue-500/50 transition-colors group flex flex-col"
                >
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Top row: source badge + relative time */}
                    <div className="flex items-center justify-between mb-3">
                      {item.source && (
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-2xl border ${getSourceColor(
                            item.source
                          )}`}
                        >
                          {item.source}
                        </span>
                      )}
                      <span className="text-xs text-neutral-500 font-mono">
                        {item.pubDate ? timeAgo(item.pubDate) : ''}
                      </span>
                    </div>

                    {/* Headline */}
                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                      {item.title}
                    </h2>

                    {/* Snippet */}
                    <p className="text-neutral-400 text-sm mb-4 line-clamp-3 flex-1">
                      {item.contentSnippet ||
                        'Read the full article for more details...'}
                    </p>

                    {/* Tag chips */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className={`text-xs font-semibold px-2 py-0.5 rounded-2xl ${getTagColor(
                              tag
                            )}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Read Article link */}
                    <Link
                      href={item.link || '#'}
                      target="_blank"
                      className="flex items-center justify-between text-sm font-bold text-white bg-[#1a1a1a] p-3 rounded-lg group-hover:bg-blue-600 transition-colors mt-auto"
                    >
                      <span>Read Article</span>
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
