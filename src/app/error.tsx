"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center max-w-lg"
      >
        <div className="w-24 h-24 mb-8 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
          <AlertCircle className="w-12 h-12" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight text-white mb-4">
          Something went wrong
        </h1>
        
        <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
          A critical error occurred while loading this page. Our telemetry systems have logged the failure.
        </p>

        <div className="bg-black/30 border border-red-500/10 rounded-lg p-4 mb-10 w-full text-left overflow-hidden">
          <p className="text-red-400 font-mono text-sm break-all">
            {error.message || "Unknown error"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-colors w-full sm:w-auto"
          >
            <RefreshCcw className="w-4 h-4" /> Try Again
          </button>
          
          <Link href="/" className="w-full sm:w-auto">
            <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-manjanium-gold hover:bg-yellow-400 text-black font-bold transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] w-full">
              <Home className="w-4 h-4" /> Return Home
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
