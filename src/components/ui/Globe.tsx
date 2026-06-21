"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, extend } from "@react-three/fiber";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "@react-three/drei";
import { Color, Vector3 } from "three";
import { getGlobeData } from "@/lib/globe-cache";

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

export const GlobeComponent = React.memo(function GlobeComponent({ globeConfig, data }: WorldProps) {
  const globeRef = useRef<ThreeGlobe>(null);
  const [worldData, setWorldData] = useState<any>(null);

  // Load geojson data for earth land representation with caching and cancel on unmount
  useEffect(() => {
    const controller = new AbortController();
    getGlobeData(controller.signal)
      .then((data) => {
        setWorldData(data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Failed to load globe geojson:", err);
        }
      });
    return () => {
      controller.abort();
    };
  }, []);

  // Memoize point data processing to avoid recalculations on every render
  const points = useMemo(() => {
    return data.flatMap((d: any) => [
      { lat: d.startLat, lng: d.startLng, color: d.color },
      { lat: d.endLat, lng: d.endLng, color: d.color }
    ]);
  }, [data]);

  // Handle globe geometry, arcs, and markers configuration
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
      if (globe.globeMaterial) {
        globe.globeMaterial().color = new Color(globeConfig.globeColor || "#06182c");
      }

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

      // Markers on arc start/end points using memoized points
      globe
        .pointsData(points)
        .pointLat((d: any) => d.lat)
        .pointLng((d: any) => d.lng)
        .pointColor((d: any) => d.color || "#ef4444")
        .pointAltitude(0.01)
        .pointRadius(0.8);
    }
  }, [globeConfig, data, points]);

  // Hex Polygons representing Earth continents
  useEffect(() => {
    if (globeRef.current && worldData) {
      const globe = globeRef.current as any;
      globe
        .hexPolygonsData(worldData.features)
        .hexPolygonResolution(2) // Reduced resolution from 3 to 2 for better performance
        .hexPolygonMargin(0.7)
        .hexPolygonColor(() => globeConfig.polygonColor || "rgba(14, 165, 233, 0.45)");
    }
  }, [worldData, globeConfig]);

  // Clean up and dispose of Three.js objects on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (globeRef.current) {
        const globe = globeRef.current as any;
        if (globe.globeMaterial) {
          const mat = globe.globeMaterial();
          if (mat && typeof mat.dispose === "function") {
            mat.dispose();
          }
        }
        globe.traverse((object: any) => {
          if (object.geometry && typeof object.geometry.dispose === "function") {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((mat: any) => {
                if (typeof mat.dispose === "function") mat.dispose();
              });
            } else if (typeof object.material.dispose === "function") {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, []);

  return <threeGlobe ref={globeRef} />;
});

export const Globe = React.memo(function Globe({ globeConfig, data }: WorldProps) {
  const ambientColor = globeConfig.ambientLight || "#faf0e6";
  const directionalLeftColor = globeConfig.directionalLeftLight || "#ffffff";
  const directionalTopColor = globeConfig.directionalTopLight || "#ffffff";
  const pointColor = globeConfig.pointLight || "#ffffff";

  const containerRef = useRef<HTMLDivElement>(null);
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true);
          observer.disconnect(); // Keep it rendered once it becomes visible
        }
      },
      {
        threshold: 0.05,
        rootMargin: "100px", // Load 100px before entering screen
      }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[300px] flex items-center justify-center relative">
      {isInViewport ? (
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
      ) : (
        <div className="absolute inset-0 rounded-full bg-neutral-900/40 animate-pulse border border-neutral-850 flex items-center justify-center">
          <span className="text-neutral-500 text-xs font-mono">Initializing 3D viewport...</span>
        </div>
      )}
    </div>
  );
});
