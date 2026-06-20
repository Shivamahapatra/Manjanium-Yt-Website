"use client";
import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { cn } from "@/lib/utils";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      const direction = current - scrollYProgress.getPrevious()!;

      if (scrollYProgress.get() < 0.05) {
        setVisible(false);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "flex max-w-fit fixed top-10 inset-x-0 mx-auto z-[5000] items-center justify-center",
          className
        )}
      >
        <div 
          className="flex items-center justify-center gap-2 rounded-full border-b-[2px] px-3 py-1.5 backdrop-blur-md"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            borderColor: "var(--color-accent)",
            boxShadow: "var(--shadow-medium)",
            transition: "all var(--transition-standard) cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        >
          {/* Nav items container */}
          <div className="flex items-center gap-2">
            {navItems.map((navItem, idx: number) => (
              <a
                key={`link-${idx}`}
                href={navItem.link}
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors group"
                )}
                style={{
                  color: "var(--color-text)",
                  transition: "all var(--transition-quick) ease-in-out"
                }}
              >
                <span className="block sm:hidden text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors">{navItem.icon}</span>
                <span className="hidden sm:block group-hover:text-[var(--color-accent)] transition-colors">{navItem.name}</span>
                
                {/* Gold hover underline/glow effect */}
                <span className="absolute inset-x-0 -bottom-px h-px w-0 bg-[var(--color-accent)] transition-all duration-300 group-hover:w-full" style={{ boxShadow: "0 0 10px rgba(251,191,36,0.5)" }} />
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="h-5 w-px opacity-30" style={{ backgroundColor: "var(--color-text-muted)" }} />

          {/* CTA Button */}
          <button 
            className="relative rounded-full px-5 py-2 text-sm font-bold transition-all hover:scale-105"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-primary)",
              boxShadow: "0 0 20px rgba(251,191,36,0.3)",
              transition: "all var(--transition-quick) ease-in-out"
            }}
          >
            <span>Login</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
