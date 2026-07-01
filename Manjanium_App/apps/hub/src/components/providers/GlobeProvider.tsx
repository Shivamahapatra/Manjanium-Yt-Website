"use client";

/**
 * GlobeProvider.tsx
 *
 * Context provider that keeps a single Globe Canvas instance alive for the
 * lifetime of the application. Wrapping the app in this provider allows the
 * Globe component to hide itself via CSS (display:none) instead of unmounting
 * and destroying its WebGL context when the user switches presets.
 */

import { useState } from "react";
import { GlobeContext, type GlobeContextType } from "@/hooks/useGlobeKeepAlive";

export function GlobeProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);
  const [globeRef, setGlobeRef] = useState<HTMLCanvasElement | null>(null);

  const value: GlobeContextType = {
    isVisible,
    setIsVisible,
    globeRef,
    setGlobeRef,
  };

  return (
    <GlobeContext.Provider value={value}>{children}</GlobeContext.Provider>
  );
}
