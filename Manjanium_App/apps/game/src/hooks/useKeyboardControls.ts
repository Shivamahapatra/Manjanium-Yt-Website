'use client'

import { useEffect, useRef } from 'react'

export interface InputState {
  throttle: number    // 0 or 1
  brake: number       // 0 or 1
  steerLeft: number   // 0 or 1
  steerRight: number  // 0 or 1
  ersActive: boolean
  drsActive: boolean
  upshift: boolean
  downshift: boolean
}

// Singleton input state - updated every frame, NOT React state
// This prevents re-renders while keeping controls responsive
const inputState: InputState = {
  throttle: 0,
  brake: 0,
  steerLeft: 0,
  steerRight: 0,
  ersActive: false,
  drsActive: false,
  upshift: false,
  downshift: false,
}

export function getInputState(): InputState {
  return inputState
}

export function useKeyboardControls() {
  const keysPressed = useRef<Set<string>>(new Set())

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent page scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }

      keysPressed.current.add(e.key.toLowerCase())
      updateInputState()
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase())
      updateInputState()
    }

    const updateInputState = () => {
      const keys = keysPressed.current

      // Throttle: W or ArrowUp
      inputState.throttle =
        keys.has('w') || keys.has('arrowup') ? 1 : 0

      // Brake: S or ArrowDown
      inputState.brake =
        keys.has('s') || keys.has('arrowdown') ? 1 : 0

      // Steering
      inputState.steerLeft =
        keys.has('a') || keys.has('arrowleft') ? 1 : 0
      inputState.steerRight =
        keys.has('d') || keys.has('arrowright') ? 1 : 0

      // Systems
      inputState.ersActive = keys.has('shift')
      inputState.drsActive = keys.has(' ')

      // Gears
      inputState.upshift = keys.has('space')
      inputState.downshift = keys.has('control')
    }

    // Attach to WINDOW (not canvas) to capture all keyboard input
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Also handle focus loss (release all keys)
    window.addEventListener('blur', () => {
      keysPressed.current.clear()
      Object.assign(inputState, {
        throttle: 0,
        brake: 0,
        steerLeft: 0,
        steerRight: 0,
        ersActive: false,
        drsActive: false,
        upshift: false,
        downshift: false,
      })
    })

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return inputState
}
