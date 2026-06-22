import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

export interface ChannelCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  followers?: string;
  buttonText: string;
  url: string;
  accentColor?: string;
}

export function ChannelCard({
  name,
  description,
  icon,
  followers,
  buttonText,
  url,
  accentColor = "text-blue-500",
}: ChannelCardProps) {
  return (
    <div className="relative group block h-full w-full">
      <div className="rounded-2xl h-full w-full p-6 bg-primary/80 backdrop-blur-md border border-border relative z-20 flex flex-col overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:border-manjanium-gold/50">
        
        {/* Subtle glow effect behind icon */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-2xl blur-3xl group-hover:bg-manjanium-gold/10 transition-all pointer-events-none" />

        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${accentColor}`}>
            {icon}
          </div>
          {followers && (
            <div className="text-xs font-bold text-neutral-400 bg-black/40 px-3 py-1.5 rounded-2xl border border-white/5">
              {followers}
            </div>
          )}
        </div>
        
        <h4 className="text-white font-bold tracking-wide text-lg mt-2 relative z-10">{name}</h4>
        <p className="mt-2 text-neutral-400 leading-relaxed text-sm flex-1 relative z-10">{description}</p>
        
        <div className="mt-6 relative z-10">
          <Link href={url} target="_blank" rel="noopener noreferrer" className="block w-full">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-white/5 hover:bg-manjanium-gold hover:text-black border border-white/10 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-sm"
            >
              {buttonText} <IconArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
}
