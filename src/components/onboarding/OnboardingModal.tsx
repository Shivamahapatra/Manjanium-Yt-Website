"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/hooks/useOnboarding";

export function OnboardingModal() {
  const { showModal, dismissModal, setLoginIntention } = useOnboarding();
  const router = useRouter();

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  const handleLoginClick = () => {
    setLoginIntention();
    router.push("/login");
  };

  return (
    <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={dismissModal}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[500px] bg-[#0f172a] rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-[#fbbf24] to-emerald-500" />

            {/* Close button */}
            <button
              onClick={dismissModal}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 flex flex-col items-center text-center">
              {/* Logo/Icon */}
              <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50">M</span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                🎯 Unlock Your Full Experience
              </h2>
              <p className="text-[#94a3b8] text-sm mb-8 leading-relaxed">
                Create an account to save your preferences and customize everything across the Manjanium Sports network.
              </p>

              {/* Benefits */}
              <div className="w-full space-y-3 mb-8 text-left">
                {[
                  "Save your theme preferences (Light/Dark)",
                  "Customize dashboard layouts and widgets",
                  "Remember your favorite teams and drivers",
                  "Get personalized sports updates"
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#fbbf24] shrink-0 mt-0.5" />
                    <span className="text-sm text-white/90">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLoginClick}
                  className="w-full py-3.5 bg-[#0ea5e9] hover:bg-[#0284c7] hover:shadow-[0_0_15px_rgba(14,165,233,0.5)] text-white font-semibold rounded-xl transition-all duration-200"
                >
                  Sign Up / Login
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={dismissModal}
                  className="w-full py-3.5 bg-transparent border border-white/20 hover:border-[#fbbf24] text-[#94a3b8] hover:text-[#fbbf24] font-medium rounded-xl transition-all duration-200"
                >
                  Continue as Guest
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
