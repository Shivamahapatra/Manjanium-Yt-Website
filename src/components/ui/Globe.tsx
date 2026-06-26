"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "@react-three/drei";
import { Color, Vector3, Mesh, Object3D, MeshPhongMaterial } from "three";
import { message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Compass, Info, Trophy, Milestone } from "lucide-react";
import localWorldData from "../../../public/globe.json";
import { Globe2D } from "./Globe2D";
import { useResponsiveGlobe } from "@/hooks/useResponsiveGlobe";
import { GlobeFallback, GlobeErrorType } from "@/components/ui/GlobeFallback";
import DecryptedText from "./DecryptedText";
import { ArcData, PointData, GeoJsonFeature, GeoJsonData, GlobeConfig } from "@/types/globe";
import { findVenueByCoords, VenueDetailInfo } from "@/lib/globe-interactions";
import { VenueTooltip } from "@/components/globe/VenueTooltip";
import { getCountryFlag } from "@/lib/f1-helpers";
import { useSettings } from "@/lib/settings-context";
import { GLOBE_THEMES, getThemeArcColor } from "@/lib/globe-themes";
import { useGlobeKeepAlive } from "@/hooks/useGlobeKeepAlive";

extend({ ThreeGlobe });

declare module "@react-three/fiber" {
  interface ThreeElements {
    threeGlobe: { ref?: React.Ref<ThreeGlobe> };
  }
}

// WebGL Compatibility check
function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

// React Error Boundary class to trap rendering failures in the ThreeJS canvas tree
class CanvasErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: (error: Error) => React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback: (error: Error) => React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, _errorInfo: React.ErrorInfo) {
    console.error("[Globe Render Error]", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      webglSupport: checkWebGLSupport(),
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.state.error || new Error("Unknown rendering error"));
    }
    return this.props.children;
  }
}

// R3F Component to smoothly interpolate/lerp camera view to focused F1 venue coordinates
interface CameraFocusControllerProps {
  focusCoords: { lat: number; lng: number } | null;
  cameraZ: number;
  onFocusComplete: () => void;
  controlsRef: React.RefObject<any>;
}

function CameraFocusController({
  focusCoords,
  cameraZ,
  onFocusComplete,
  controlsRef,
}: CameraFocusControllerProps) {
  const { camera } = useThree();

  useFrame(() => {
    if (!focusCoords || !controlsRef.current) return;

    const latRad = (focusCoords.lat * Math.PI) / 180;
    const lngRad = (focusCoords.lng * Math.PI) / 180;

    // Convert coordinates: X/Y/Z mapping to three-globe standard orientation
    const targetX = cameraZ * Math.cos(latRad) * Math.sin(lngRad);
    const targetY = cameraZ * Math.sin(latRad);
    const targetZ = cameraZ * Math.cos(latRad) * Math.cos(lngRad);

    const targetPos = new Vector3(targetX, targetY, targetZ);

    // Smoothly lerp camera position
    camera.position.lerp(targetPos, 0.05);
    controlsRef.current.update();

    if (camera.position.distanceTo(targetPos) < 1.5) {
      onFocusComplete();
    }
  });

  return null;
}

interface WorldProps {
  globeConfig: GlobeConfig;
  data: ArcData[];
  polygonResolution?: number;
  isMobile?: boolean;
  worldData?: GeoJsonData | null;
  highlightedRound?: number;
  onPointClick?: (point: PointData) => void;
  onArcClick?: (arc: ArcData) => void;
  onHoverRoundChange?: (round: number | null) => void;
}

interface GlobeComponentProps extends WorldProps {
  onHoverArc: (arc: ArcData | null) => void;
  onHoverPoint: (point: PointData | null) => void;
  onClickPoint: (point: PointData) => void;
  onClickArc: (arc: ArcData) => void;
  hoveredArc: ArcData | null;
  theme: "dark" | "light";
  highlightedRound?: number;
}

