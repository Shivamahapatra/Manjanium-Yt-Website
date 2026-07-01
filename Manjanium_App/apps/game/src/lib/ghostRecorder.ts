// Records telemetry every frame for ghost playback

export interface GhostFrame {
  timestamp: number
  position: [number, number, number]
  rotation: [number, number, number, number] // quaternion
  speed: number
  gear: number
}

export interface GhostLap {
  trackId: string
  lapTime: number
  frames: GhostFrame[]
  recordedAt: string
}

const GHOST_STORAGE_KEY = 'manjanium_ghost_laps'

export class GhostRecorder {
  private frames: GhostFrame[] = []
  private isRecording: boolean = false
  private startTime: number = 0

  startRecording() {
    this.frames = []
    this.isRecording = true
    this.startTime = Date.now()
  }

  recordFrame(
    position: [number, number, number],
    rotation: [number, number, number, number],
    speed: number,
    gear: number
  ) {
    if (!this.isRecording) return

    this.frames.push({
      timestamp: Date.now() - this.startTime,
      position,
      rotation,
      speed,
      gear,
    })
  }

  stopRecording(lapTime: number, trackId: string): GhostLap {
    this.isRecording = false

    return {
      trackId,
      lapTime,
      frames: this.frames,
      recordedAt: new Date().toISOString(),
    }
  }

  isActive() {
    return this.isRecording
  }
}

export function saveBestGhost(ghost: GhostLap) {
  try {
    const stored = localStorage.getItem(GHOST_STORAGE_KEY)
    const ghosts: Record<string, GhostLap> = stored
      ? JSON.parse(stored)
      : {}

    const existing = ghosts[ghost.trackId]
    if (!existing || ghost.lapTime < existing.lapTime) {
      ghosts[ghost.trackId] = ghost
      localStorage.setItem(GHOST_STORAGE_KEY, JSON.stringify(ghosts))
      return true // new best
    }
    return false // not a new best
  } catch {
    return false
  }
}

export function loadBestGhost(trackId: string): GhostLap | null {
  try {
    const stored = localStorage.getItem(GHOST_STORAGE_KEY)
    if (!stored) return null
    const ghosts: Record<string, GhostLap> = JSON.parse(stored)
    return ghosts[trackId] || null
  } catch {
    return null
  }
}
