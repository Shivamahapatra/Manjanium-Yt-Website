"use client";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { LampContainer } from "@/components/ui/lamp";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { motion } from "framer-motion";
import { IconBrandYoutube } from "@tabler/icons-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-950">
      <AuroraBackground showRadialGradient className="h-[60vh] md:h-[70vh]">
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative flex flex-col gap-4 items-center justify-center px-4"
        >
          <div className="text-3xl md:text-7xl font-bold dark:text-white text-center">
            Manjanium On Softs
          </div>
          <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4 text-center">
            The Ultimate F1 & Football Hub
          </div>
          <Link
            href="https://www.youtube.com/@manjaniumonsofts67"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-black dark:bg-white rounded-full w-fit text-white dark:text-black px-4 py-2 flex items-center gap-2 transition hover:scale-105 active:scale-95 font-semibold">
              <IconBrandYoutube className="w-5 h-5 text-red-500" />
              Subscribe to Channel
            </button>
          </Link>
        </motion.div>
      </AuroraBackground>

      <div className="w-full relative z-10 -mt-20">
        <LampContainer className="h-[50vh] md:h-[60vh] pt-40">
          <motion.h1
            initial={{ opacity: 0.5, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
          >
            Live Sports Telemetry <br /> Uninterrupted.
          </motion.h1>
        </LampContainer>
      </div>

      <div className="max-w-5xl mx-auto px-8 w-full pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-10 bg-white dark:bg-zinc-900 h-full">
            <p className="text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200 font-bold">
              Upcoming Streams
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Catch the next live watchalong for Formula 1 Grand Prix weekends and major UEFA Champions League fixtures.
            </p>
          </BackgroundGradient>
          <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-10 bg-white dark:bg-zinc-900 h-full">
            <p className="text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200 font-bold">
              Channel Logs
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Access archive streams, race debriefs, tactical football analysis, and exclusive member content.
            </p>
          </BackgroundGradient>
          <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-10 bg-white dark:bg-zinc-900 h-full">
            <p className="text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200 font-bold">
              Live Content Anchors
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Interact with the live telemetry directly from the F1 and Football match centers using the sidebar.
            </p>
          </BackgroundGradient>
        </div>
      </div>
    </div>
  );
}