export const GlobeComponent = React.memo(function GlobeComponent({
  globeConfig,
  data,
  polygonResolution = 2,
  isMobile = false,
  worldData,
  onHoverArc,
  onHoverPoint,
  onClickPoint,
  onClickArc,
  hoveredArc,
  theme,
  highlightedRound,
}: GlobeComponentProps): React.JSX.Element {
  const globeRef = useRef<ThreeGlobe>(null);

  // Memoize point data processing to avoid recalculations on every render
  const points = useMemo<PointData[]>(() => {
    return data.flatMap((d: ArcData) => [
      { lat: d.startLat, lng: d.startLng, color: d.color, round: d.round, venueId: d.venueId },
      { lat: d.endLat, lng: d.endLng, color: d.color, round: d.round, venueId: d.venueId }
    ]);
  }, [data]);

  // Handle globe geometry, arcs, points and callback interactions
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

      // Globe base appearance using strictly cast MeshPhongMaterial
      if (globe.globeMaterial) {
        const material = globe.globeMaterial() as MeshPhongMaterial;
        if (material) {
          material.color = new Color(globeConfig.globeColor || "#06182c");
        }
      }

      // Arcs rendering
      globe
        .arcsData(data)
        .arcStartLat((d: object) => (d as ArcData).startLat)
        .arcStartLng((d: object) => (d as ArcData).startLng)
        .arcEndLat((d: object) => (d as ArcData).endLat)
        .arcEndLng((d: object) => (d as ArcData).endLng)
        .arcColor((d: object) => {
          const arc = d as ArcData;
          if (hoveredArc) {
            const isHovered =
              Math.abs(arc.startLat - hoveredArc.startLat) < 0.01 &&
              Math.abs(arc.startLng - hoveredArc.startLng) < 0.01 &&
              Math.abs(arc.endLat - hoveredArc.endLat) < 0.01 &&
              Math.abs(arc.endLng - hoveredArc.endLng) < 0.01;
            if (isHovered) {
              return theme === "light" ? "#0284c7" : "#00f0ff";
            }
            return theme === "light" ? "rgba(14, 165, 233, 0.2)" : "rgba(14, 165, 233, 0.15)";
          }
          if (highlightedRound && arc.round === highlightedRound) {
            return "#fbbf24";
          }
          const baseColor = arc.color || "#0ea5e9";
          return getThemeArcColor(baseColor, theme);
        })
        .arcAltitude((d: object) => (d as ArcData).arcAlt || 0.3)
        .arcStroke((d: object) => {
          const arc = d as ArcData;
          if (hoveredArc) {
            const isHovered =
              Math.abs(arc.startLat - hoveredArc.startLat) < 0.01 &&
              Math.abs(arc.startLng - hoveredArc.startLng) < 0.01 &&
              Math.abs(arc.endLat - hoveredArc.endLat) < 0.01 &&
              Math.abs(arc.endLng - hoveredArc.endLng) < 0.01;
            if (isHovered) return 1.6;
          }
          if (highlightedRound && arc.round === highlightedRound) {
            return 1.4;
          }
          return arc.stroke || 0.6;
        })
        .arcDashLength(0.9)
        .arcDashGap(3)
        .arcDashAnimateTime(isMobile ? 600 : 1200);

      // Markers on arc start/end points using memoized points
      globe
        .pointsData(points)
        .pointLat((d: object) => (d as PointData).lat)
        .pointLng((d: object) => (d as PointData).lng)
        .pointColor((d: object) => {
          const pt = d as PointData;
          if (highlightedRound && pt.round === highlightedRound) {
            return "#fbbf24";
          }
          const baseColor = pt.color || "#ef4444";
          return getThemeArcColor(baseColor, theme);
        })
        .pointAltitude((d: object) => {
          const pt = d as PointData;
          if (highlightedRound && pt.round === highlightedRound) {
            return 0.03;
          }
          return 0.01;
        })
        .pointRadius((d: object) => {
          const pt = d as PointData;
          if (highlightedRound && pt.round === highlightedRound) {
            return 1.4;
          }
          return 0.8;
        });

      // Register interactive events
      if (typeof globe.onArcHover === "function") {
        globe.onArcHover((hovered: object | null) => {
          onHoverArc(hovered as ArcData | null);
        });
      }
      if (typeof globe.onPointHover === "function") {
        globe.onPointHover((hovered: object | null) => {
          onHoverPoint(hovered as PointData | null);
        });
      }
      if (typeof globe.onPointClick === "function") {
        globe.onPointClick((clicked: object) => {
          onClickPoint(clicked as PointData);
        });
      }
      if (typeof globe.onArcClick === "function") {
        globe.onArcClick((clicked: object) => {
          onClickArc(clicked as ArcData);
        });
      }
    }
  }, [globeConfig, data, points, isMobile, hoveredArc, onHoverArc, onHoverPoint, onClickPoint, onClickArc, theme, highlightedRound]);

  // Hex Polygons representing Earth continents
  useEffect(() => {
    if (globeRef.current && worldData) {
      const globe = globeRef.current;
      globe
        .hexPolygonsData(worldData.features)
        .hexPolygonResolution(polygonResolution) // Uses dynamic responsive resolution
        .hexPolygonMargin(0.7)
        .hexPolygonColor(() => globeConfig.polygonColor || "rgba(14, 165, 233, 0.45)");
    }
  }, [worldData, globeConfig, polygonResolution]);

  // Clean up and dispose of Three.js objects on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (globeRef.current) {
        const globe = globeRef.current;
        if (globe.globeMaterial) {
          const mat = globe.globeMaterial() as MeshPhongMaterial;
          if (mat && typeof mat.dispose === "function") {
            mat.dispose();
          }
        }
        globe.traverse((object: Object3D) => {
          if (object instanceof Mesh) {
            if (object.geometry && typeof object.geometry.dispose === "function") {
              object.geometry.dispose();
            }
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach((mat) => {
                  if (typeof mat.dispose === "function") mat.dispose();
                });
              } else if (typeof object.material.dispose === "function") {
                object.material.dispose();
              }
            }
          }
        });
      }
    };
  }, []);

  return <threeGlobe ref={globeRef} />;
});

