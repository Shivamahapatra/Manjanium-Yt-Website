import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Goal, RefreshCw, Shield, Zap, Activity, Clock, ChevronRight } from 'lucide-react';

export interface MatchEvent {
  id: string;
  minute: number;
  second: number;
  type: string; // 'goal', 'substitution', 'card', 'injury', 'chance', 'foul'
  team: string; // 'home' | 'away'
  description: string;
  player?: { name: string; number?: number; photo?: string };
  assistPlayer?: { name: string; number?: number; photo?: string };
  cardType?: 'yellow' | 'red';
}

export interface LiveTimelineProps {
  events: MatchEvent[];
  isLive: boolean;
  currentMinute: number;
  onEventClick: (event: MatchEvent) => void;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
}

export function LiveTimeline({ 
  events, 
  isLive, 
  currentMinute, 
  onEventClick,
  homeTeamLogo,
  awayTeamLogo
}: LiveTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group events by minute
  const groupedEvents = events.reduce((acc: Record<number, MatchEvent[]>, event) => {
    if (!acc[event.minute]) acc[event.minute] = [];
    acc[event.minute].push(event);
    return acc;
  }, {});

  // Sort minutes in chronological order (0 to 90+)
  const sortedMinutes = Object.keys(groupedEvents)
    .map(Number)
    .sort((a, b) => a - b);

  // Scroll to bottom when new events arrive if live
  useEffect(() => {
    if (isLive && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events, isLive]);

  const getEventIcon = (type: string, cardType?: string) => {
    switch (type) {
      case 'goal': return <Goal className="w-4 h-4 text-white" />;
      case 'substitution': return <RefreshCw className="w-4 h-4 text-white" />;
      case 'card': return <Shield className="w-4 h-4 text-white" />;
      case 'chance': return <Zap className="w-4 h-4 text-white" />;
      case 'injury': return <Activity className="w-4 h-4 text-white" />;
      default: return <ChevronRight className="w-4 h-4 text-white" />;
    }
  };

  const getEventColor = (type: string, team: string, cardType?: string) => {
    if (type === 'goal') return 'bg-amber-500 shadow-amber-500/50'; // Golden highlight
    if (type === 'card') {
      return cardType === 'red' ? 'bg-red-500 shadow-red-500/50' : 'bg-yellow-400 shadow-yellow-400/50';
    }
    // Base team colors
    if (team === 'home') return 'bg-blue-600 shadow-blue-600/50';
    if (team === 'away') return 'bg-red-600 shadow-red-600/50';
    return 'bg-neutral-500';
  };

  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 text-center text-neutral-500 border border-neutral-200 dark:border-neutral-800">
        <Clock className="w-8 h-8 mx-auto mb-3 opacity-20" />
        <p>No timeline events available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 flex flex-col h-[600px] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" /> Match Timeline
        </h3>
        {isLive && (
          <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded">
            <motion.div 
              animate={{ opacity: [1, 0.5, 1] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-2 h-2 rounded-full bg-red-500"
            />
            LIVE {currentMinute > 0 && `${currentMinute}'`}
          </div>
        )}
      </div>

      {/* Scrollable Timeline */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 scroll-smooth scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700"
      >
        <div className="relative border-l-2 border-neutral-200 dark:border-neutral-800 ml-3 md:ml-6 flex flex-col gap-8 pb-8">
          <AnimatePresence initial={false}>
            {sortedMinutes.map((minute) => {
              const minuteEvents = groupedEvents[minute];
              return (
                <div key={`min-${minute}`} className="relative group">
                  {/* Minute Marker */}
                  <div className="absolute -left-10 md:-left-14 top-2 text-xs font-bold text-neutral-400 w-8 md:w-10 text-right">
                    {minute}'
                  </div>

                  <div className="flex flex-col gap-3 pl-6 md:pl-8">
                    {minuteEvents.map((evt) => {
                      const bgColor = getEventColor(evt.type, evt.team, evt.cardType);
                      const icon = getEventIcon(evt.type, evt.cardType);
                      const isHome = evt.team === 'home';
                      const logo = isHome ? homeTeamLogo : awayTeamLogo;

                      return (
                        <motion.div
                          key={evt.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="relative cursor-pointer hover:scale-[1.01] transition-transform"
                          onClick={() => onEventClick(evt)}
                        >
                          {/* Node on the line */}
                          <div className={`absolute -left-[35px] md:-left-[43px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-neutral-900 shadow-sm ${bgColor}`}>
                            {icon}
                          </div>

                          {/* Event Card */}
                          <div className={`p-4 rounded-xl border transition-colors flex flex-col md:flex-row md:items-center gap-3
                            ${evt.type === 'goal' ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30' : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'}
                            hover:border-blue-400 dark:hover:border-blue-500`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {logo && (
                                <img src={logo} alt="team" className="w-6 h-6 object-contain hidden md:block" />
                              )}
                              <div className="flex flex-col">
                                <p className={`text-sm font-semibold ${evt.type === 'goal' ? 'text-amber-800 dark:text-amber-400' : 'text-neutral-800 dark:text-neutral-200'}`}>
                                  {evt.description}
                                </p>
                                {evt.player && (
                                  <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500 font-medium">
                                    <span>{evt.player.name}</span>
                                    {evt.assistPlayer && (
                                      <>
                                        <span className="text-neutral-300 dark:text-neutral-600">•</span>
                                        <span>Assist: {evt.assistPlayer.name}</span>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="hidden md:block">
                              <span className="text-xs font-bold px-2 py-1 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-500 uppercase">
                                {evt.type}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
