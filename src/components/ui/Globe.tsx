"use client";

import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { useSpring } from "react-spring";

interface GlobeProps {
  className?: string;
  width?: number;
  height?: number;
  phi?: number;
  theta?: number;
  dark?: number;
  diffuse?: number;
  mapSamples?: number;
  mapBrightness?: number;
  baseColor?: [number, number, number];
  markerColor?: [number, number, number];
  glowColor?: [number, number, number];
  markers?: Array<{ location: [number, number]; size: number }>;
}

export function Globe({
  className,
  width = 600,
  height = 600,
  phi = 0,
  theta = 0.3,
  dark = 1,
  diffuse = 1.2,
  mapSamples = 16000,
  mapBrightness = 6,
  baseColor = [0.3, 0.3, 0.3],
  markerColor = [0.1, 0.8, 1],
  glowColor = [1, 1, 1],
  markers = [],
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef<number>(0);

  const [{ r }, api] = useSpring(() => ({
    r: 0,
    config: { mass: 1, tension: 280, friction: 40 },
  }));

  useEffect(() => {
    let phiVal = phi;
    let globe: any;

    if (canvasRef.current) {
      globe = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: width * 2,
        height: height * 2,
        phi,
        theta,
        dark,
        diffuse,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.1, 0.1, 0.2],
        markerColor: [0.1, 0.8, 1.0],
        glowColor: [0.2, 0.4, 1.0],
        markers,
        onRender: (state: any) => {
          state.phi = phiVal + r.get();
          state.width = width * 2;
          state.height = height * 2;
          phiVal += 0.005;
        },
      } as any);
    }

    return () => {
      if (globe) {
        globe.destroy();
      }
    };
  }, [width, height, phi, theta, dark, diffuse, markers, r]);

  return (
    <div className={`${className} relative overflow-hidden`} style={{ width, height }}>
      <canvas
        ref={canvasRef}
        width={width * 2}
        height={height * 2}
        style={{
          width,
          height,
          cursor: "grab",
          outline: "none",
        }}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
          if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = "grab";
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = "grab";
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta;
            api.start({ r: delta / 200 });
          }
        }}
      />
    </div>
  );
}
