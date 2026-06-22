import React from "react";
import { AlertCircle, RefreshCw, WifiOff, Cpu, Info } from "lucide-react";

export type GlobeErrorType = "webgl_unsupported" | "offline" | "fetch_failed" | "render_failed" | "timeout";

interface GlobeFallbackProps {
  errorType: GlobeErrorType;
  errorMessage?: string;
  onRetry?: () => void;
  retryAttempt?: number;
  maxRetries?: number;
  theme?: "dark" | "light";
}

interface WebGLDebugRendererInfo {
  UNMASKED_RENDERER_VENDOR_ID: number;
  UNMASKED_RENDERER_STRING: number;
}

export function GlobeFallback({
  errorType,
  errorMessage,
  onRetry,
  retryAttempt = 0,
  maxRetries = 3,
  theme = "dark",
}: GlobeFallbackProps): React.JSX.Element {
  // Browser user agent diagnostic helper
  const getBrowserInfo = (): string => {
    if (typeof window === "undefined") return "Server-side rendering (SSR)";
    return `${navigator.userAgent}`;
  };

  // GPU context details helper
  const getWebGLDetails = (): string => {
    if (typeof window === "undefined") return "WebGL Context Unavailable";
    try {
      const canvas = document.createElement("canvas");
      const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
      if (!gl) return "WebGL fully disabled or unsupported by hardware";
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info") as WebGLDebugRendererInfo | null;
      if (debugInfo) {
        return (
          gl.getParameter(debugInfo.UNMASKED_RENDERER_VENDOR_ID) +
          " / " +
          gl.getParameter(debugInfo.UNMASKED_RENDERER_STRING)
        );
      }
      return "WebGL context initialized, but vendor info unavailable";
    } catch {
      return "Failed to query WebGL device info";
    }
  };

  // Theme-aware conditional style classes
  const containerThemeClasses = theme === "light"
    ? "bg-white/95 border-neutral-200 text-neutral-900 shadow-xl"
    : "bg-[#0b0c10]/80 border-[#1f1f1f] text-white shadow-2xl";

  const gridBorderColor = theme === "light"
    ? "bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)]"
    : "bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)]";

  const gridOpacity = theme === "light" ? "opacity-40" : "opacity-10";

  const headerTextClass = theme === "light" ? "text-neutral-955" : "text-white";
  const descTextClass = theme === "light" ? "text-neutral-600" : "text-neutral-400";
  const svgMapBgClass = theme === "light" ? "bg-neutral-50/80 border-neutral-200" : "bg-black/40 border-[#1f1f1f]";
  const svgStrokeColor = theme === "light" ? "#1d4ed8" : "#3b82f6";
  const svgConnectionColor = theme === "light" ? "rgba(29, 78, 216, 0.4)" : "rgba(59, 130, 246, 0.4)";

  const diagSummaryClass = theme === "light" ? "text-neutral-700" : "text-neutral-400";
  const diagContainerClass = theme === "light" ? "bg-neutral-50/90 border-neutral-200" : "bg-black/50 border-[#1f1f1f]";
  const diagTextClass = theme === "light" ? "text-neutral-650" : "text-neutral-500";
  const diagLabelClass = theme === "light" ? "text-neutral-900" : "text-neutral-400";

  return (
    <div className={`flex flex-col items-center justify-center p-6 border rounded-2xl text-center w-full max-w-[400px] aspect-square mx-auto relative overflow-hidden backdrop-blur-md ${containerThemeClasses}`}>
      {/* Decorative premium background grid */}
      <div className={`absolute inset-0 bg-[size:24px_24px] pointer-events-none ${gridBorderColor} ${gridOpacity}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_60%)] pointer-events-none" />

      {/* Styled Icon Header based on Error State */}
      <div className="mb-4 relative z-10">
        {errorType === "offline" ? (
          <div className="p-3 bg-amber-500/15 text-amber-500 rounded-2xl border border-amber-500/30 inline-block animate-pulse">
            <WifiOff className="w-8 h-8" />
          </div>
        ) : errorType === "webgl_unsupported" ? (
          <div className="p-3 bg-red-500/15 text-red-500 rounded-2xl border border-red-500/30 inline-block">
            <Cpu className="w-8 h-8" />
          </div>
        ) : (
          <div className="p-3 bg-red-500/15 text-red-500 rounded-2xl border border-red-500/30 inline-block">
            <AlertCircle className="w-8 h-8" />
          </div>
        )}
      </div>

      {/* Title */}
      <h4 className={`font-bold text-base leading-snug mb-1.5 relative z-10 font-sans ${headerTextClass}`}>
        {errorType === "offline" && "Connection Offline"}
        {errorType === "webgl_unsupported" && "WebGL Not Supported"}
        {errorType === "fetch_failed" && "Failed to Load Globe Data"}
        {errorType === "render_failed" && "WebGL Rendering Failed"}
        {errorType === "timeout" && "Globe Load Timeout"}
      </h4>

      {/* Description */}
      <p className={`text-[11px] max-w-[285px] mb-4 leading-relaxed font-sans relative z-10 ${descTextClass}`}>
        {errorType === "offline" && "Please check your network settings. The interactive 3D globe will restore automatically once you reconnect."}
        {errorType === "webgl_unsupported" && "Your browser or graphics hardware does not support WebGL, which is required to render 3D views."}
        {errorType === "fetch_failed" && (errorMessage || "An error occurred while downloading the satellite terrain coordinates.")}
        {errorType === "render_failed" && "An internal GPU crash or WebGL context loss occurred while instantiating the Three.js viewport."}
        {errorType === "timeout" && "Initializing the 3D canvas is taking longer than expected. You can retry or wait for completion."}
      </p>

      {/* SVG 2D Map Fallback Illustration */}
      <div className={`w-full h-24 mb-4 relative flex items-center justify-center border rounded-lg overflow-hidden z-10 ${svgMapBgClass}`}>
        <svg className="w-full h-full opacity-60" viewBox="0 0 100 45" fill="none">
          {/* World map layout dots */}
          <path d="M5 20c2-1 4 2 7 1s5-3 8-1 4 2 7 0 5-2 8-2 3 3 5 1 5-2 7 0 6 3 9 1" stroke={svgStrokeColor} strokeWidth="0.5" strokeDasharray="1 1" />
          <path d="M50 15c2-2 4 1 8 0s6-3 9-1 4 4 8 2M20 30c5 1 9-2 12-1s6 2 10 0" stroke={svgStrokeColor} strokeWidth="0.5" strokeDasharray="1 1" />
          {/* Arcs */}
          <path d="M25 22 Q 40 10 55 25" stroke={svgConnectionColor} strokeWidth="0.75" strokeDasharray="2 2" />
          <path d="M55 25 Q 70 12 85 20" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="0.75" strokeDasharray="2 2" />
          {/* Pins */}
          <circle cx="25" cy="22" r="1.5" fill={svgStrokeColor} className="animate-ping" />
          <circle cx="25" cy="22" r="1" fill={svgStrokeColor} />
          <circle cx="55" cy="25" r="1.5" fill="#10b981" />
          <circle cx="85" cy="20" r="1.5" fill="#ef4444" />
        </svg>
        <span className="absolute text-[8px] font-mono text-neutral-500 uppercase tracking-widest bottom-1.5">
          Showing 2D Grid Vector Layout
        </span>
      </div>

      {/* Diagnostics / Browser Info */}
      {(errorType === "webgl_unsupported" || errorType === "render_failed") && (
        <details className="w-full text-left mb-4 bg-black/50 border border-[#1f1f1f] rounded-lg p-2.5 relative z-10 transition-all">
          <summary className={`text-[9px] font-bold cursor-pointer flex items-center gap-1 list-none focus:outline-none select-none ${diagSummaryClass}`}>
            <Info className="w-3 h-3 text-blue-400 shrink-0" /> Show GPU Diagnostics
          </summary>
          <div className={`mt-2 text-[8px] font-mono leading-tight space-y-1.5 select-all overflow-x-auto max-h-[80px] border p-2 rounded ${diagContainerClass} ${diagTextClass}`}>
            <p><span className={`font-bold ${diagLabelClass}`}>Browser Agent:</span> {getBrowserInfo()}</p>
            <p><span className={`font-bold ${diagLabelClass}`}>WebGL Info:</span> {getWebGLDetails()}</p>
          </div>
        </details>
      )}

      {/* Action Buttons */}
      {onRetry && (errorType === "fetch_failed" || errorType === "offline" || errorType === "timeout") && (
        <button
          onClick={onRetry}
          disabled={retryAttempt >= maxRetries && errorType !== "offline"}
          className="relative z-10 px-4.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${(retryAttempt > 0 && retryAttempt < maxRetries) || (errorType === "offline" && retryAttempt > 0) ? "animate-spin" : ""}`} />
          {errorType === "offline"
            ? "Reconnect & Retry"
            : retryAttempt > 0 && retryAttempt < maxRetries
              ? `Retrying... (${retryAttempt}/${maxRetries})`
              : "Retry Connection"}
        </button>
      )}
    </div>
  );
}
export default GlobeFallback;
