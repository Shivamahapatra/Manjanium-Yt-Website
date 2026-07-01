import { useEffect, useRef } from 'react'
import { useGamePhysics } from '@/store/telemetry'

export function useMouseSteering(enabled: boolean, sensitivity: number = 0.005) {
  const { setSteering } = useGamePhysics()
  const steeringRef = useRef(0)

  useEffect(() => {
    if (!enabled) return

    const canvas = document.querySelector('canvas')
    if (!canvas) return

    const handleClick = () => {
      canvas.requestPointerLock()
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!document.pointerLockElement) return
      
      steeringRef.current = Math.max(
        -1,
        Math.min(1, steeringRef.current + e.movementX * sensitivity)
      )
      
      // Natural return to center
      steeringRef.current *= 0.95
      setSteering(steeringRef.current)
    }

    const handlePointerLockChange = () => {
      if (!document.pointerLockElement) {
        steeringRef.current = 0
        setSteering(0)
      }
    }

    canvas.addEventListener('click', handleClick)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('pointerlockchange', handlePointerLockChange)

    return () => {
      canvas.removeEventListener('click', handleClick)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      
      if (document.pointerLockElement) {
        document.exitPointerLock()
      }
    }
  }, [enabled, sensitivity, setSteering])
}
