import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ChannelsBannerProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  url: string;
  accentColor?: string;
  className?: string;
}

export function ChannelsBanner({
  title,
  description,
  icon,
  buttonText,
  url,
  accentColor = "bg-blue-600",
  className,
}: ChannelsBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative w-full rounded-3xl overflow-hidden border border-white/10 p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 group",
        className
      )}
    >
      {/* Background gradients and glow */}
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-md z-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-0" />
      <div className={cn("absolute -top-24 -right-24 w-64 h-64 rounded-2xl blur-3xl opacity-20 group-hover:opacity-40 transition-opacity z-0 pointer-events-none", accentColor)} />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 border border-white/20 shadow-inner backdrop-blur-md">
          {icon}
        </div>
        <div>
          <h3 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-neutral-400 text-lg md:text-xl max-w-xl">
            {description}
          </p>
        </div>
      </div>

      <div className="relative z-10 w-full md:w-auto shrink-0">
        <Link href={url} target="_blank" rel="noopener noreferrer" className="block w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="w-full md:w-auto bg-white/10 hover:bg-manjanium-gold hover:text-black border border-white/20 text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-lg shadow-lg"
          >
            {buttonText} <IconArrowRight className="w-5 h-5" />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}
