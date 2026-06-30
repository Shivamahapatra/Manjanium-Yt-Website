import { useState, useEffect, useMemo } from "react";

export interface ResponsiveGlobeConfig {
  size: number;
  polygonResolution: number;
  cameraZ: number;
  autoRotateSpeed: number;
  isMobile: boolean;
  isTiny: boolean;
}

export function useResponsiveGlobe(): ResponsiveGlobeConfig {
  // Safe default initialization check for SSR
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth;
    }
    return 1024; // Standard desktop fallback
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const config = useMemo<ResponsiveGlobeConfig>(() => {
    const isTiny = windowWidth < 320;
    const isMobile = windowWidth < 640;
    const isTablet = windowWidth >= 640 && windowWidth < 1024;

    let size = 400;
    let polygonResolution = 3;
    let cameraZ = 280;
    let autoRotateSpeed = 0.8;

    if (isTiny) {
      size = 200;
      polygonResolution = 1; // Simplest structure for tiny screens
      cameraZ = 200;
      autoRotateSpeed = 0.0; // Battery optimization
    } else if (isMobile) {
      size = 260;
      polygonResolution = 2; // Reduced geometry for mobile performance
      cameraZ = 230; // Closer camera focus
      autoRotateSpeed = 0.2; // Battery-saving slow speed
    } else if (isTablet) {
      size = 320;
      polygonResolution = 2; // Well-performing resolution
      cameraZ = 260;
      autoRotateSpeed = 0.6;
    } else {
      // Desktop
      size = 400;
      polygonResolution = 3; // Maximum visual fidelity
      cameraZ = 280;
      autoRotateSpeed = 0.8;
    }

    return {
      size,
      polygonResolution,
      cameraZ,
      autoRotateSpeed,
      isMobile,
      isTiny,
    };
  }, [windowWidth]);

  return config;
}
