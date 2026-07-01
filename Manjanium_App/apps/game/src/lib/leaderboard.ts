import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface LeaderboardEntry {
  id: string
  user_id: string
  user_name: string
  track_id: string
  best_lap_time: number
  total_race_time: number
  weather: string
  difficulty: string
  created_at: string
  position?: number
}

export const formatLapTime = (ms: number): string => {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  const milliseconds = Math.floor((ms % 1000) / 10)
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`
}

export async function submitLapTime({
  userId,
  userName,
  trackId,
  bestLapTime,
  totalRaceTime,
  weather,
  difficulty,
}: {
  userId: string
  userName: string
  trackId: string
  bestLapTime: number
  totalRaceTime: number
  weather: string
  difficulty: string
}) {
  const { data, error } = await supabase
    .from('simulator_leaderboards')
    .upsert(
      {
        user_id: userId,
        user_name: userName,
        track_id: trackId,
        best_lap_time: bestLapTime,
        total_race_time: totalRaceTime,
        weather,
        difficulty,
      },
      {
        onConflict: 'user_id,track_id,weather,difficulty',
        ignoreDuplicates: false,
      }
    )
    .select()

  if (error) {
    // Only update if new time is better
    if (error.code === '23505') {
      const { data: existing } = await supabase
        .from('simulator_leaderboards')
        .select('best_lap_time')
        .eq('user_id', userId)
        .eq('track_id', trackId)
        .single()

      if (existing && bestLapTime < existing.best_lap_time) {
        return await supabase
          .from('simulator_leaderboards')
          .update({ best_lap_time: bestLapTime, total_race_time: totalRaceTime })
          .eq('user_id', userId)
          .eq('track_id', trackId)
          .eq('weather', weather)
          .eq('difficulty', difficulty)
      }
    }
    console.error('Leaderboard submit error:', error)
    return null
  }

  return data
}

export async function getLeaderboard(
  trackId: string,
  weather: string = 'clear',
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('simulator_leaderboards')
    .select('*')
    .eq('track_id', trackId)
    .eq('weather', weather)
    .order('best_lap_time', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Leaderboard fetch error:', error)
    return []
  }

  return (data || []).map((entry, index) => ({
    ...entry,
    position: index + 1,
  }))
}

export async function getUserRank(
  userId: string,
  trackId: string
): Promise<number | null> {
  const { data } = await supabase
    .from('simulator_leaderboards')
    .select('user_id, best_lap_time')
    .eq('track_id', trackId)
    .order('best_lap_time', { ascending: true })

  if (!data) return null
  const idx = data.findIndex((e) => e.user_id === userId)
  return idx === -1 ? null : idx + 1
}
