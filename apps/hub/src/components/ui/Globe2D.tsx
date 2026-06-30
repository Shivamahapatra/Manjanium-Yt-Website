"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { ArcData, PointData, GeoJsonData, GlobeConfig } from "@/types/globe";
import localWorldData from "../../../public/globe.json";
import { findVenueByCoords } from "@/lib/globe-interactions";
import { getThemeArcColor } from "@/lib/globe-themes";

// Convert degrees to radians
const toRadians = (deg: number) => (deg * Math.PI) / 180;

// Orthographic projection mapping 3D spherical points to 2D canvas coordinates
function project(
  lat: number,
  lng: number,
  lat0: number,
  lng0: number,
  R: number,
  cx: number,
  cy: number
) {
  const phi = toRadians(lat);
  const lambda = toRadians(lng);
  const phi0 = toRadians(lat0);
  const lambda0 = toRadians(lng0);

  const dLambda = lambda - lambda0;

  const x = Math.cos(phi) * Math.sin(dLambda);
  const y = Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(dLambda);
  const z = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(dLambda);

  return {
    x: cx + R * x,
    y: cy - R * y,
    visible: z >= 0, // Visible on the front-facing hemisphere
  };
}

// Draw a single polygon outline segment on the sphere face
function drawPolygonRing(
  ctx: CanvasRenderingContext2D,
  ring: number[][],
  lat0: number,
  lng0: number,
  R: number,
  cx: number,
  cy: number
) {
  if (ring.length < 2) return;

  ctx.beginPath();
  let first = true;

  for (const point of ring) {
    const lng = point[0];
    const lat = point[1];
    const proj = project(lat, lng, lat0, lng0, R, cx, cy);

    if (proj.visible) {
      if (first) {
        ctx.moveTo(proj.x, proj.y);
        first = false;
      } else {
        ctx.lineTo(proj.x, proj.y);
      }
    } else {
      first = true; // Break the line segment when moving to the back face
    }
  }
  ctx.stroke();
}

interface Globe2DProps {
  globeConfig: GlobeConfig;
  data: ArcData[];
  highlightedRound?: number;
  onHoverArc?: (arc: ArcData | null) => void;
  onHoverPoint?: (point: PointData | null) => void;
  onPointClick?: (point: PointData) => void;
  onArcClick?: (arc: ArcData) => void;
  onHoverRoundChange?: (round: number | null) => void;
  hoveredArc?: ArcData | null;
}

