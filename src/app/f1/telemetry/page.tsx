"use client";

import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

export default function TelemetryPage() {
  const [driver1, setDriver1] = useState<string>('1');
  const [driver2, setDriver2] = useState<string>('16');
  const [drivers, setDrivers] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch drivers list for dropdown
    const fetchDrivers = async () => {
      try {
        const res = await fetch('/api/f1/live');
        const data = await res.json();
        if (data.drivers) {
          setDrivers(data.drivers);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDrivers();
  }, []);

  const fetchTelemetry = async () => {
    if (!driver1 || !driver2) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/f1/telemetry?d1=${driver1}&d2=${driver2}`);
      const data = await res.json();
      
      if (data.telemetry && data.telemetry.length === 2) {
        // limit to last 60 points for visualization
        const p1Data = data.telemetry[0].slice(-60);
        const p2Data = data.telemetry[1].slice(-60);
        
        const merged = p1Data.map((d1: any, index: number) => {
          const d2 = p2Data[index] || {};
          return {
            time: index,
            p1Speed: d1.speed,
            p1Throttle: d1.throttle,
            p1Brake: d1.brake,
            p1Gear: d1.n_gear,
            p2Speed: d2.speed,
            p2Throttle: d2.throttle,
            p2Brake: d2.brake,
            p2Gear: d2.n_gear,
          };
        });
        setTelemetry(merged);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    // Refresh telemetry every 5s if live
    const interval = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(interval);
  }, [driver1, driver2]);

  const d1Info = drivers.find(d => d.driver_number.toString() === driver1);
  const d2Info = drivers.find(d => d.driver_number.toString() === driver2);
  
  const d1Color = d1Info ? `#${d1Info.team_colour}` : '#3b82f6';
  const d2Color = d2Info ? `#${d2Info.team_colour}` : '#ef4444';
  const d1Name = d1Info ? d1Info.name_acronym : 'D1';
  const d2Name = d2Info ? d2Info.name_acronym : 'D2';

  return (
    <div className="p-4 md:p-8 min-h-full">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 via-neutral-500 to-neutral-400 dark:from-white dark:via-zinc-200 dark:to-zinc-500 mb-2 flex items-center gap-3">
              <BarChart2 className="w-8 h-8 text-neutral-800 dark:text-white" />
              TELEMETRY ANALYSIS
            </h1>
            <p className="text-neutral-500">Live head-to-head driver comparison.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-[#111111] p-3 rounded-xl border border-[#1f1f1f]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d1Color }} />
              <select 
                value={driver1}
                onChange={(e) => setDriver1(e.target.value)}
                className="bg-black text-white border border-[#333] rounded-md px-3 py-1.5 outline-none focus:border-blue-500"
              >
                {drivers.map(d => <option key={`d1-${d.driver_number}`} value={d.driver_number.toString()}>{d.full_name} ({d.name_acronym})</option>)}
              </select>
            </div>
            <span className="text-neutral-600 font-bold italic">VS</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d2Color }} />
              <select 
                value={driver2}
                onChange={(e) => setDriver2(e.target.value)}
                className="bg-black text-white border border-[#333] rounded-md px-3 py-1.5 outline-none focus:border-blue-500"
              >
                {drivers.map(d => <option key={`d2-${d.driver_number}`} value={d.driver_number.toString()}>{d.full_name} ({d.name_acronym})</option>)}
              </select>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-6">
          {/* SPEED TRACE */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full rounded-2xl bg-[#111111] border border-[#1f1f1f] shadow-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-400" /> Speed (km/h)</h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetry} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={['auto', 'auto']} stroke="#666" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                  <Legend />
                  <Line type="monotone" dataKey="p1Speed" name={d1Name} stroke={d1Color} strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="p2Speed" name={d2Name} stroke={d2Color} strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* THROTTLE TRACE */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full rounded-2xl bg-[#111111] border border-[#1f1f1f] shadow-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-green-400" /> Throttle (%)</h3>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetry} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 100]} stroke="#666" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                  <Line type="stepAfter" dataKey="p1Throttle" name={d1Name} stroke={d1Color} strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="stepAfter" dataKey="p2Throttle" name={d2Name} stroke={d2Color} strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* BRAKE TRACE */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full rounded-2xl bg-[#111111] border border-[#1f1f1f] shadow-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-red-500" /> Brake</h3>
            <div className="w-full h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetry} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 100]} stroke="#666" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                  <Line type="stepAfter" dataKey="p1Brake" name={d1Name} stroke={d1Color} strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="stepAfter" dataKey="p2Brake" name={d2Name} stroke={d2Color} strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
