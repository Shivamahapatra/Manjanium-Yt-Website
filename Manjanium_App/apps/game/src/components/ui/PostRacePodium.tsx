import React, { useEffect, useState } from 'react';
import { useGamePhysics } from '../../store/telemetry';
import { Button } from '@manjanium/ui/src/components/Button';
import { useAuth, useUser } from '@clerk/nextjs';
import { submitLapTime, getUserRank, formatLapTime } from '../../lib/leaderboard';
import Leaderboard from './Leaderboard';
import { motion } from 'framer-motion';

export function PostRacePodium() {
  const { resetRace, bestLapTime, totalLaps, tireWear, weather } = useGamePhysics();
  const { userId } = useAuth();
  const { user } = useUser();
  const [userRank, setUserRank] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const trackId = 'monza';
  const difficulty = 'medium';
  // If bestLapTime is null, they somehow finished without setting a lap, just use a fallback
  const validBestLap = bestLapTime || 0;
  // Calculate total race time by multiplying best lap (this is just mock for UI purposes since we don't track total race time yet)
  const totalRaceTime = validBestLap * totalLaps;

  useEffect(() => {
    const handleRaceComplete = async () => {
      if (!userId || !validBestLap || submitted) return;
      
      setSubmitted(true);
      
      await submitLapTime({
        userId,
        userName: user?.firstName || user?.username || 'Anonymous',
        trackId: trackId,
        bestLapTime: validBestLap,
        totalRaceTime,
        weather: weather,
        difficulty: difficulty,
      });

      const rank = await getUserRank(userId, trackId);
      setUserRank(rank);
    };

    handleRaceComplete();
  }, [userId, validBestLap, user, submitted, totalRaceTime, weather]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-2xl overflow-y-auto py-10"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="bg-black/40 border border-white/10 rounded-3xl p-10 max-w-2xl w-full text-center shadow-[0_0_80px_rgba(14,165,233,0.15)] relative overflow-hidden"
      >
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none opacity-50" />
        
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-6xl font-black italic mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-[#0EA5E9] to-white tracking-tighter">
            SESSION COMPLETE
          </h1>
          <p className="text-[#0EA5E9] font-bold mb-10 tracking-widest uppercase text-sm">Paddock Simulator - {trackId.toUpperCase()}</p>
          
          <div className="w-full grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left flex flex-col justify-center">
              <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Total Stint Time</span>
              <span className="text-white font-black font-mono text-3xl">{formatLapTime(totalRaceTime)}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left flex flex-col justify-center">
              <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Fastest Lap Record</span>
              <span className="text-[#10B981] font-black font-mono text-3xl">{validBestLap ? formatLapTime(validBestLap) : '--:--.--'}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left flex flex-col justify-center">
              <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Laps Completed</span>
              <span className="text-white font-black font-mono text-3xl">{totalLaps}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left flex flex-col justify-center">
              <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Tire Compound Life</span>
              <span className="text-[#FBBF24] font-black font-mono text-3xl">{Math.round(tireWear)}%</span>
            </div>
          </div>
          
          <div className="flex w-full gap-4 mb-8">
            <Button onClick={() => window.location.reload()} variant="outline" className="flex-1 h-14 text-lg font-bold border-white/20 hover:bg-white/10 text-white">
              RETURN TO HUB
            </Button>
            <Button onClick={resetRace} variant="primary" className="flex-1 h-14 text-lg font-black italic tracking-widest shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_50px_rgba(14,165,233,0.5)] transition-all">
              REMATCH
            </Button>
          </div>

          {/* Global Leaderboard */}
          <div className="w-full">
            <h3 className="text-xs font-bold text-white/50 mb-4 text-left uppercase tracking-widest">
              Global Leaderboard
              {userRank && (
                <span className="ml-2 text-[#0EA5E9]">
                  (Your rank: #{userRank})
                </span>
              )}
            </h3>
            <div className="bg-black/50 border border-white/10 rounded-2xl p-4">
              <Leaderboard
                trackId={trackId}
                weather={weather}
                highlightUserId={userId || undefined}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
