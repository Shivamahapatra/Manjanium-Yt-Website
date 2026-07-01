// Plays back a recorded ghost lap

import { GhostLap, GhostFrame } from './ghostRecorder'
import * as THREE from 'three'

export class GhostPlayer {
  private ghost: GhostLap | null = null
  private startTime: number = 0
  private isPlaying: boolean = false
  private frameIndex: number = 0

  loadGhost(ghost: GhostLap) {
    this.ghost = ghost
    this.frameIndex = 0
    this.isPlaying = false
  }

  startPlayback() {
    if (!this.ghost) return
    this.startTime = Date.now()
    this.isPlaying = true
    this.frameIndex = 0
  }

  stopPlayback() {
    this.isPlaying = false
    this.frameIndex = 0
  }

  getCurrentFrame(): GhostFrame | null {
    if (!this.isPlaying || !this.ghost) return null

    const elapsed = Date.now() - this.startTime

    // Find the frame closest to current time
    while (
      this.frameIndex < this.ghost.frames.length - 1 &&
      this.ghost.frames[this.frameIndex + 1].timestamp <= elapsed
    ) {
      this.frameIndex++
    }

    if (this.frameIndex >= this.ghost.frames.length - 1) {
      this.isPlaying = false
      return null
    }

    // Interpolate between current and next frame
    const current = this.ghost.frames[this.frameIndex]
    const next = this.ghost.frames[this.frameIndex + 1]
    const t =
      (elapsed - current.timestamp) /
      (next.timestamp - current.timestamp)

    const pos = new THREE.Vector3(...current.position).lerp(
      new THREE.Vector3(...next.position),
      t
    )

    const rotA = new THREE.Quaternion(...current.rotation)
    const rotB = new THREE.Quaternion(...next.rotation)
    rotA.slerp(rotB, t)

    return {
      timestamp: elapsed,
      position: [pos.x, pos.y, pos.z],
      rotation: [rotA.x, rotA.y, rotA.z, rotA.w],
      speed: current.speed + (next.speed - current.speed) * t,
      gear: current.gear,
    }
  }

  hasGhost() {
    return this.ghost !== null
  }

  isActive() {
    return this.isPlaying
  }

  getGhostLapTime() {
    return this.ghost?.lapTime || null
  }
}
