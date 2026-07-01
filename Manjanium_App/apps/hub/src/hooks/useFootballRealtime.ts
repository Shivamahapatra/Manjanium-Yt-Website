'use client'

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

type MatchRow = Record<string, unknown>;

export type FootballRealtimePayload = {
  schema: string;
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  new: MatchRow;
  old: MatchRow;
};

export type FootballRealtimeHandler = (payload: FootballRealtimePayload) => void;

/**
 * Subscribes to real-time `matches` table changes for the Football Hub.
 *
 * Callbacks are registered BEFORE subscribe() — Supabase requires this order
 * (channel -> on -> subscribe). Adding callbacks after subscribe() throws:
 * "cannot add 'postgres_changes' callbacks ... after subscribe()".
 *
 * The handler is stored in a ref (updated inside an effect) so the
 * subscription is created once on mount while always invoking the latest
 * handler, avoiding re-subscribes on rerender.
 */
export function useFootballRealtime(handler: FootballRealtimeHandler) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const channel = supabase
      .channel('initial_football')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        (payload: unknown) => {
          handlerRef.current(payload as FootballRealtimePayload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
