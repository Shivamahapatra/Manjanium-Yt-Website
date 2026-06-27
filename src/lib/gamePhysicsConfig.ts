import { GamePhysicsConfig } from '@/types/simulatorGame'

export const PHYSICS_CONFIG: GamePhysicsConfig = {
  gravity: -9.81,
  car_mass: 798, // F1 car weight in kg
  max_speed_kmh: 350,
  throttle_force: 50000, // Newtons
  brake_force: 80000,
  friction: 1.2, // Grip coefficient
  wheel_radius: 0.35,
}

export const TRACK_CHECKPOINTS = {
  monza: [
    { id: 'sf', position: [0, 0.1, 0] as [number, number, number], radius: 8, type: 'start-finish' as const },
    { id: 's1', position: [100, 0.1, -150] as [number, number, number], radius: 15, type: 'sector' as const },
    { id: 's2', position: [200, 0.1, 100] as [number, number, number], radius: 15, type: 'sector' as const },
  ],
  monaco: [
    { id: 'sf', position: [0, 0.1, 0] as [number, number, number], radius: 6, type: 'start-finish' as const },
    { id: 's1', position: [80, 0.1, -100] as [number, number, number], radius: 12, type: 'sector' as const },
    { id: 's2', position: [150, 0.1, 80] as [number, number, number], radius: 12, type: 'sector' as const },
  ],
  spa: [
    { id: 'sf', position: [0, 0.1, 0] as [number, number, number], radius: 10, type: 'start-finish' as const },
    { id: 's1', position: [120, 0.1, -180] as [number, number, number], radius: 18, type: 'sector' as const },
    { id: 's2', position: [250, 0.1, 120] as [number, number, number], radius: 18, type: 'sector' as const },
  ],
  austin: [
    { id: 'sf', position: [0, 0.1, 0] as [number, number, number], radius: 9, type: 'start-finish' as const },
    { id: 's1', position: [110, 0.1, -160] as [number, number, number], radius: 16, type: 'sector' as const },
    { id: 's2', position: [220, 0.1, 110] as [number, number, number], radius: 16, type: 'sector' as const },
  ],
  silverstone: [
    { id: 'sf', position: [0, 0.1, 0] as [number, number, number], radius: 8, type: 'start-finish' as const },
    { id: 's1', position: [105, 0.1, -155] as [number, number, number], radius: 15, type: 'sector' as const },
    { id: 's2', position: [210, 0.1, 105] as [number, number, number], radius: 15, type: 'sector' as const },
  ],
}
