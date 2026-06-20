"use client";

import React, { ReactNode } from "react";
import { useSettings } from "@/lib/settings-context";
import { F1_PRESETS, FOOTBALL_PRESETS, WidgetDefinition } from "@/lib/dashboard-presets";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface WidgetPresetsProps {
  type: "F1" | "Football";
  widgetMap: Record<string, ReactNode>;
}

export function WidgetPresets({ type, widgetMap }: WidgetPresetsProps) {
  const { settings } = useSettings();
  
  const presetId = type === "F1" ? settings.dashboard.f1Preset : settings.dashboard.footballPreset;
  const presets = type === "F1" ? F1_PRESETS : FOOTBALL_PRESETS;
  
  // Fallback to the first preset if the selected one is invalid
  const activePreset = presets[presetId] || Object.values(presets)[0];

  const getWidgetClasses = (w: WidgetDefinition) => {
    // We use a CSS grid approach
    // Large: Span 2 columns
    // Medium: Span 1 column (usually 3-col grids)
    // Small: Span 1 column
    
    // For specific responsive behavior:
    if (activePreset.gridCols === 3) {
      if (w.size === "large") return "col-span-1 md:col-span-2 row-span-2";
      if (w.size === "medium") return "col-span-1 row-span-2";
      return "col-span-1 row-span-1";
    } else {
      // 2-column grid
      if (w.size === "large") return "col-span-1 md:col-span-2 row-span-2";
      if (w.size === "medium") return "col-span-1 row-span-2";
      return "col-span-1 row-span-1";
    }
  };

  return (
    <motion.div 
      layout
      className={cn(
        "grid gap-4 w-full h-full",
        activePreset.gridCols === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"
      )}
    >
      <AnimatePresence mode="popLayout">
        {activePreset.widgets.map((widget) => {
          const content = widgetMap[widget.id];
          if (!content) return null; // Fallback if widget component isn't provided

          return (
            <motion.div
              layout
              key={widget.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0 }}
              className={cn(
                "min-h-[150px] w-full relative",
                getWidgetClasses(widget)
              )}
            >
              {content}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
