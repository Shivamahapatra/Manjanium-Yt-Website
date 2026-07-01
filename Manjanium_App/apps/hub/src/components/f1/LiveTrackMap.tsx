'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LiveTrackMapProps {
  circuit?: string;
  data?: {
    trackTemp?: number;
    weather?: string;
    positions?: Array<{ driverId: string; position: [number, number]; lapNumber: number }>;
  };
  currentLap?: number;
}

export function LiveTrackMap({ circuit, data, currentLap }: LiveTrackMapProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {/* Placeholder track visualization - Can be replaced with actual track SVG */}
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      >
        {/* Track outline */}
        <circle cx="200" cy="200" r="150" fill="none" stroke="#333333" strokeWidth="2" />
        <circle cx="200" cy="200" r="120" fill="none" stroke="#333333" strokeWidth="1" strokeDasharray="4 4" />

        {/* Driver positions as dots */}
        {data?.positions?.slice(0, 3).map((pos, idx) => (
          <g key={idx}>
            <motion.circle
              cx={200 + Math.cos((idx / 3) * Math.PI * 2) * 135}
              cy={200 + Math.sin((idx / 3) * Math.PI * 2) * 135}
              r="6"
              fill={idx === 0 ? '#FBBF24' : '#6B7280'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
            />
            <text
              x={200 + Math.cos((idx / 3) * Math.PI * 2) * 145}
              y={200 + Math.sin((idx / 3) * Math.PI * 2) * 145 + 3}
              fill="#6B7280"
              fontSize="8"
              textAnchor="middle"
            >
              P{idx + 1}
            </text>
          </g>
        ))}

        {/* Start line */}
        <line x1="200" y1="50" x2="200" y2="80" stroke="#FBBF24" strokeWidth="2" strokeDasharray="2 2" />
      </svg>

      <div className="w-full grid grid-cols-2 gap-2 mt-2">
        {data?.trackTemp && (
          <div className="p-2 bg-[#1F2937] rounded text-center">
            <p className="text-[#6B7280] text-[10px]">Track Temp</p>
            <p className="text-sm font-bold text-[#FBBF24]">{data.trackTemp}°C</p>
          </div>
        )}
        {data?.weather && (
          <div className="p-2 bg-[#1F2937] rounded text-center">
            <p className="text-[#6B7280] text-[10px]">Weather</p>
            <p className="text-sm font-bold text-[#0EA5E9]">{data.weather}</p>
          </div>
        )}
        {currentLap && (
          <div className="p-2 bg-[#1F2937] rounded text-center col-span-2">
            <p className="text-[#6B7280] text-[10px]">Lap {currentLap}</p>
          </div>
        )}
      </div>

      {circuit && (
        <p className="text-[#6B7280] text-[10px] mt-1">{circuit}</p>
      )}
    </div>
  );
}