export const Globe2D = React.memo(function Globe2D({
  globeConfig,
  data,
  highlightedRound,
  onHoverArc,
  onHoverPoint,
  onPointClick,
  onArcClick,
  onHoverRoundChange,
  hoveredArc,
}: Globe2DProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });

  // Sphere rotation state
  const rotationRef = useRef({ lat: 0, lng: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, lat: 0, lng: 0 });

  // Get initial position if specified
  useEffect(() => {
    if (globeConfig.initialPosition) {
      rotationRef.current = {
        lat: globeConfig.initialPosition.lat,
        lng: globeConfig.initialPosition.lng,
      };
    }
  }, [globeConfig.initialPosition]);

  // Handle container resizing
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({
          width: width || 400,
          height: height || 400,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Sync canvas display size to pixel ratio for high DPI displays
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
  }, [dimensions]);

  // Extract unique points to display venue nodes
  const points = useMemo<PointData[]>(() => {
    const ptMap = new Map<string, PointData>();
    data.forEach((arc) => {
      const keyStart = `${arc.startLat.toFixed(4)},${arc.startLng.toFixed(4)}`;
      const keyEnd = `${arc.endLat.toFixed(4)},${arc.endLng.toFixed(4)}`;
      
      ptMap.set(keyStart, {
        lat: arc.startLat,
        lng: arc.startLng,
        color: arc.color,
        round: arc.round,
        venueId: arc.venueId,
      });
      ptMap.set(keyEnd, {
        lat: arc.endLat,
        lng: arc.endLng,
        color: arc.color,
        round: arc.round,
        venueId: arc.venueId,
      });
    });
    return Array.from(ptMap.values());
  }, [data]);

  // Drag interaction handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    isDraggingRef.current = true;
    dragStartRef.current = {
      x: mx,
      y: my,
      lat: rotationRef.current.lat,
      lng: rotationRef.current.lng,
    };
    canvas.style.cursor = "grabbing";
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const lat0 = rotationRef.current.lat;
    const lng0 = rotationRef.current.lng;
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;
    const R = Math.min(dimensions.width, dimensions.height) * 0.42;

    if (isDraggingRef.current) {
      const dx = mx - dragStartRef.current.x;
      const dy = my - dragStartRef.current.y;
      rotationRef.current.lng = dragStartRef.current.lng - dx * 0.45;
      rotationRef.current.lat = Math.max(-80, Math.min(80, dragStartRef.current.lat + dy * 0.45));
      return;
    }

    // Hover check for point markers (venues)
    let hoveredPt: PointData | null = null;
    let minDistance = 12;

    for (const pt of points) {
      const proj = project(pt.lat, pt.lng, lat0, lng0, R, cx, cy);
      if (proj.visible) {
        const dist = Math.hypot(mx - proj.x, my - proj.y);
        if (dist < minDistance) {
          minDistance = dist;
          hoveredPt = pt;
        }
      }
    }

    if (hoveredPt) {
      if (onHoverPoint) onHoverPoint(hoveredPt);
      if (onHoverRoundChange && hoveredPt.round) onHoverRoundChange(hoveredPt.round);
      canvas.style.cursor = "pointer";
    } else {
      if (onHoverPoint) onHoverPoint(null);
      if (onHoverRoundChange) onHoverRoundChange(null);

      // Hover check for arc lines
      let hoveredArcObj: ArcData | null = null;
      let minArcDist = 8;

      for (const arc of data) {
        const pStart = project(arc.startLat, arc.startLng, lat0, lng0, R, cx, cy);
        const pEnd = project(arc.endLat, arc.endLng, lat0, lng0, R, cx, cy);
        if (pStart.visible && pEnd.visible) {
          const mxArc = (pStart.x + pEnd.x) / 2;
          const myArc = (pStart.y + pEnd.y) / 2;
          const vx = mxArc - cx;
          const vy = myArc - cy;
          const len = Math.hypot(vx, vy);
          const h = arc.arcAlt || 0.2;
          const pxArc = mxArc + (vx / len) * R * h;
          const pyArc = myArc + (vy / len) * R * h;

          const distToMid = Math.hypot(mx - pxArc, my - pyArc);
          if (distToMid < minArcDist) {
            minArcDist = distToMid;
            hoveredArcObj = arc;
          }
        }
      }

      if (hoveredArcObj) {
        if (onHoverArc) onHoverArc(hoveredArcObj);
        canvas.style.cursor = "pointer";
      } else {
        if (onHoverArc) onHoverArc(null);
        canvas.style.cursor = "grab";
      }
    }
  }, [points, data, dimensions, onHoverPoint, onHoverArc, onHoverRoundChange]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = "grab";
    }
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const dragDist = Math.hypot(mx - dragStartRef.current.x, my - dragStartRef.current.y);
    if (dragDist > 5) return; // Ignore clicks if user dragged the sphere

    const lat0 = rotationRef.current.lat;
    const lng0 = rotationRef.current.lng;
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;
    const R = Math.min(dimensions.width, dimensions.height) * 0.42;

    // Check click on point venues
    let clickedPt: PointData | null = null;
    let minDistance = 15;

    for (const pt of points) {
      const proj = project(pt.lat, pt.lng, lat0, lng0, R, cx, cy);
      if (proj.visible) {
        const dist = Math.hypot(mx - proj.x, my - proj.y);
        if (dist < minDistance) {
          minDistance = dist;
          clickedPt = pt;
        }
      }
    }

    if (clickedPt) {
      if (onPointClick) onPointClick(clickedPt);
      return;
    }

    // Check click on arc lines
    let clickedArcObj: ArcData | null = null;
    let minArcDist = 12;

    for (const arc of data) {
      const pStart = project(arc.startLat, arc.startLng, lat0, lng0, R, cx, cy);
      const pEnd = project(arc.endLat, arc.endLng, lat0, lng0, R, cx, cy);
      if (pStart.visible && pEnd.visible) {
        const mxArc = (pStart.x + pEnd.x) / 2;
        const myArc = (pStart.y + pEnd.y) / 2;
        const vx = mxArc - cx;
        const vy = myArc - cy;
        const len = Math.hypot(vx, vy);
        const h = arc.arcAlt || 0.2;
        const pxArc = mxArc + (vx / len) * R * h;
        const pyArc = myArc + (vy / len) * R * h;

        const distToMid = Math.hypot(mx - pxArc, my - pyArc);
        if (distToMid < minArcDist) {
          minArcDist = distToMid;
          clickedArcObj = arc;
        }
      }
    }

    if (clickedArcObj && onArcClick) {
      onArcClick(clickedArcObj);
    }
  }, [points, data, dimensions, onPointClick, onArcClick]);

  // Touch handlers for mobile devices
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const mx = touch.clientX - rect.left;
    const my = touch.clientY - rect.top;

    isDraggingRef.current = true;
    dragStartRef.current = {
      x: mx,
      y: my,
      lat: rotationRef.current.lat,
      lng: rotationRef.current.lng,
    };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || e.touches.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const mx = touch.clientX - rect.left;
    const my = touch.clientY - rect.top;

    const dx = mx - dragStartRef.current.x;
    const dy = my - dragStartRef.current.y;
    rotationRef.current.lng = dragStartRef.current.lng - dx * 0.45;
    rotationRef.current.lat = Math.max(-80, Math.min(80, dragStartRef.current.lat + dy * 0.45));
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  // Main drawing engine loop
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const dpr = window.devicePixelRatio || 1;
    const width = dimensions.width;
    const height = dimensions.height;
    const cx = width / 2;
    const cy = height / 2;
    const R = Math.min(width, height) * 0.42;

    const lat0 = rotationRef.current.lat;
    const lng0 = rotationRef.current.lng;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width * dpr, height * dpr);
    ctx.scale(dpr, dpr);

    const isDark = globeConfig.globeColor !== "#e8f1f5";
    const globeBg = globeConfig.globeColor || (isDark ? "#0b1329" : "#e8f1f5");
    const polygonStroke = globeConfig.polygonColor || (isDark ? "rgba(14, 165, 233, 0.45)" : "rgba(14, 165, 233, 0.25)");
    const atmosphereColor = globeConfig.atmosphereColor || (isDark ? "#2563eb" : "#87ceeb");

    // 1. Atmosphere Radial Glow
    const glowGrad = ctx.createRadialGradient(cx, cy, R, cx, cy, R + 16);
    glowGrad.addColorStop(0, atmosphereColor + (isDark ? "22" : "15"));
    glowGrad.addColorStop(0.5, atmosphereColor + "0a");
    glowGrad.addColorStop(1, "rgba(0,0,0,0)");

    ctx.beginPath();
    ctx.arc(cx, cy, R + 16, 0, 2 * Math.PI);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // 2. Shaded Globe Sphere Background
    const sphereGrad = ctx.createRadialGradient(cx - R / 3, cy - R / 3, R / 10, cx, cy, R);
    if (isDark) {
      sphereGrad.addColorStop(0, "#13234d");
      sphereGrad.addColorStop(1, globeBg);
    } else {
      sphereGrad.addColorStop(0, "#ffffff");
      sphereGrad.addColorStop(1, globeBg);
    }

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 2 * Math.PI);
    ctx.fillStyle = sphereGrad;
    ctx.fill();

    // Sphere border stroke
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0,0,0,0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Clip outlines to the globe bounds
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 2 * Math.PI);
    ctx.clip();

    // 3. High-Tech Graticules (Latitude & Longitude grid lines)
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0,0,0,0.02)";
    ctx.lineWidth = 0.5;

    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      let first = true;
      for (let lng = -180; lng <= 180; lng += 8) {
        const proj = project(lat, lng, lat0, lng0, R, cx, cy);
        if (proj.visible) {
          if (first) {
            ctx.moveTo(proj.x, proj.y);
            first = false;
          } else {
            ctx.lineTo(proj.x, proj.y);
          }
        } else {
          first = true;
        }
      }
      ctx.stroke();
    }

    for (let lng = -180; lng < 180; lng += 30) {
      ctx.beginPath();
      let first = true;
      for (let lat = -80; lat <= 80; lat += 8) {
        const proj = project(lat, lng, lat0, lng0, R, cx, cy);
        if (proj.visible) {
          if (first) {
            ctx.moveTo(proj.x, proj.y);
            first = false;
          } else {
            ctx.lineTo(proj.x, proj.y);
          }
        } else {
          first = true;
        }
      }
      ctx.stroke();
    }

    // 4. Country Vector Map Polygons
    ctx.strokeStyle = polygonStroke;
    ctx.lineWidth = 0.55;

    if (localWorldData && localWorldData.features) {
      localWorldData.features.forEach((feature) => {
        const geom = feature.geometry as any;
        if (geom.type === "Polygon") {
          drawPolygonRing(ctx, geom.coordinates[0], lat0, lng0, R, cx, cy);
        } else if (geom.type === "MultiPolygon") {
          geom.coordinates.forEach((poly: any) => {
            drawPolygonRing(ctx, poly[0], lat0, lng0, R, cx, cy);
          });
        }
      });
    }

    ctx.restore(); // Exit sphere clipping

    // 5. Curved Connection Arcs
    data.forEach((arc) => {
      const pStart = project(arc.startLat, arc.startLng, lat0, lng0, R, cx, cy);
      const pEnd = project(arc.endLat, arc.endLng, lat0, lng0, R, cx, cy);

      if (pStart.visible && pEnd.visible) {
        const mx = (pStart.x + pEnd.x) / 2;
        const my = (pStart.y + pEnd.y) / 2;
        const vx = mx - cx;
        const vy = my - cy;
        const len = Math.hypot(vx, vy);
        
        let pCtrlX = mx;
        let pCtrlY = my;

        if (len > 0) {
          const h = arc.arcAlt || 0.25;
          pCtrlX = mx + (vx / len) * R * h;
          pCtrlY = my + (vy / len) * R * h;
        }

        const isHovered = hoveredArc &&
          Math.abs(arc.startLat - hoveredArc.startLat) < 0.01 &&
          Math.abs(arc.startLng - hoveredArc.startLng) < 0.01;

        const isHighlighted = highlightedRound && arc.round === highlightedRound;

        let color = arc.color || "#0ea5e9";
        let width = arc.stroke || 0.8;

        if (isHovered) {
          color = isDark ? "#00f0ff" : "#0284c7";
          width = 1.8;
        } else if (isHighlighted) {
          color = "#fbbf24";
          width = 1.4;
        } else if (hoveredArc) {
          color = isDark ? "rgba(14, 165, 233, 0.1)" : "rgba(14, 165, 233, 0.12)";
          width = 0.55;
        } else {
          color = getThemeArcColor(color, isDark ? "dark" : "light");
        }

        ctx.beginPath();
        ctx.moveTo(pStart.x, pStart.y);
        ctx.quadraticCurveTo(pCtrlX, pCtrlY, pEnd.x, pEnd.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();

        // Pulsing animated dashed tracer on active/hover lines
        if (globeConfig.autoRotate && !isHovered && !hoveredArc) {
          ctx.save();
          ctx.strokeStyle = isDark ? "rgba(255,255,255,0.3)" : "rgba(14,165,233,0.4)";
          ctx.lineWidth = width * 1.1;
          ctx.setLineDash([4, 14]);
          ctx.lineDashOffset = -((Date.now() / 32) % 18);
          ctx.beginPath();
          ctx.moveTo(pStart.x, pStart.y);
          ctx.quadraticCurveTo(pCtrlX, pCtrlY, pEnd.x, pEnd.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    });

    // 6. Point Markers (Grand Prix Venues)
    points.forEach((pt) => {
      const proj = project(pt.lat, pt.lng, lat0, lng0, R, cx, cy);
      if (proj.visible) {
        const isHighlighted = highlightedRound && pt.round === highlightedRound;
        const isHovered = hoveredArc && pt.round === hoveredArc.round;

        let radius = isHighlighted ? 4 : 2.5;
        let color = pt.color || "#ef4444";

        if (isHighlighted) {
          color = "#fbbf24";
        } else if (isHovered) {
          color = isDark ? "#00f0ff" : "#0284c7";
          radius = 3.5;
        } else {
          color = getThemeArcColor(color, isDark ? "dark" : "light");
        }

        // Draw node center point
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        // Draw node outer ring
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, radius + 2, 0, 2 * Math.PI);
        ctx.strokeStyle = isHighlighted ? "rgba(251, 191, 36, 0.6)" : color + "80";
        ctx.lineWidth = 0.85;
        ctx.stroke();

        // Glowing node pulses
        if (isHighlighted || isHovered) {
          const pulse = 2 + Math.sin(Date.now() / 140) * 1.5;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, radius + pulse, 0, 2 * Math.PI);
          ctx.strokeStyle = color + "33";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });

    ctx.restore();
  }, [dimensions, globeConfig, data, points, highlightedRound, hoveredArc]);

  // Render loop effect hook
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const isAutoRotate = globeConfig.autoRotate ?? true;
      if (!isDraggingRef.current && isAutoRotate) {
        rotationRef.current.lng += (globeConfig.autoRotateSpeed ?? 0.6) * 0.35;
      }

      draw(ctx);
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [globeConfig.autoRotate, globeConfig.autoRotateSpeed, draw]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-grab select-none animate-fade-in"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
});
export default Globe2D;
