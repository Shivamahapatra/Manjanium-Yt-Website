"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Canvas, extend } from "@react-three/fiber";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "@react-three/drei";
import { Color, Vector3, Mesh, Object3D, MeshPhongMaterial } from "three";
import { message } from "antd";
import { getGlobeData } from "@/lib/globe-cache";
import { useResponsiveGlobe } from "@/hooks/useResponsiveGlobe";
import { GlobeFallback, GlobeErrorType } from "@/components/ui/GlobeFallback";
import { ArcData, PointData, GeoJsonFeature, GeoJsonData, GlobeConfig } from "@/types/globe";

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

interface WorldProps {
  globeConfig: GlobeConfig;
  data: ArcData[];
  polygonResolution?: number;
  isMobile?: boolean;
  worldData?: GeoJsonData | null;
}

export const GlobeComponent = React.memo(function GlobeComponent({
  globeConfig,
  data,
  polygonResolution = 2,
  isMobile = false,
  worldData,
}: WorldProps): React.JSX.Element {
  const globeRef = useRef<ThreeGlobe>(null);

  // Memoize point data processing to avoid recalculations on every render
  const points = useMemo<PointData[]>(() => {
    return data.flatMap((d: ArcData) => [
      { lat: d.startLat, lng: d.startLng, color: d.color },
      { lat: d.endLat, lng: d.endLng, color: d.color }
    ]);
  }, [data]);

  // Handle globe geometry, arcs, and markers configuration
  useEffect(() => {
    if (globeRef.current) {
      const globe = globeRef.current;

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
        .arcColor((d: object) => (d as ArcData).color || "#0ea5e9")
        .arcAltitude((d: object) => (d as ArcData).arcAlt || 0.3)
        .arcStroke((d: object) => (d as ArcData).stroke || 0.6)
        .arcDashLength(0.9)
        .arcDashGap(3)
        .arcDashAnimateTime(isMobile ? 600 : 1200);

      // Markers on arc start/end points using memoized points
      globe
        .pointsData(points)
        .pointLat((d: object) => (d as PointData).lat)
        .pointLng((d: object) => (d as PointData).lng)
        .pointColor((d: object) => (d as PointData).color || "#ef4444")
        .pointAltitude(0.01)
        .pointRadius(0.8);
    }
  }, [globeConfig, data, points, isMobile]);

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

export const Globe = React.memo(function Globe({ globeConfig, data }: WorldProps): React.JSX.Element {
  const ambientColor = globeConfig.ambientLight || "#faf0e6";
  const directionalLeftColor = globeConfig.directionalLeftLight || "#ffffff";
  const directionalTopColor = globeConfig.directionalTopLight || "#ffffff";
  const pointColor = globeConfig.pointLight || "#ffffff";

  const { size, polygonResolution, cameraZ, autoRotateSpeed, isMobile, isTiny } = useResponsiveGlobe();

  const [worldData, setWorldData] = useState<GeoJsonData | null>(null);
  const [error, setError] = useState<{ type: GlobeErrorType; message?: string } | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  
  // Accessibility states
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [srAnnouncement, setSrAnnouncement] = useState("");

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
    setIsAutoRotating(!prefersReducedMotion && (globeConfig.autoRotate ?? true));
  }, [prefersReducedMotion, globeConfig.autoRotate]);

  // Screen Reader live announcer helper
  const announceToScreenReader = useCallback((msg: string) => {
    setSrAnnouncement(msg);
    // Clear announcement after brief timeout so consecutive triggers speak correctly
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

  // Lazy viewport intersection tracking
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

  // Data fetching logic with retries and timeout
  const loadGlobeData = useCallback((signal?: AbortSignal) => {
    if (typeof window !== "undefined" && !navigator.onLine) {
      setError({ type: "offline" });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Set 5-second initial load timeout threshold
    const timeoutId = setTimeout(() => {
      setError((prev) => {
        if (!prev && !worldData) {
          return { type: "timeout" };
        }
        return prev;
      });
      setIsLoading(false);
    }, 5000);

    getGlobeData(
      signal,
      3,
      1000,
      (attempt: number, max: number) => {
        setRetryAttempt(attempt);
        message.loading(`Globe synchronising... (attempt ${attempt}/${max})`, 1.5);
      }
    )
      .then((data: GeoJsonData) => {
        clearTimeout(timeoutId);
        setWorldData(data);
        setError(null);
        setIsLoading(false);
        message.success("Interactive globe loaded successfully", 2);
      })
      .catch((err: Error) => {
        clearTimeout(timeoutId);
        if (err.name === "AbortError") return;

        console.error("[Globe Sync Error]", {
          error: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          webglSupport: checkWebGLSupport(),
        });

        setError({ type: "fetch_failed", message: err.message });
        setIsLoading(false);
      });
  }, [worldData]);

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

  // Keyboard navigation interactions
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!controlsRef.current) return;
    let handled = false;
    const rotateStep = 0.05; // radians per key stroke

    switch (e.key) {
      case "ArrowLeft":
        setIsAutoRotating(false); // Pause auto-rotation during manual control
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
        e.preventDefault(); // Stop browser page-down scrolling
        setIsAutoRotating((prev) => !prev);
        announceToScreenReader(!isAutoRotating ? "Globe auto-rotation resumed" : "Globe auto-rotation paused");
        handled = true;
        break;
      case "Escape":
        setIsAutoRotating(false);
        announceToScreenReader("Globe rotation stopped");
        handled = true;
        break;
      default:
        break;
    }

    if (handled) {
      e.stopPropagation();
    }
  }, [isAutoRotating, announceToScreenReader]);

  // Viewports under 320px render a static/animated SVG representation to save resources and look better
  if (isTiny) {
    return (
      <div className="flex flex-col items-center justify-center p-4 border border-neutral-850 rounded-xl bg-neutral-900/20 text-center w-[200px] h-[200px] mx-auto aspect-square">
        <svg 
          className="w-10 h-10 text-blue-400/70 mb-2 animate-pulse" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="text-[9px] text-neutral-400 font-semibold tracking-wider uppercase">3D Globe Standby</span>
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
      >
        {error ? (
          <GlobeFallback
            errorType={error.type}
            errorMessage={error.message}
            onRetry={handleRetry}
            retryAttempt={retryAttempt}
            maxRetries={3}
          />
        ) : !isInViewport || isLoading || !worldData ? (
          <div className="absolute inset-0 rounded-full bg-neutral-900/40 animate-pulse border border-neutral-850 flex flex-col items-center justify-center gap-2">
            <span className="text-neutral-500 text-xs font-mono">Initializing 3D viewport...</span>
            {isLoading && (
              <span className="text-[10px] text-neutral-600 font-mono">Loading satellite telemetry...</span>
            )}
          </div>
        ) : (
          <CanvasErrorBoundary
            fallback={(err) => (
              <GlobeFallback
                errorType="render_failed"
                errorMessage={err.message}
                onRetry={handleRetry}
              />
            )}
          >
            <Canvas 
              camera={{ position: [0, 0, cameraZ], fov: 60 }}
              role="img"
              aria-label="Interactive 3D globe showing F1 racing venues"
              aria-describedby="globe-description"
            >
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
                globeConfig={globeConfig}
                data={data}
                polygonResolution={polygonResolution}
                isMobile={isMobile}
                worldData={worldData}
              />
              <OrbitControls
                ref={controlsRef}
                enablePan={false}
                enableZoom={globeConfig.enableZoom ?? false}
                autoRotate={isAutoRotating}
                autoRotateSpeed={globeConfig.autoRotateSpeed ?? autoRotateSpeed}
              />
            </Canvas>
          </CanvasErrorBoundary>
        )}
      </div>

      {/* Screen Reader Polite Live Region Announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {srAnnouncement}
      </div>

      {/* Semantic Accessible Caption Description */}
      <figcaption id="globe-description" className="sr-only">
        Interactive 3D globe showing Formula One racing venues connected by arcs.
        Use Tab to focus the globe viewer. Keyboard controls: Arrow keys to rotate the globe manually, 
        Space to pause or resume auto-rotation, and Escape to stop rotation.
      </figcaption>
    </figure>
  );
});
