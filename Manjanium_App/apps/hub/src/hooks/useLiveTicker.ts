import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

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
