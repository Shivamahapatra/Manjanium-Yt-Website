"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center max-w-lg"
      >
        <div className="w-24 h-24 mb-8 bg-manjanium-gold/10 text-manjanium-gold rounded-2xl flex items-center justify-center border border-manjanium-gold/20 shadow-[0_0_30px_rgba(251,191,36,0.15)]">
          <AlertTriangle className="w-12 h-12" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black font-heading tracking-tight text-white mb-4">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-200 mb-6">
          Page Not Found
        </h2>
        
        <p className="text-neutral-400 text-lg mb-10 leading-relaxed">
          The race or match you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-colors w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
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
