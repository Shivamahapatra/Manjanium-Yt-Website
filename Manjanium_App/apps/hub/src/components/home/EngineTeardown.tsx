'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Maximize2, RotateCcw, Wrench, Layers } from 'lucide-react'

export function EngineTeardown() {
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [isNearViewport, setIsNearViewport] = useState(false)
  const [isNarrowScreen, setIsNarrowScreen] = useState(false)
  const [simLoaded, setSimLoaded] = useState(false)
  const [isInteracting, setIsInteracting] = useState(false)

  // 1. Detect narrow screen (< 820px)
  useEffect(() => {
    const checkWidth = () => {
      try {
        setIsNarrowScreen(window.innerWidth < 820)
      } catch {
        // default to false
      }
    }
    checkWidth()
    window.addEventListener('resize', checkWidth, { passive: true })
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  // 2. IntersectionObserver to mount/unmount iframe within ~1 screen
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsNearViewport(true)
      return
    }

    const currentRef = containerRef.current
    if (!currentRef) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) {
          setIsNearViewport(entry.isIntersecting)
        }
      },
      {
        rootMargin: '600px 0px 600px 0px',
        threshold: 0,
      }
    )

    try {
      observer.observe(currentRef)
    } catch {
      setIsNearViewport(true)
    }

    return () => {
      try {
        observer.disconnect()
      } catch {
        // ignore
      }
    }
  }, [])

  // 3. Monitor SIM_SHOWN or simframe from same-origin iframe
  useEffect(() => {
    if (!isNearViewport || isNarrowScreen) {
      setSimLoaded(false)
      return
    }

    let intervalId: NodeJS.Timeout | null = null

    const checkSimReady = () => {
      try {
        const win = iframeRef.current?.contentWindow as any
        if (win && win.SIM_SHOWN) {
          setSimLoaded(true)
          if (intervalId) clearInterval(intervalId)
        }
      } catch {
        // cross-origin safety
      }
    }

    intervalId = setInterval(checkSimReady, 250)

    const handleMessage = (e: MessageEvent) => {
      if (e.data === 'simframe' || e.data?.type === 'simframe') {
        setSimLoaded(true)
      }
    }
    window.addEventListener('message', handleMessage)

    return () => {
      if (intervalId) clearInterval(intervalId)
      window.removeEventListener('message', handleMessage)
    }
  }, [isNearViewport, isNarrowScreen])

  // 4. Mouse leave restore "Click to interact" overlay after 3 seconds
  const handlePointerLeave = useCallback(() => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
    leaveTimerRef.current = setTimeout(() => {
      setIsInteracting(false)
    }, 3000)
  }, [])

  const handlePointerEnter = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
  }, [])

  // 5. Open Full Screen
  const handleFullScreen = () => {
    const el = iframeRef.current || containerRef.current
    if (!el) return
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {
        window.open('/simulators/v8-engine-teardown.html', '_blank', 'noopener')
      })
    } else {
      window.open('/simulators/v8-engine-teardown.html', '_blank', 'noopener')
    }
  }

  return (
    <div className="w-full max-w-[1100px] mx-auto my-12 px-4 sm:px-6">
      {/* Section Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono mb-2">
          <Wrench className="w-3.5 h-3.5" />
          <span>MECHANICAL TELEMETRY // 3D SIMULATOR</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-on-surface tracking-tight">
          V8 Engine Teardown
        </h2>
        <p className="text-sm text-muted max-w-xl mx-auto mt-1">
          Explore interactive real-time 3D cross-sections and component disassembly of a high-performance twin-cam V8.
        </p>
      </div>

      {/* 16:9 Frame Container */}
      <div
        ref={containerRef}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className="relative w-full aspect-video bg-[#0b0c10] border border-border/70 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 flex items-center justify-center"
      >
        {/* Narrow Screens (< 820px) Poster & Open Button */}
        {isNarrowScreen ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-300">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-heading mb-1 text-zinc-100">
              V8 Engine 3D Teardown
            </h3>
            <p className="text-xs text-zinc-400 max-w-xs mb-5">
              High-precision WebGL mechanical simulation optimized for landscape and desktop screens.
            </p>
            <a
              href="/simulators/v8-engine-teardown.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Open Full Screen Simulator</span>
            </a>
          </div>
        ) : (
          <>
            {/* Loading / Poster State */}
            {(!isNearViewport || !simLoaded) && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a0a0c] text-zinc-400">
                <div className="w-10 h-10 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin mb-3" />
                <p className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
                  Initializing WebGL Teardown Engine...
                </p>
              </div>
            )}

            {/* Mount iframe only within 1 screen of viewport */}
            {isNearViewport && (
              <iframe
                ref={iframeRef}
                src="/simulators/v8-engine-teardown.html"
                title="V8 Engine Teardown Simulator"
                className="w-full h-full border-0"
                loading="lazy"
                allow="fullscreen"
              />
            )}

            {/* "Click to interact" overlay preventing scroll trapping */}
            {!isInteracting && simLoaded && (
              <div
                onClick={() => setIsInteracting(true)}
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 hover:bg-black/30 backdrop-blur-[1px] cursor-pointer transition-all duration-200"
              >
                <div className="px-5 py-2.5 rounded-full bg-black/80 border border-white/20 text-white text-xs font-mono flex items-center gap-2 shadow-xl hover:scale-105 transition-transform">
                  <span>🖱️ Click to Interact with 3D V8</span>
                </div>
              </div>
            )}

            {/* Fullscreen control overlay button in top-right */}
            {simLoaded && (
              <button
                onClick={handleFullScreen}
                aria-label="View Fullscreen"
                title="Open in Full Screen"
                className="absolute top-3 right-3 z-30 p-2 rounded-lg bg-black/70 border border-white/10 text-white/80 hover:text-white hover:bg-black transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default EngineTeardown

