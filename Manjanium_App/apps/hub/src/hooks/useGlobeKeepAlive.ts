/**
 * useGlobeKeepAlive.ts
 *
 * Context + hook to keep the Three.js Globe Canvas alive across preset
 * switches. Instead of unmounting and remounting the Canvas (which destroys
 * and recreates the WebGL context), we toggle CSS display visibility.
 *
 * Usage:
 *   1. Wrap app root with <GlobeProvider> (see providers/GlobeProvider.tsx)
 *   2. In the Globe component call useGlobeKeepAlive() to get isVisible
 *   3. Apply style={{ display: isVisible ? '' : 'none' }} on the outer wrapper
 */

import { createContext, useContext } from "react";

export interface GlobeContextType {
  /** Whether the Globe should be rendered visibly */
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  /** Optional ref to the underlying Canvas element */
  globeRef: HTMLCanvasElement | null;
  setGlobeRef: (ref: HTMLCanvasElement | null) => void;
}

export const GlobeContext = createContext<GlobeContextType | null>(null);

/**
 * Hook to access the GlobeContext.
 * Must be called within a component tree wrapped by <GlobeProvider>.
 */
export function useGlobeKeepAlive(): GlobeContextType {
  const ctx = useContext(GlobeContext);
  if (!ctx) {
    throw new Error(
      "useGlobeKeepAlive must be used within a <GlobeProvider>. " +
        "Make sure <GlobeProvider> wraps your application in layout.tsx."
    );
  }
  return ctx;
}
