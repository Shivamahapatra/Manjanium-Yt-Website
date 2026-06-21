import React from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Navigation } from "lucide-react";
import { VenueDetailInfo } from "@/lib/globe-interactions";
import { getCountryFlag } from "@/lib/f1-helpers";

interface VenueTooltipProps {
  venue: VenueDetailInfo | null;
  mousePos: { x: number; y: number };
  active: boolean;
}

export function VenueTooltip({ venue, mousePos, active }: VenueTooltipProps): React.JSX.Element | null {
  if (!active || !venue) return null;

  const flag = getCountryFlag(venue.country);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute pointer-events-none z-50 bg-[#070913]/95 border border-[#1f2937]/80 rounded-xl p-3 shadow-2xl backdrop-blur-md max-w-[240px] text-left"
      style={{
        left: mousePos.x + 15,
        top: mousePos.y + 15,
      }}
    >
      <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-[#1f2937]/50">
        <span className="text-lg leading-none">{flag}</span>
        <div>
          <span className="text-[10px] text-neutral-500 font-mono font-bold uppercase tracking-wider block">
            Round {venue.round}
          </span>
          <h5 className="text-white font-bold text-xs leading-tight line-clamp-1">{venue.name}</h5>
        </div>
      </div>

      <div className="space-y-1.5 text-[10px]">
        <div className="flex items-center gap-1.5 text-neutral-300">
          <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="truncate">{venue.circuit}</span>
        </div>

        <div className="flex justify-between items-center text-neutral-400 font-mono mt-2 pt-1 border-t border-[#1f2937]/30">
          <span className="uppercase text-[8px] tracking-wider">Type</span>
          <span className={`text-[9px] font-bold ${venue.circuitType === "street" ? "text-amber-400" : "text-emerald-400"}`}>
            {venue.circuitType === "street" ? "STREET TRACK" : "PERMANENT"}
          </span>
        </div>

        <div className="flex justify-between items-center text-neutral-400 font-mono">
          <span className="uppercase text-[8px] tracking-wider">Distance</span>
          <span className="text-white">{venue.trackLength}</span>
        </div>

        <div className="flex justify-between items-center text-neutral-400 font-mono">
          <span className="uppercase text-[8px] tracking-wider">Turns</span>
          <span className="text-white">{venue.turns}</span>
        </div>

        {venue.sprint && (
          <div className="mt-2 text-center">
            <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[8px] font-black rounded uppercase tracking-wider">
              Sprint Weekend
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
export default VenueTooltip;