export const Globe = React.memo(function Globe({
  globeConfig,
  data,
  highlightedRound,
  onPointClick,
  onArcClick,
  onHoverRoundChange,
}: WorldProps): React.JSX.Element {
  // ── GlobeKeepAlive: hide via CSS instead of unmounting ──────────────────
  // If the GlobeProvider is not present in the tree (e.g. standalone usage)
  // we default to always-visible so the Globe still works without the provider.
  let isVisible = true;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ctx = useGlobeKeepAlive();
    isVisible = ctx.isVisible;
  } catch {
    // GlobeProvider not in tree – render normally
  }
  const { settings } = useSettings();
  const themeSetting = settings?.appearance?.theme || "dark";
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Helper to determine active theme based on user settings and system preference
  const getActiveTheme = useCallback((): "light" | "dark" => {
    if (themeSetting === "auto") {
      if (typeof window !== "undefined") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      return "dark";
    }
    return themeSetting as "light" | "dark";
  }, [themeSetting]);

  // Sync resolved theme on mount or when settings theme changes
  useEffect(() => {
    const active = getActiveTheme();
    if (active !== resolvedTheme) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setResolvedTheme(active);
        setIsTransitioning(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [getActiveTheme, resolvedTheme]);

  // Listen to OS color scheme changes if "auto" is active
  useEffect(() => {
    if (themeSetting !== "auto") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const active = mediaQuery.matches ? "dark" : "light";
      if (active !== resolvedTheme) {
        setIsTransitioning(true);
        const timer = setTimeout(() => {
          setResolvedTheme(active);
          setIsTransitioning(false);
        }, 100);
        return () => clearTimeout(timer);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeSetting, resolvedTheme]);

  const activeThemeConfig = GLOBE_THEMES[resolvedTheme];

  const mergedGlobeConfig = useMemo<GlobeConfig>(() => {
    return {
      ...globeConfig,
      ambientLight: globeConfig.ambientLight || activeThemeConfig.ambientLight,
      directionalLeftLight: globeConfig.directionalLeftLight || activeThemeConfig.directionalLeftLight,
      directionalTopLight: globeConfig.directionalTopLight || activeThemeConfig.directionalTopLight,
      pointLight: globeConfig.pointLight || activeThemeConfig.pointLight,
      globeColor: globeConfig.globeColor || activeThemeConfig.globeColor,
      polygonColor: globeConfig.polygonColor || activeThemeConfig.polygonColor,
      showAtmosphere: globeConfig.showAtmosphere ?? activeThemeConfig.showAtmosphere,
      atmosphereColor: globeConfig.atmosphereColor || activeThemeConfig.atmosphereColor,
      atmosphereAltitude: globeConfig.atmosphereAltitude ?? activeThemeConfig.atmosphereAltitude,
      autoRotate: globeConfig.autoRotate ?? activeThemeConfig.autoRotate,
      autoRotateSpeed: globeConfig.autoRotateSpeed ?? activeThemeConfig.autoRotateSpeed,
    };
  }, [globeConfig, activeThemeConfig]);

  const ambientColor = mergedGlobeConfig.ambientLight || "#faf0e6";
  const directionalLeftColor = mergedGlobeConfig.directionalLeftLight || "#ffffff";
  const directionalTopColor = mergedGlobeConfig.directionalTopLight || "#ffffff";
  const pointColor = mergedGlobeConfig.pointLight || "#ffffff";

  const { size, polygonResolution, cameraZ, autoRotateSpeed, isMobile, isTiny } = useResponsiveGlobe();

  const [worldData, setWorldData] = useState<GeoJsonData | null>(null);
  const [error, setError] = useState<{ type: GlobeErrorType; message?: string } | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  
  // Accessibility & interaction states
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [srAnnouncement, setSrAnnouncement] = useState("");

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredArc, setHoveredArc] = useState<ArcData | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<PointData | null>(null);
  const [tooltipVenue, setTooltipVenue] = useState<VenueDetailInfo | null>(null);
  const [isTooltipActive, setIsTooltipActive] = useState(false);

  const [selectedVenue, setSelectedVenue] = useState<VenueDetailInfo | null>(null);
  const [focusCoords, setFocusCoords] = useState<{ lat: number; lng: number } | null>(
    globeConfig.initialPosition || null
  );

  useEffect(() => {
    if (globeConfig.initialPosition) {
      setFocusCoords(globeConfig.initialPosition);
      setIsAutoRotating(false);
    }
  }, [globeConfig.initialPosition]);

  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);
  const [isInViewport, setIsInViewport] = useState(false);

  // WebGL compatibility check on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !checkWebGLSupport()) {
      setError({ type: "webgl_unsupported" });
      setIsLoading(false);
    }
  }, []);

  // Track prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
      return () => mediaQuery.removeEventListener("change", handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
      return () => mediaQuery.removeListener(handleMediaChange);
    }
  }, []);

  // Update auto rotation based on prefers-reduced-motion configuration
  useEffect(() => {
    setIsAutoRotating(!prefersReducedMotion && (mergedGlobeConfig.autoRotate ?? true));
  }, [prefersReducedMotion, mergedGlobeConfig.autoRotate]);

  // Screen Reader live announcer helper
  const announceToScreenReader = useCallback((msg: string) => {
    setSrAnnouncement(msg);
    setTimeout(() => {
      setSrAnnouncement((prev) => (prev === msg ? "" : prev));
    }, 1000);
  }, []);

  // Announce load state to screen reader
  useEffect(() => {
    if (worldData && !isLoading && !error) {
      announceToScreenReader("F1 venues globe loaded successfully. Interactive 3D map is active.");
    }
  }, [worldData, isLoading, error, announceToScreenReader]);

  // Track network online/offline state
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      message.success("Network connection restored", 2);
    };
    const handleOffline = () => {
      setIsOnline(false);
      message.warning("Network connection lost. Globe offline.", 3);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Lazy viewport tracking
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.05,
        rootMargin: "100px",
      }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Data loading logic with static import
  const loadGlobeData = useCallback((_signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    try {
      setWorldData(localWorldData as GeoJsonData);
      setIsLoading(false);
    } catch (err: any) {
      console.error("[Globe Sync Error]", {
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        webglSupport: checkWebGLSupport(),
      });
      setError({ type: "fetch_failed", message: err.message });
      setIsLoading(false);
    }
  }, []);

  // Trigger loading when component becomes visible
  useEffect(() => {
    if (isInViewport && !worldData && (!error || error.type !== "webgl_unsupported")) {
      const controller = new AbortController();
      loadGlobeData(controller.signal);
      return () => {
        controller.abort();
      };
    }
  }, [isInViewport, loadGlobeData, worldData, error?.type]);

  const handleRetry = useCallback(() => {
    setRetryAttempt(0);
    loadGlobeData();
  }, [loadGlobeData]);

  // Reactive network recovery retry trigger
  useEffect(() => {
    if (isOnline && error?.type === "offline" && isInViewport) {
      handleRetry();
    }
  }, [isOnline, error?.type, isInViewport, handleRetry]);

  // Track absolute cursor offsets inside container wrapper
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, []);

  // Hover handlers linking to the overlay tooltip venue search
  const handleHoverArc = useCallback((arc: ArcData | null) => {
    setHoveredArc(arc);
    if (arc) {
      const venue = findVenueByCoords(arc.startLat, arc.startLng) || findVenueByCoords(arc.endLat, arc.endLng);
      if (venue) {
        setTooltipVenue(venue);
        setIsTooltipActive(true);
        if (onHoverRoundChange) onHoverRoundChange(venue.round);
      }
    } else if (!hoveredPoint) {
      setIsTooltipActive(false);
      if (onHoverRoundChange) onHoverRoundChange(null);
    }
  }, [hoveredPoint, onHoverRoundChange]);

  const handleHoverPoint = useCallback((point: PointData | null) => {
    setHoveredPoint(point);
    if (point) {
      const venue = findVenueByCoords(point.lat, point.lng);
      if (venue) {
        setTooltipVenue(venue);
        setIsTooltipActive(true);
        if (onHoverRoundChange) onHoverRoundChange(venue.round);
      }
    } else if (!hoveredArc) {
      setIsTooltipActive(false);
      if (onHoverRoundChange) onHoverRoundChange(null);
    }
  }, [hoveredArc, onHoverRoundChange]);

  // Click handlers pivoting camera and displaying info modal
  const handleClickPoint = useCallback((point: PointData) => {
    const venue = findVenueByCoords(point.lat, point.lng);
    if (venue) {
      if (onPointClick) {
        onPointClick(point);
      } else {
        setSelectedVenue(venue);
        setFocusCoords({ lat: point.lat, lng: point.lng });
        setIsAutoRotating(false);
        announceToScreenReader(`Viewing ${venue.name} circuit specs`);
      }
    }
  }, [announceToScreenReader, onPointClick]);

  const handleClickArc = useCallback((arc: ArcData) => {
    const venue = findVenueByCoords(arc.startLat, arc.startLng) || findVenueByCoords(arc.endLat, arc.endLng);
    if (venue) {
      if (onArcClick) {
        onArcClick(arc);
      } else {
        setSelectedVenue(venue);
        setFocusCoords({ lat: arc.startLat, lng: arc.startLng });
        setIsAutoRotating(false);
        announceToScreenReader(`Viewing ${venue.name} circuit specs`);
      }
    }
  }, [announceToScreenReader, onArcClick]);

  // Keyboard navigation & jumping control shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!controlsRef.current) return;
    let handled = false;
    const rotateStep = 0.05; // radians per key stroke

    switch (e.key) {
      case "ArrowLeft":
        setIsAutoRotating(false);
        controlsRef.current.rotateLeft(rotateStep);
        controlsRef.current.update();
        announceToScreenReader("Rotated globe left");
        handled = true;
        break;
      case "ArrowRight":
        setIsAutoRotating(false);
        controlsRef.current.rotateLeft(-rotateStep);
        controlsRef.current.update();
        announceToScreenReader("Rotated globe right");
        handled = true;
        break;
      case "ArrowUp":
        setIsAutoRotating(false);
        controlsRef.current.rotateUp(rotateStep);
        controlsRef.current.update();
        announceToScreenReader("Rotated globe up");
        handled = true;
        break;
      case "ArrowDown":
        setIsAutoRotating(false);
        controlsRef.current.rotateUp(-rotateStep);
        controlsRef.current.update();
        announceToScreenReader("Rotated globe down");
        handled = true;
        break;
      case " ": // Spacebar
        e.preventDefault();
        setIsAutoRotating((prev) => !prev);
        announceToScreenReader(!isAutoRotating ? "Globe auto-rotation resumed" : "Globe auto-rotation paused");
        handled = true;
        break;
      case "Escape":
        if (selectedVenue) {
          setSelectedVenue(null);
          announceToScreenReader("Closed details panel");
        } else if (isTooltipActive) {
          setIsTooltipActive(false);
        } else {
          setIsAutoRotating(false);
          announceToScreenReader("Globe rotation stopped");
        }
        handled = true;
        break;
      case "Enter":
        if (tooltipVenue) {
          setSelectedVenue(tooltipVenue);
          setFocusCoords({ lat: tooltipVenue.lat, lng: tooltipVenue.lng });
          setIsAutoRotating(false);
          announceToScreenReader(`Opened details panel for ${tooltipVenue.name}`);
          handled = true;
        }
        break;
      default:
        // Focus jump coordinates via number keys (1-8)
        if (e.key >= "1" && e.key <= "8") {
          const index = parseInt(e.key, 10) - 1;
          if (data[index]) {
            const arc = data[index];
            setFocusCoords({ lat: arc.startLat, lng: arc.startLng });
            setIsAutoRotating(false);
            const venue = findVenueByCoords(arc.startLat, arc.startLng);
            if (venue) {
              setTooltipVenue(venue);
              setIsTooltipActive(true);
              announceToScreenReader(`Orbiting camera to focus on ${venue.name}`);
            }
            handled = true;
          }
        }
        break;
    }

    if (handled) {
      e.stopPropagation();
    }
  }, [isAutoRotating, announceToScreenReader, data, selectedVenue, isTooltipActive, tooltipVenue]);

  // Viewports under 320px render a static/animated SVG representation to save resources and look better
  if (isTiny) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 border rounded-xl text-center w-[200px] h-[200px] mx-auto aspect-square ${
        resolvedTheme === "light"
          ? "bg-neutral-50/20 border-neutral-200"
          : "bg-neutral-900/20 border-neutral-850"
      }`}>
        <svg 
          className={`w-10 h-10 mb-2 animate-pulse ${
            resolvedTheme === "light" ? "text-blue-600/70" : "text-blue-400/70"
          }`} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className={`text-[9px] font-semibold tracking-wider uppercase ${
          resolvedTheme === "light" ? "text-neutral-700" : "text-neutral-400"
        }`}>3D Globe Standby</span>
        <span className="text-[8px] text-neutral-500 font-mono mt-0.5">Screen too narrow</span>
      </div>
    );
  }

  // Generate layout class styles based on responsive hook
  const containerClasses = `relative mx-auto aspect-square flex items-center justify-center ${
    isMobile 
      ? "w-[260px] h-[260px]" 
      : size === 320 
        ? "w-[320px] h-[320px]" 
        : "w-[400px] h-[400px]"
  } max-w-full`;

  return (
    // CSS visibility wrapper: keeps the Canvas (and its WebGL context) alive
    // when this Globe instance is not the active preset. The Canvas is never
    // unmounted, so the GPU context is never lost.
    <div style={{ display: isVisible ? undefined : "none" }} aria-hidden={!isVisible}>
    <figure
      role="figure"
      aria-label="F1 Racing Venues Interactive Globe"
      aria-describedby="globe-description"
      className="relative w-full h-full flex flex-col items-center justify-center"
    >
      <div 
        ref={containerRef} 
        className={`${containerClasses} focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#fbbf24] focus-visible:outline-offset-2 rounded-2xl outline-none`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseMove={handleMouseMove}
      >
        {error ? (
          error.type === "webgl_unsupported" || error.type === "render_failed" ? (
            <Globe2D
              globeConfig={mergedGlobeConfig}
              data={data}
              highlightedRound={highlightedRound}
              onHoverArc={handleHoverArc}
              onHoverPoint={handleHoverPoint}
              onPointClick={handleClickPoint}
              onArcClick={handleClickArc}
              onHoverRoundChange={onHoverRoundChange}
              hoveredArc={hoveredArc}
            />
          ) : (
            <GlobeFallback
              errorType={error.type}
              errorMessage={error.message}
              onRetry={handleRetry}
              retryAttempt={retryAttempt}
              maxRetries={3}
              theme={resolvedTheme}
            />
          )
        ) : !isInViewport || isLoading || !worldData ? (
          <div className={`absolute inset-0 rounded-2xl border flex flex-col items-center justify-center gap-2 ${
            resolvedTheme === "light"
              ? "bg-neutral-50/60 border-neutral-200"
              : "bg-neutral-900/40 border-neutral-850"
          }`}>
            {isLoading && (
              <div className="text-neutral-400 text-sm font-mono tracking-widest flex items-center gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <DecryptedText
                  text="Loading satellite telemetry..."
                  animateOn="view"
                  speed={40}
                  revealDirection="start"
                  className="text-neutral-200 font-semibold"
                />
              </div>
            )}
          </div>
        ) : (
          <CanvasErrorBoundary
            fallback={(err) => {
              console.warn("R3F Canvas crashed, falling back to Globe2D:", err);
              return (
                <Globe2D
                  globeConfig={mergedGlobeConfig}
                  data={data}
                  highlightedRound={highlightedRound}
                  onHoverArc={handleHoverArc}
                  onHoverPoint={handleHoverPoint}
                  onPointClick={handleClickPoint}
                  onArcClick={handleClickArc}
                  onHoverRoundChange={onHoverRoundChange}
                  hoveredArc={hoveredArc}
                />
              );
            }}
          >
            <motion.div
              animate={{ opacity: isTransitioning ? 0 : 1 }}
              transition={{ duration: 0.1 }}
              className="w-full h-full"
            >
              <Canvas 
                camera={{ position: [0, 0, cameraZ], fov: 60 }}
                role="img"
                aria-label="Interactive 3D globe showing F1 racing venues"
                aria-describedby="globe-description"
              >
                <CameraFocusController
                  focusCoords={focusCoords}
                  cameraZ={cameraZ}
                  controlsRef={controlsRef}
                  onFocusComplete={() => setFocusCoords(null)}
                />
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
                <GlobeComponent
                  globeConfig={mergedGlobeConfig}
                  data={data}
                  polygonResolution={polygonResolution}
                  isMobile={isMobile}
                  worldData={worldData}
                  onHoverArc={handleHoverArc}
                  onHoverPoint={handleHoverPoint}
                  onClickPoint={handleClickPoint}
                  onClickArc={handleClickArc}
                  hoveredArc={hoveredArc}
                  theme={resolvedTheme}
                  highlightedRound={highlightedRound}
                />
                <OrbitControls
                  ref={controlsRef}
                  enablePan={false}
                  enableZoom={mergedGlobeConfig.enableZoom ?? false}
                  autoRotate={isAutoRotating}
                  autoRotateSpeed={mergedGlobeConfig.autoRotateSpeed ?? autoRotateSpeed}
                />
              </Canvas>
            </motion.div>
          </CanvasErrorBoundary>
        )}

        {/* Dynamic floating cursor tooltip */}
        <AnimatePresence>
          {isTooltipActive && (
            <VenueTooltip
              venue={tooltipVenue}
              mousePos={mousePos}
              active={isTooltipActive}
              theme={resolvedTheme}
            />
          )}
        </AnimatePresence>

        {/* Modal slide-in backdrop */}
        {selectedVenue && (
          <div 
            className="absolute inset-0 bg-black/40 z-40 rounded-2xl cursor-pointer"
            onClick={() => setSelectedVenue(null)}
          />
        )}

        {/* Modal slide-in F1 track specs drawer */}
        <AnimatePresence>
          {selectedVenue && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={`absolute right-0 top-0 bottom-0 w-[240px] sm:w-[280px] border-l shadow-2xl backdrop-blur-md z-50 p-4 flex flex-col text-left overflow-y-auto rounded-r-2xl ${
                resolvedTheme === "light"
                  ? "bg-white/95 border-neutral-200 text-neutral-900"
                  : "bg-[#070913]/98 border-[#1f2937]/80 text-white"
              }`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between border-b pb-3 mb-4 ${
                resolvedTheme === "light" ? "border-neutral-200" : "border-[#1f2937]/50"
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl leading-none">{getCountryFlag(selectedVenue.country)}</span>
                  <div>
                    <span className="text-[9px] text-neutral-500 font-mono font-bold uppercase tracking-wider block">
                      Round {selectedVenue.round} Details
                    </span>
                    <h4 className={`font-bold text-xs leading-tight line-clamp-1 ${
                      resolvedTheme === "light" ? "text-neutral-900" : "text-white"
                    }`}>
                      {selectedVenue.name}
                    </h4>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedVenue(null)}
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
                    resolvedTheme === "light" 
                      ? "hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900" 
                      : "hover:bg-[#1f2937]/50 text-neutral-400 hover:text-white"
                  }`}
                  aria-label="Close details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body details */}
              <div className="flex-1 space-y-4 text-xs">
                {/* Circuit Info */}
                <div className="space-y-1">
                  <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Circuit Name</span>
                  <div className={`flex items-start gap-1.5 ${
                    resolvedTheme === "light" ? "text-neutral-800" : "text-neutral-200"
                  }`}>
                    <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span>{selectedVenue.circuit}</span>
                  </div>
                  {selectedVenue.locality && (
                    <span className={`text-[10px] font-mono block pl-5 ${
                      resolvedTheme === "light" ? "text-neutral-500" : "text-neutral-400"
                    }`}>{selectedVenue.locality}</span>
                  )}
                </div>

                {/* Track configurations */}
                <div className={`grid grid-cols-2 gap-3 pt-2 border-t ${
                  resolvedTheme === "light" ? "border-neutral-200" : "border-[#1f2937]/30"
                }`}>
                  <div>
                    <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block mb-1">Layout</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-wider uppercase inline-block ${
                      selectedVenue.circuitType === "street" 
                        ? resolvedTheme === "light"
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : resolvedTheme === "light"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}>
                      {selectedVenue.circuitType === "street" ? "Street" : "Permanent"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block mb-1">Distance</span>
                    <div className={`flex items-center gap-1 font-mono ${
                      resolvedTheme === "light" ? "text-neutral-800" : "text-neutral-200"
                    }`}>
                      <Milestone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{selectedVenue.trackLength}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block mb-1">Turns</span>
                    <div className={`flex items-center gap-1 font-mono ${
                      resolvedTheme === "light" ? "text-neutral-800" : "text-neutral-200"
                    }`}>
                      <Compass className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{selectedVenue.turns} turns</span>
                    </div>
                  </div>
                  {selectedVenue.sprint && (
                    <div>
                      <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block mb-1">Sprint</span>
                      <span className={`px-1.5 py-0.5 text-[8px] font-black rounded uppercase tracking-wider inline-block ${
                        resolvedTheme === "light"
                          ? "bg-orange-500/10 text-orange-600 border border-orange-500/20"
                          : "bg-orange-500/20 text-orange-400"
                      }`}>
                        Active
                      </span>
                    </div>
                  )}
                </div>

                {/* Historic Results */}
                <div className={`pt-3 border-t space-y-1.5 ${
                  resolvedTheme === "light" ? "border-neutral-200" : "border-[#1f2937]/30"
                }`}>
                  <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-yellow-500" /> Previous Podium
                  </span>
                  <p className={`text-[10px] font-mono p-2 rounded border leading-relaxed ${
                    resolvedTheme === "light"
                      ? "bg-neutral-50 border-neutral-200 text-neutral-800"
                      : "bg-black/40 border-[#1f2937]/20 text-neutral-300"
                  }`}>
                    {selectedVenue.podiumHistory}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className={`border-t pt-4 mt-6 text-center ${
                resolvedTheme === "light" ? "border-neutral-200" : "border-[#1f2937]/50"
              }`}>
                <a 
                  href={`#round-${selectedVenue.round}`} 
                  onClick={() => setSelectedVenue(null)}
                  className={`inline-block w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-md active:scale-98 transition-all ${
                    resolvedTheme === "light"
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/10"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/10"
                  }`}
                >
                  Focus Calendar Card
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Screen Reader Polite Live Region Announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {srAnnouncement}
      </div>

      {/* Semantic Accessible Caption Description */}
      <figcaption id="globe-description" className="sr-only">
        Interactive 3D globe showing Formula One racing venues connected by arcs.
        Use Tab to focus the globe viewer. Keyboard controls: Arrow keys to rotate the globe manually, 
        Space to pause or resume auto-rotation, and Escape to stop rotation. Number keys 1 to 8 focus specific venues.
      </figcaption>
    </figure>
    </div>
  );
});
