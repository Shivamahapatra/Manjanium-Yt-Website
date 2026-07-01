import React from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { VenueDetailInfo } from "@/lib/globe-interactions";
import { getCountryFlag } from "@/lib/f1-helpers";

interface VenueTooltipProps {
  venue: VenueDetailInfo | null;
  mousePos: { x: number; y: number };
  active: boolean;
  theme?: "dark" | "light";
}

export function VenueTooltip({ venue, mousePos, active, theme = "dark" }: VenueTooltipProps): React.JSX.Element | null {
  if (!active || !venue) return null;

  const flag = getCountryFlag(venue.country);

  // Theme-aware conditional style classes
  const containerThemeClasses = theme === "light"
    ? "bg-white/95 border-neutral-200 text-neutral-900 shadow-xl"
    : "bg-[#070913]/95 border-[#1f2937]/80 text-white shadow-2xl";

  const borderClass = theme === "light" ? "border-neutral-200" : "border-[#1f2937]/50";
  const subBorderClass = theme === "light" ? "border-neutral-200" : "border-[#1f2937]/30";
  const roundLabelClass = theme === "light" ? "text-neutral-500 font-bold" : "text-neutral-500";
  const textLabelClass = theme === "light" ? "text-neutral-600" : "text-neutral-400";
  const statsLabelClass = theme === "light" ? "text-neutral-800" : "text-white";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={`absolute pointer-events-none z-50 border rounded-xl p-3 backdrop-blur-md max-w-[240px] text-left ${containerThemeClasses}`}
      style={{
        left: mousePos.x + 15,
        top: mousePos.y + 15,
      }}
    >
      <div className={`flex items-center gap-2 mb-1.5 pb-1.5 border-b ${borderClass}`}>
        <span className="text-lg leading-none">{flag}</span>
        <div>
          <span className={`text-[10px] font-mono uppercase tracking-wider block ${roundLabelClass}`}>
            Round {venue.round}
          </span>
          <h5 className="font-bold text-xs leading-tight line-clamp-1">{venue.name}</h5>
        </div>
      </div>

      <div className="space-y-1.5 text-[10px]">
        <div className="flex items-center gap-1.5 text-neutral-500">
          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate">{venue.circuit}</span>
        </div>

        <div className={`flex justify-between items-center font-mono mt-2 pt-1 border-t ${subBorderClass} ${textLabelClass}`}>
          <span className="uppercase text-[8px] tracking-wider">Type</span>
          <span className={`text-[9px] font-bold ${venue.circuitType === "street" ? "text-amber-500" : "text-emerald-500"}`}>
            {venue.circuitType === "street" ? "STREET TRACK" : "PERMANENT"}
          </span>
        </div>

        <div className={`flex justify-between items-center font-mono ${textLabelClass}`}>
          <span className="uppercase text-[8px] tracking-wider">Distance</span>
          <span className={statsLabelClass}>{venue.trackLength}</span>
        </div>

        <div className={`flex justify-between items-center font-mono ${textLabelClass}`}>
          <span className="uppercase text-[8px] tracking-wider">Turns</span>
          <span className={statsLabelClass}>{venue.turns}</span>
        </div>

        {venue.sprint && (
          <div className="mt-2 text-center">
            <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-500 text-[8px] font-black rounded uppercase tracking-wider">
              Sprint Weekend
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
export default VenueTooltip;
