import React, { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getLeaderboard, LeaderboardEntry } from '../../lib/leaderboard';
import { useGamePhysics } from '../../store/telemetry';

interface GridAssemblyProps {
  trackId: string;
  radiusZ: number; // For placing on the track
}

export function GridAssembly({ trackId, radiusZ }: GridAssemblyProps) {
  const [grid, setGrid] = useState<LeaderboardEntry[]>([]);
  const weather = useGamePhysics(state => state.weather);

  useEffect(() => {
    // Fetch the grid based on weather
    getLeaderboard(trackId, weather, 10).then((data) => {
      setGrid(data);
    });
  }, [trackId, weather]);

  if (grid.length === 0) return null;

  return (
    <group>
      {grid.map((entry, index) => {
        // Position offsets stretching back from pole position
        // Pole position is index 0
        const isLeft = index % 2 === 0; // Staggered grid
        // The start finish line is at -radiusZ
        // If the car moves in positive Z direction (wait, in DynamicRaycastVehicleController, it starts at [0, 2, 0] or [0, 2, 10]?)
        // The start finish line is at `-(config.radiusZ)`. The cars start facing positive Z or negative Z?
        // In DynamicRaycastVehicleController: `const [chassisPosition, setChassisPosition] = useState([0, 2, 10]);`
        // They start at Z=10, start finish is at Z = -radiusZ. So they drive towards negative Z.
        // That means the grid should stretch in the POSITIVE Z direction.
        const zOffset = -(radiusZ) + (index * 8) + 10; 
        const xOffset = isLeft ? -4 : 4;

        return (
          <group key={entry.id} position={[xOffset, 0, zOffset]}>
            {/* Simple static car representation (ghost-like so we don't collide) */}
            <mesh position={[0, 0.4, 0]} castShadow>
              <boxGeometry args={[2, 0.8, 4.5]} />
              <meshStandardMaterial color="#888888" transparent opacity={0.5} roughness={0.8} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
