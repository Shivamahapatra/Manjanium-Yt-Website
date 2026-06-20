import React from "react";
import { ArrowLeft, Clock, MapPin, Flag, Trophy } from "lucide-react";
import Link from "next/link";
import { Metadata } from 'next';

type Props = {
  params: Promise<{ raceId: string }>;
};

// Generate dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { raceId } = await params;
  return {
    title: `Race ${raceId} | F1 Hub`,
    description: `Detailed race classification, telemetry, and insights for round ${raceId}.`,
  };
}

export default async function F1RaceDetailsPage({ params }: Props) {
  const { raceId } = await params;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col pb-20">
      
      {/* Background elements */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Header Area */}
      <div className="bg-black/40 border-b border-white/10 pt-8 pb-8 px-4 sm:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          
          <Link 
            href="/f1?tab=results" 
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors w-fit text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to F1 Hub
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
                <h1 className="text-3xl md:text-5xl font-black font-heading tracking-tight drop-shadow-md flex items-center gap-3">
                  Grand Prix Analysis
                </h1>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-neutral-400 font-medium pl-4">
                <span className="flex items-center gap-1.5"><Flag className="w-4 h-4" /> Round {raceId}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Global Circuit</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 flex items-center gap-4 shadow-xl backdrop-blur-sm">
               <Trophy className="w-8 h-8 text-manjanium-gold" />
               <div>
                 <p className="text-xs text-neutral-400 uppercase tracking-wider font-bold">Race Winner</p>
                 <p className="text-xl font-bold font-mono text-white">TBD</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-12 w-full relative z-10">
         <div className="flex flex-col items-center justify-center h-96 border border-dashed border-white/10 rounded-2xl bg-black/20">
            <Clock className="w-16 h-16 text-neutral-600 mb-6 opacity-50" />
            <p className="text-3xl font-black mb-3 font-heading tracking-tight">Race Data Syncing</p>
            <p className="text-neutral-400 mb-6 text-center max-w-md">
              Full race classification, lap-by-lap telemetry, and strategy insights will be available here shortly after the session concludes.
            </p>
            <div className="text-xs text-blue-400 bg-blue-400/10 border border-blue-400/20 px-4 py-1.5 rounded-full font-bold">
              PAGE UNDER CONSTRUCTION
            </div>
         </div>
      </div>

    </div>
  );
}
