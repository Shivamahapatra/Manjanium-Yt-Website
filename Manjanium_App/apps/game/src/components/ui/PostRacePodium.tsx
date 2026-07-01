import React, { useEffect, useState } from 'react';
import { useGamePhysics } from '../../store/telemetry';
import { Button } from '@manjanium/ui/src/components/Button';
import { useAuth, useUser } from '@clerk/nextjs';
import { submitLapTime, getUserRank, formatLapTime } from '../../lib/leaderboard';
import Leaderboard from './Leaderboard';

export function PostRacePodium() {
  const { resetRace } = useGamePhysics();
  const { userId } = useAuth();
  const { user } = useUser();
  const [userRank, setUserRank] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Hardcoded for now until connected to real lap timing
  const bestLapTime = 84356; // 1:24.356 in ms
  const totalRaceTime = 168000;
  const trackId = 'monza';
  const weather = 'clear';
  const difficulty = 'medium';

  useEffect(() => {
    const handleRaceComplete = async () => {
      if (!userId || !bestLapTime || submitted) return;
      
      setSubmitted(true);
      
      await submitLapTime({
        userId,
        userName: user?.firstName || user?.username || 'Anonymous',
        trackId: trackId || 'monza',
        bestLapTime,
        totalRaceTime,
        weather: weather || 'clear',
        difficulty: difficulty || 'medium',
      });

      const rank = await getUserRank(userId, trackId || 'monza');
      setUserRank(rank);
    };

    handleRaceComplete();
  }, [userId, bestLapTime, user, submitted]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md overflow-y-auto py-10">
      <div className="bg-[#1E1E1E] border border-[#0EA5E9]/30 rounded-2xl p-10 max-w-lg w-full text-center shadow-[0_0_50px_rgba(14,165,233,0.15)] relative overflow-hidden my-auto">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-50" />
        
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-[#0EA5E9] font-[Outfit]">RACE FINISHED</h1>
          <p className="text-[#0EA5E9] font-['Inter'] mb-8 tracking-widest uppercase text-sm">Paddock Simulator</p>
          
          <div className="bg-black/40 border border-white/5 rounded-xl p-6 mb-8 text-left w-full">
            <h3 className="text-white/70 font-semibold mb-4 border-b border-white/10 pb-2">SESSION RESULTS</h3>
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-white/50 text-sm">Position</span>
              <span className="text-white font-bold font-mono text-xl">P1</span>
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-white/50 text-sm">Best Lap</span>
              <span className="text-[#10B981] font-mono">{formatLapTime(bestLapTime)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white/50 text-sm">Delta</span>
              <span className="text-white/70 font-mono">-0.142</span>
            </div>
          </div>
          
          <Button onClick={resetRace} variant="primary" className="w-full h-12 text-lg font-bold shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all">
            RETURN TO GARAGE
          </Button>

          {/* Global Leaderboard */}
          <div className="mt-8 w-full max-w-md">
            <h3 className="text-lg font-bold text-[#FBBF24] mb-4 text-center">
              🏆 Global Leaderboard
              {userRank && (
                <span className="ml-2 text-sm text-[#6B7280]">
                  (Your rank: #{userRank})
                </span>
              )}
            </h3>
            <Leaderboard
              trackId={trackId || 'monza'}
              weather={weather || 'clear'}
              highlightUserId={userId || undefined}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
