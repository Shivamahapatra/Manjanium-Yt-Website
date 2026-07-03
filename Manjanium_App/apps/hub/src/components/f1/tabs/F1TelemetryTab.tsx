'use client'

import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'

export default function F1TelemetryTab() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [driver1, setDriver1] = useState('VER')
  const [driver2, setDriver2] = useState('NOR')
  const [year, setYear] = useState(2024)
  const [round, setRound] = useState(1)
  const [session, setSession] = useState('Q')
  const [activeChart, setActiveChart] = useState<'speed' | 'delta' | 'throttle' | 'gear'>('speed')

  const fetchTelemetry = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/f1/telemetry?year=${year}&round=${round}&session=${session}&driver1=${driver1}&driver2=${driver2}`
      )
      const json = await res.json()

      if (json.error) {
        setError(json.error)
        return
      }
      setData(json)
    } catch {
      setError('Failed to fetch telemetry')
    } finally {
      setLoading(false)
    }
  }

  // Chart data formatted for Recharts
  const chartData = data?.telemetry?.map((point: any) => ({
    distance: point.distance,
    [`${driver1}_speed`]: point.driver1.speed,
    [`${driver2}_speed`]: point.driver2.speed,
    [`${driver1}_throttle`]: point.driver1.throttle,
    [`${driver2}_throttle`]: point.driver2.throttle,
    [`${driver1}_gear`]: point.driver1.gear,
    [`${driver2}_gear`]: point.driver2.gear,
    delta: point.delta,
  })) || []

  return (
    <div className="space-y-6 p-4">
      {/* Controls */}
      <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-[#FBBF24]/20 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div>
            <label className="text-xs text-[#6B7280]">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full bg-[#1F2937] border border-[#333333] rounded px-2 py-1 text-white text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-[#6B7280]">Round</label>
            <input
              type="number"
              value={round}
              onChange={(e) => setRound(parseInt(e.target.value))}
              className="w-full bg-[#1F2937] border border-[#333333] rounded px-2 py-1 text-white text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-[#6B7280]">Session</label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="w-full bg-[#1F2937] border border-[#333333] rounded px-2 py-1 text-white text-sm mt-1"
            >
              <option value="Q">Qualifying</option>
              <option value="R">Race</option>
              <option value="FP1">FP1</option>
              <option value="FP2">FP2</option>
              <option value="FP3">FP3</option>
              <option value="S">Sprint</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[#6B7280]">Driver 1</label>
            <input
              value={driver1}
              onChange={(e) => setDriver1(e.target.value.toUpperCase())}
              className="w-full bg-[#1F2937] border border-[#333333] rounded px-2 py-1 text-white text-sm mt-1"
              maxLength={3}
            />
          </div>
          <div>
            <label className="text-xs text-[#6B7280]">Driver 2</label>
            <input
              value={driver2}
              onChange={(e) => setDriver2(e.target.value.toUpperCase())}
              className="w-full bg-[#1F2937] border border-[#333333] rounded px-2 py-1 text-white text-sm mt-1"
              maxLength={3}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchTelemetry}
              disabled={loading}
              className="w-full px-4 py-1.5 bg-[#FBBF24] text-black font-bold rounded text-sm disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Compare'}
            </button>
          </div>
        </div>
      </div>

      {/* Cold start warning */}
      {loading && (
        <div className="text-center text-[#6B7280] text-sm">
          ⏳ First load downloads session data (~50MB).
          This may take 30-60 seconds on cold start.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-[#EF4444]/10 border border-[#EF4444]/50 rounded-lg p-4 text-[#EF4444]">
          ⚠️ {error}
        </div>
      )}

      {/* Metadata */}
      {data && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { driver: driver1, meta: data.metadata.driver1 },
            { driver: driver2, meta: data.metadata.driver2 },
          ].map(({ driver, meta }) => (
            <div
              key={driver}
              className="bg-[#0a0a0a]/80 border border-[#333333] rounded-lg p-4"
            >
              <div className="text-2xl font-bold text-[#FBBF24]">{meta.code}</div>
              <div className="text-white font-mono text-lg">{meta.lap_time}</div>
              <div className="text-[#6B7280] text-sm">
                Lap {meta.lap_number} • {meta.compound}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart selector */}
      {data && (
        <div className="flex gap-2">
          {['speed', 'delta', 'throttle', 'gear'].map((chart) => (
            <button
              key={chart}
              onClick={() => setActiveChart(chart as any)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize ${
                activeChart === chart
                  ? 'bg-[#FBBF24] text-black'
                  : 'bg-[#1F2937] text-[#6B7280]'
              }`}
            >
              {chart}
            </button>
          ))}
        </div>
      )}

      {/* Charts */}
      {data && activeChart === 'speed' && (
        <div className="bg-[#0a0a0a]/80 border border-[#333333] rounded-lg p-4">
          <h3 className="text-[#FBBF24] font-bold mb-4">Speed Trace (km/h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="distance" stroke="#6B7280" tickFormatter={(v) => `${v}m`} />
              <YAxis stroke="#6B7280" domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ background: '#131313', border: '1px solid #333' }}
                formatter={(v: any) => `${Math.round(v)} km/h`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={`${driver1}_speed`}
                stroke="#FBBF24"
                dot={false}
                strokeWidth={2}
                name={driver1}
              />
              <Line
                type="monotone"
                dataKey={`${driver2}_speed`}
                stroke="#0EA5E9"
                dot={false}
                strokeWidth={2}
                name={driver2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {data && activeChart === 'delta' && (
        <div className="bg-[#0a0a0a]/80 border border-[#333333] rounded-lg p-4">
          <h3 className="text-[#FBBF24] font-bold mb-4">
            Time Delta (s) — above 0 = {driver1} ahead
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="distance" stroke="#6B7280" tickFormatter={(v) => `${v}m`} />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{ background: '#131313', border: '1px solid #333' }}
                formatter={(v: any) => `${v.toFixed(3)}s`}
              />
              <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="delta"
                stroke="#10B981"
                dot={false}
                strokeWidth={2}
                name="Delta"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {data && activeChart === 'throttle' && (
        <div className="bg-[#0a0a0a]/80 border border-[#333333] rounded-lg p-4">
          <h3 className="text-[#FBBF24] font-bold mb-4">Throttle (%)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="distance" stroke="#6B7280" tickFormatter={(v) => `${v}m`} />
              <YAxis stroke="#6B7280" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#131313', border: '1px solid #333' }}
                formatter={(v: any) => `${Math.round(v)}%`}
              />
              <Legend />
              <Line type="monotone" dataKey={`${driver1}_throttle`} stroke="#FBBF24" dot={false} strokeWidth={2} name={driver1} />
              <Line type="monotone" dataKey={`${driver2}_throttle`} stroke="#0EA5E9" dot={false} strokeWidth={2} name={driver2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {data && activeChart === 'gear' && (
        <div className="bg-[#0a0a0a]/80 border border-[#333333] rounded-lg p-4">
          <h3 className="text-[#FBBF24] font-bold mb-4">Gear</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="distance" stroke="#6B7280" tickFormatter={(v) => `${v}m`} />
              <YAxis stroke="#6B7280" domain={[1, 8]} ticks={[1,2,3,4,5,6,7,8]} />
              <Tooltip contentStyle={{ background: '#131313', border: '1px solid #333' }} />
              <Legend />
              <Line type="stepAfter" dataKey={`${driver1}_gear`} stroke="#FBBF24" dot={false} strokeWidth={2} name={driver1} />
              <Line type="stepAfter" dataKey={`${driver2}_gear`} stroke="#0EA5E9" dot={false} strokeWidth={2} name={driver2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
