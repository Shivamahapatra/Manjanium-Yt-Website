'use client';

import { useEffect, useRef } from 'react';
import { useGamePhysics } from '../store/telemetry';

export interface SimulatorInputState {
  throttle: number;    // 0 to 1
  brake: number;       // 0 to 1
  steering: number;    // -1 (left) to 1 (right)
  gear: number;        // -1 (R), 0 (N), 1-8 (Gears)
  isAuto: boolean;     
  isPaused: boolean;
  mouseSensitivity: number;
  shiftUpTriggered: boolean;   // Momentary flag for impulse
  shiftDownTriggered: boolean; // Momentary flag
}

// Singleton state to avoid React re-renders in the physics loop
const inputState: SimulatorInputState = {
  throttle: 0,
  brake: 0,
  steering: 0,
  gear: 1, // Start in 1st gear
  isAuto: true, // Default to auto
  isPaused: false,
  mouseSensitivity: 0.005,
  shiftUpTriggered: false,
  shiftDownTriggered: false,
};

export function getSimulatorInputs(): SimulatorInputState {
  return inputState;
}

export function setMouseSensitivity(value: number) {
  inputState.mouseSensitivity = value;
}

export function setSimulatorPaused(paused: boolean) {
  inputState.isPaused = paused;
  if (!paused) {
    const canvas = document.querySelector('canvas');
    if (canvas && !document.pointerLockElement) {
      canvas.requestPointerLock();
    }
  } else if (document.pointerLockElement) {
    document.exitPointerLock();
  }
}

export function useSimulatorInputs() {
  const keysPressed = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for game keys
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }

      const key = e.key.toLowerCase();
      
      // Handle Toggle actions once per press
      if (!keysPressed.current.has(key)) {
        if (key === 'control') {
          inputState.isAuto = !inputState.isAuto;
        } else if (key === ' ' && !inputState.isAuto) {
          inputState.shiftUpTriggered = true;
          inputState.gear = Math.min(8, inputState.gear + 1);
        } else if (key === 'shift' && !inputState.isAuto) {
          inputState.shiftDownTriggered = true;
          inputState.gear = Math.max(-1, inputState.gear - 1);
        } else if (key === 'r') {
          // Toggle weather
          const currentWeather = useGamePhysics.getState().weather;
          useGamePhysics.getState().setWeather(currentWeather === 'rain' ? 'clear' : 'rain');
        } else if (key === 'escape') {
          // ESC pauses the game natively by exiting pointer lock, which is handled in pointerlockchange
          // But if pointer lock isn't active, we can manually pause
          if (!document.pointerLockElement) {
            setSimulatorPaused(!inputState.isPaused);
          }
        }
      }

      keysPressed.current.add(key);
      updateContinuousState();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
      updateContinuousState();
    };

    const updateContinuousState = () => {
      const keys = keysPressed.current;

      // Throttle
      inputState.throttle = keys.has('w') || keys.has('arrowup') ? 1 : 0;
      
      // Brake
      inputState.brake = keys.has('s') || keys.has('arrowdown') ? 1 : 0;

      // Keyboard steering fallback (if pointer lock is not active, though mouse overrides it)
      if (!document.pointerLockElement) {
        if (keys.has('a') || keys.has('arrowleft')) inputState.steering = -1;
        else if (keys.has('d') || keys.has('arrowright')) inputState.steering = 1;
        else inputState.steering = 0;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!document.pointerLockElement || inputState.isPaused) return;
      
      // Mouse steering
      const steeringDelta = e.movementX * inputState.mouseSensitivity;
      inputState.steering = Math.max(-1, Math.min(1, inputState.steering + steeringDelta));
    };

    const handlePointerLockChange = () => {
      if (!document.pointerLockElement) {
        // Paused when pointer lock is lost
        inputState.isPaused = true;
      } else {
        inputState.isPaused = false;
      }
    };

    // Auto-center steering loop
    let centerFrameId: number;
    const centerSteering = () => {
      if (inputState.steering !== 0) {
        // Natural return to center if no mouse movement
        inputState.steering *= 0.95;
        if (Math.abs(inputState.steering) < 0.01) {
          inputState.steering = 0;
        }
      }
      centerFrameId = requestAnimationFrame(centerSteering);
    };
    centerFrameId = requestAnimationFrame(centerSteering);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    // Initial click to lock
    const canvas = document.querySelector('canvas');
    const handleCanvasClick = () => {
      if (!inputState.isPaused) {
        canvas?.requestPointerLock();
      }
    };
    canvas?.addEventListener('click', handleCanvasClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      canvas?.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(centerFrameId);
    };
  }, []);

  return inputState;
}
