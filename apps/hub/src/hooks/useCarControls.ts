import { useEffect } from 'react'
import { useGamePhysics } from './useGamePhysics'

export function useCarControls() {
  const { setThrottle, setBrake, setSteering } = useGamePhysics()

  useEffect(() => {
    const keys: { [key: string]: boolean } = {}

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true

      // Throttle: W or ArrowUp
      if (keys['w'] || keys['arrowup']) {
        setThrottle(1)
      } else {
        setThrottle(0)
      }

      // Brake: S or ArrowDown
      if (keys['s'] || keys['arrowdown']) {
        setBrake(1)
      } else {
        setBrake(0)
      }

      // Steering: A/D or ArrowLeft/ArrowRight
      if (keys['a'] || keys['arrowleft']) {
        setSteering(-1)
      } else if (keys['d'] || keys['arrowright']) {
        setSteering(1)
      } else {
        setSteering(0)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false

      if (!keys['w'] && !keys['arrowup']) {
        setThrottle(0)
      }
      if (!keys['s'] && !keys['arrowdown']) {
        setBrake(0)
      }
      if (!keys['a'] && !keys['arrowleft'] && !keys['d'] && !keys['arrowright']) {
        setSteering(0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [setThrottle, setBrake, setSteering])
}
