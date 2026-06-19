"use client";

import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Volume2, Maximize } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReplayPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35); // percentage

  return (
    <div className="p-4 md:p-8 min-h-full">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 via-neutral-500 to-neutral-400 dark:from-white dark:via-zinc-200 dark:to-zinc-500 mb-2 flex items-center gap-3">
            <RotateCcw className="w-8 h-8 text-neutral-800 dark:text-white" />
            SESSION REPLAY
          </h1>
          <p className="text-neutral-500">Watch full session replays and highlights.</p>
        </header>

        <div className="w-full aspect-video bg-black rounded-2xl border border-[#1f1f1f] shadow-2xl overflow-hidden relative group">
          {/* Mock Video Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/50">
                <RotateCcw className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">2024 Spanish Grand Prix</h2>
              <p className="text-neutral-400">Full Race Replay</p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Timeline */}
            <div className="w-full h-1.5 bg-neutral-800 rounded-full mb-4 cursor-pointer relative" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = ((e.clientX - rect.left) / rect.width) * 100;
              setProgress(pos);
            }}>
              <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
              <div className="absolute top-1/2 -mt-1.5 w-3 h-3 bg-white rounded-full shadow" style={{ left: `calc(${progress}% - 6px)` }} />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-blue-500 transition-colors">
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <button className="text-white hover:text-blue-500 transition-colors">
                  <SkipBack className="w-5 h-5" />
                </button>
                <button className="text-white hover:text-blue-500 transition-colors">
                  <SkipForward className="w-5 h-5" />
                </button>
                <div className="text-sm text-neutral-300 font-mono ml-4">
                  45:12 / 1:30:00
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="text-white hover:text-blue-500 transition-colors">
                  <Volume2 className="w-5 h-5" />
                </button>
                <button className="text-white hover:text-blue-500 transition-colors">
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
            <h3 className="text-white font-bold mb-4">Key Moments</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm cursor-pointer hover:text-blue-400 text-neutral-300 transition-colors" onClick={() => setProgress(5)}>
                <span className="font-mono text-blue-500">05:00</span> Race Start (Lights Out)
              </li>
              <li className="flex items-center gap-3 text-sm cursor-pointer hover:text-blue-400 text-neutral-300 transition-colors" onClick={() => setProgress(25)}>
                <span className="font-mono text-blue-500">25:14</span> Verstappen Overtakes Norris
              </li>
              <li className="flex items-center gap-3 text-sm cursor-pointer hover:text-blue-400 text-neutral-300 transition-colors" onClick={() => setProgress(60)}>
                <span className="font-mono text-blue-500">60:22</span> Hamilton Pit Stop
              </li>
              <li className="flex items-center gap-3 text-sm cursor-pointer hover:text-blue-400 text-neutral-300 transition-colors" onClick={() => setProgress(98)}>
                <span className="font-mono text-blue-500">89:45</span> Chequered Flag
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
            <h3 className="text-white font-bold mb-4">Available Replays</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 p-3 bg-black rounded-lg border border-[#222] hover:border-blue-500/50 cursor-pointer transition-colors group">
                  <div className="w-24 h-16 bg-[#1a1a1a] rounded flex items-center justify-center shrink-0 group-hover:bg-blue-500/10 transition-colors">
                    <Play className="w-6 h-6 text-neutral-600 group-hover:text-blue-500" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-sm font-bold text-white mb-1">Round {i} Grand Prix</div>
                    <div className="text-xs text-neutral-500">Full Race • 1h 32m</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
