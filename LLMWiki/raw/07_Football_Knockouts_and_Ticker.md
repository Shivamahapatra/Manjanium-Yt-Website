# [[07_Football_Knockouts_and_Ticker]]

## 1. Migration SQL Structures
```sql
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
```

## 2. Custom Hook: `useLiveTicker`
```typescript
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase'; // Adjust import based on your setup

export interface CommentaryEvent {
  id: string;
  match_id: string;
  minute: number;
  category: 'GOAL' | 'CARD' | 'VAR' | 'SUB' | 'TEXT';
  commentary: string;
  created_at: string;
}

export function useLiveTicker(matchId: string) {
  const [events, setEvents] = useState<CommentaryEvent[]>([]);
  const processedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!matchId) return;

    // Fetch initial events
    const fetchInitial = async () => {
      const { data, error } = await supabase
        .from('live_commentary')
        .select('*')
        .eq('match_id', matchId)
        .order('minute', { ascending: false });
        
      if (!error && data) {
        setEvents(data as CommentaryEvent[]);
        data.forEach(ev => processedIds.current.add(ev.id));
      }
    };

    fetchInitial();

    // Subscribe to real-time inserts
    const channel = supabase.channel(`live_commentary_${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_commentary',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          const newEvent = payload.new as CommentaryEvent;
          
          // Deduplication check
          if (!processedIds.current.has(newEvent.id)) {
            processedIds.current.add(newEvent.id);
            setEvents(prev => {
              // Ensure chronological order (descending by minute)
              const updated = [newEvent, ...prev];
              return updated.sort((a, b) => b.minute - a.minute);
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  return { events };
}
```

## 3. Updated UI Component Logic: `MatchDetailsModal.tsx`
```tsx
import React, { useState } from 'react';
import { useLiveTicker, CommentaryEvent } from '@/hooks/useLiveTicker'; // Adjust import path
import { Dialog } from '@headlessui/react'; // Assuming Headless UI or similar for modal

interface MatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'GOAL': return 'border-emerald-500 bg-emerald-500/10';
    case 'CARD': return 'border-red-500 bg-red-500/10';
    case 'VAR': return 'border-purple-500 bg-purple-500/10';
    case 'SUB': return 'border-blue-500 bg-blue-500/10';
    default: return 'border-white/10 bg-white/5';
  }
};

export function MatchDetailsModal({ isOpen, onClose, matchId }: MatchDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'ticker'>('ticker');
  const { events } = useLiveTicker(matchId);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-2xl bg-[#0a0a0a]/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl glassmorphic-container">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
            <Dialog.Title className="text-xl font-bold text-white font-heading">
              Match Details
            </Dialog.Title>
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10 px-6">
            <button
              onClick={() => setActiveTab('ticker')}
              className={`py-3 px-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'ticker' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              Live Ticker
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-3 px-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'stats' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              Match Stats
            </button>
          </div>

          {/* Content Area */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'ticker' && (
              <div className="relative border-l border-white/10 ml-4 space-y-6 pb-4">
                {events.length === 0 ? (
                  <p className="text-white/50 pl-6 italic">Waiting for kickoff...</p>
                ) : (
                  events.map((ev) => (
                    <div key={ev.id} className="relative pl-8">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-[#0a0a0a]" />
                      
                      {/* Event Card */}
                      <div className={`p-4 rounded-xl border-l-4 ${getCategoryColor(ev.category)} transition-all hover:bg-white/10`}>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-emerald-400 font-mono font-bold text-sm">
                            {ev.minute}'
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                            {ev.category}
                          </span>
                        </div>
                        <p className="text-white/90 text-sm leading-relaxed font-body">
                          {ev.commentary}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {activeTab === 'stats' && (
              <div className="text-white/50 flex justify-center py-12">
                Stats view placeholder...
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
```
