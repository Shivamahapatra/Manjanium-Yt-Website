"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, extend, useThree } from "@react-three/fiber";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "@react-three/drei";
import { Color, Vector3 } from "three";

extend({ ThreeGlobe });

declare module "@react-three/fiber" {
  interface ThreeElements {
    threeGlobe: any;
  }
}

export type GlobeConfig = {
  pointSize?: number;
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  pointLight?: string;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  initialPosition?: {
    lat: number;
    lng: number;
  };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
};

interface WorldProps {
  globeConfig: GlobeConfig;
  data: Array<{
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    arcAlt?: number;
    color?: string;
    stroke?: number;
  }>;
}

export function GlobeComponent({ globeConfig, data }: WorldProps) {
  const globeRef = useRef<ThreeGlobe>(null);
  const [worldData, setWorldData] = useState<any>(null);

  // Load geojson data for earth land representation
  useEffect(() => {
    fetch("https://raw.githubusercontent.com/igorssc/react-globe/main/public/globe.json")
      .then((res) => res.json())
      .then((data) => {
        setWorldData(data);
      })
      .catch((err) => console.error("Failed to load globe geojson:", err));
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      const globe = globeRef.current as any;

      // Atmosphere settings
      globe.showAtmosphere(globeConfig.showAtmosphere ?? true);
      if (globeConfig.atmosphereColor) {
        globe.atmosphereColor(globeConfig.atmosphereColor);
      }
      if (globeConfig.atmosphereAltitude) {
        globe.atmosphereAltitude(globeConfig.atmosphereAltitude);
      }

      // Globe base appearance
      globe.globeColor(globeConfig.globeColor || "#06182c");

      // Arcs rendering
      globe
        .arcsData(data)
        .arcStartLat((d: any) => d.startLat)
        .arcStartLng((d: any) => d.startLng)
        .arcEndLat((d: any) => d.endLat)
        .arcEndLng((d: any) => d.endLng)
        .arcColor((d: any) => d.color || "#0ea5e9")
        .arcAltitude((d: any) => d.arcAlt || 0.3)
        .arcStroke((d: any) => d.stroke || 0.6)
        .arcDashLength(0.9)
        .arcDashGap(3)
        .arcDashAnimateTime(1200);

      // Markers on arc start/end points
      const points = data.flatMap((d: any) => [
        { lat: d.startLat, lng: d.startLng, color: d.color },
        { lat: d.endLat, lng: d.endLng, color: d.color }
      ]);

      globe
        .pointsData(points)
        .pointLat((d: any) => d.lat)
        .pointLng((d: any) => d.lng)
        .pointColor((d: any) => d.color || "#ef4444")
        .pointAltitude(0.01)
        .pointRadius(0.8);
    }
  }, [globeConfig, data]);

  // Hex Polygons representing Earth continents
  useEffect(() => {
    if (globeRef.current && worldData) {
      const globe = globeRef.current as any;
      globe
        .hexPolygonsData(worldData.features)
        .hexPolygonResolution(3)
        .hexPolygonMargin(0.7)
        .hexPolygonColor(() => globeConfig.polygonColor || "rgba(14, 165, 233, 0.45)");
    }
  }, [worldData, globeConfig]);

  return <threeGlobe ref={globeRef} />;
}

export function Globe({ globeConfig, data }: WorldProps) {
  const ambientColor = globeConfig.ambientLight || "#faf0e6";
  const directionalLeftColor = globeConfig.directionalLeftLight || "#ffffff";
  const directionalTopColor = globeConfig.directionalTopLight || "#ffffff";
  const pointColor = globeConfig.pointLight || "#ffffff";

  return (
    <Canvas camera={{ position: [0, 0, 280], fov: 60 }}>
      <ambientLight color={ambientColor} intensity={1.5} />
      <directionalLight
        color={directionalLeftColor}
        position={new Vector3(-400, 100, 400)}
        intensity={1.2}
      />
      <directionalLight
        color={directionalTopColor}
        position={new Vector3(-200, 500, 200)}
        intensity={1.0}
      />
      <pointLight
        color={pointColor}
        position={new Vector3(-200, 500, 200)}
        intensity={0.8}
      />
      <GlobeComponent globeConfig={globeConfig} data={data} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={globeConfig.autoRotate ?? true}
        autoRotateSpeed={globeConfig.autoRotateSpeed ?? 0.8}
      />
    </Canvas>
  );
}
