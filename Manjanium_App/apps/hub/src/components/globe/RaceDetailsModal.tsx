import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, MapPin, Trophy, Milestone, Compass, Eye, Activity } from "lucide-react";
import { RaceVenue } from "@/hooks/useGlobeCalendar";
import { getCountryFlag } from "@/lib/f1-helpers";

interface RaceDetailsModalProps {
  venue: RaceVenue | null;
  isOpen: boolean;
  onClose: () => void;
  theme?: "dark" | "light";
}

export function RaceDetailsModal({
  venue,
  isOpen,
  onClose,
  theme = "dark",
}: RaceDetailsModalProps): React.JSX.Element | null {
  if (!isOpen || !venue) return null;

  // Theme styling helpers
  const overlayClass = theme === "light" ? "bg-black/25" : "bg-black/60";
  const modalBgClass = theme === "light"
    ? "bg-white text-neutral-900 border-neutral-200 shadow-2xl"
    : "bg-[#0b0d19]/95 text-white border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.8)]";

  const dividerClass = theme === "light" ? "border-neutral-100" : "border-neutral-800/80";
  const labelTextClass = theme === "light" ? "text-neutral-500" : "text-neutral-450";
  const valueTextClass = theme === "light" ? "text-neutral-900" : "text-neutral-200";
  const bgCardClass = theme === "light" ? "bg-neutral-50" : "bg-neutral-900/30";

  // Formats date nicely
  const formattedDate = new Date(venue.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Formats session time to user locale
  const formattedTime = () => {
    if (!venue.time) return "TBC";
    try {
      const dt = new Date(`${venue.date}T${venue.time}`);
      return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(dt);
    } catch {
      return "TBC";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Overlay backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className={`absolute inset-0 backdrop-blur-sm ${overlayClass}`}
        />

        {/* Modal card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
          className={`relative w-full max-w-[500px] rounded-2xl border p-6 overflow-hidden md:max-h-[90vh] overflow-y-auto ${modalBgClass}`}
          role="dialog"
          aria-modal="true"
          aria-label={`${venue.name} round details`}
        >
          {/* Header decorative gradients */}
          <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-blue-600 via-purple-500 to-red-500" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors cursor-pointer ${
              theme === "light"
                ? "hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900"
                : "hover:bg-white/10 text-neutral-400 hover:text-white"
            }`}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className={`pb-4 border-b ${dividerClass} pr-8`}>
            <span className="inline-block px-2.5 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[10px] font-black uppercase tracking-wider mb-2 font-mono">
              Round {venue.round} of 22
            </span>
            <h2 className="text-2xl font-bold flex items-center gap-2.5 leading-snug">
              <span className="text-3xl leading-none shrink-0" role="img" aria-label={`${venue.country} flag`}>
                {venue.flag}
              </span>
              <span className="line-clamp-1">{venue.name}</span>
            </h2>
            <div className={`flex items-center gap-1.5 mt-1 text-xs ${labelTextClass}`}>
              <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="truncate">{venue.circuit.name}</span>
            </div>
          </div>

          {/* Body */}
          <div className="py-4 space-y-4 text-sm">
            {/* Date and Time schedule */}
            <div className={`p-4 rounded-xl space-y-2.5 border ${dividerClass} ${bgCardClass}`}>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-neutral-500 shrink-0" />
                <div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider block ${labelTextClass}`}>Race Date</span>
                  <span className={`font-semibold ${valueTextClass}`}>{formattedDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
                <div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider block ${labelTextClass}`}>Lights Out</span>
                  <span className={`font-mono font-semibold ${valueTextClass}`}>{formattedTime()}</span>
                </div>
              </div>
            </div>

            {/* Track Configuration Statistics */}
            <div>
              <h4 className={`text-[10px] uppercase font-bold tracking-wider mb-2 ${labelTextClass}`}>Circuit Metrics</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className={`p-3 rounded-xl border text-center ${dividerClass} ${bgCardClass}`}>
                  <Milestone className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                  <span className={`text-[9px] block uppercase ${labelTextClass}`}>Distance</span>
                  <span className="text-xs font-bold font-mono">{venue.circuit.length.toFixed(3)} km</span>
                </div>
                <div className={`p-3 rounded-xl border text-center ${dividerClass} ${bgCardClass}`}>
                  <Compass className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                  <span className={`text-[9px] block uppercase ${labelTextClass}`}>Turns</span>
                  <span className="text-xs font-bold font-mono">{venue.circuit.turns}</span>
                </div>
                <div className={`p-3 rounded-xl border text-center ${dividerClass} ${bgCardClass}`}>
                  <Activity className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                  <span className={`text-[9px] block uppercase ${labelTextClass}`}>Layout</span>
                  <span className={`text-[9px] font-black uppercase tracking-wider ${
                    venue.circuit.type === "street" ? "text-amber-500" : "text-emerald-500"
                  }`}>
                    {venue.circuit.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Historical Winner info */}
            {venue.winner ? (
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${dividerClass} ${bgCardClass}`}>
                <Trophy className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider block ${labelTextClass}`}>Recent Winner</span>
                  <span className={`font-semibold ${valueTextClass}`}>{venue.winner}</span>
                </div>
              </div>
            ) : venue.podiumHistory ? (
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${dividerClass} ${bgCardClass}`}>
                <Trophy className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider block ${labelTextClass}`}>Last Podium</span>
                  <span className={`text-xs ${valueTextClass}`}>{venue.podiumHistory}</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer actions */}
          <div className={`pt-4 border-t flex items-center justify-end gap-3 ${dividerClass}`}>
            <button
              onClick={onClose}
              className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                theme === "light"
                  ? "border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                  : "border-neutral-850 hover:bg-white/5 text-neutral-300"
              }`}
            >
              Close
            </button>
            <a
              href={`/f1/races/${venue.round}`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md hover:shadow-blue-500/10 active:scale-95"
            >
              <Eye className="w-4 h-4" />
              Full Details
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
export default RaceDetailsModal;
