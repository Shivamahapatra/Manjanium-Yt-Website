'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { Tabs, TabsContent } from '@/components/ui/shadcn-tabs';
import { useF1PresetLayout } from '@/hooks/usePresetLayout';
import '@/styles/f1-design-tokens.css';
import { F1Badge } from '@/components/f1/F1Badge';

// Import our premium F1 tab components
import { F1LiveTab } from "@/components/f1/tabs/F1LiveTab";
import { F1ReplayTab } from "@/components/f1/tabs/F1ReplayTab";
import { F1TelemetryTab } from "@/components/f1/tabs/F1TelemetryTab";
import { F1StandingsTab } from "@/components/f1/tabs/F1StandingsTab";
import { F1CalendarTab } from "@/components/f1/tabs/F1CalendarTab";
import { F1ResultsTab } from "@/components/f1/tabs/F1ResultsTab";
import { F1UpdatesTab } from "@/components/f1/tabs/F1UpdatesTab";
import DarkVeil from "@/components/ui/DarkVeil";

function F1HubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const presetLayout = useF1PresetLayout();

  // Tab State
  const defaultTab = searchParams.get('tab') || 'live';
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/f1?tab=${value}`, { scroll: false });
  };

  return (
    <div className="w-full flex flex-col pt-4 px-4 sm:px-8 max-w-7xl mx-auto z-10 relative pb-32">
      {/* Header - Styled with Stitch design system */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Space_Grotesk'] tracking-tight">
            ⚡ F1 Hub
          </h1>
          <p className="text-[#6B7280] text-sm font-['Inter'] mt-1">Professional Dashboard</p>
        </div>
        <F1Badge variant="live">🔴 LIVE</F1Badge>
      </div>

      {/* Background glow tailored for F1 */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen" style={{ filter: 'sepia(1) hue-rotate(330deg) saturate(5)' }}>
        <DarkVeil
          hueShift={0}
          noiseIntensity={0}
          scanlineIntensity={0.4}
          speed={0.8}
          scanlineFrequency={60}
          warpAmount={0.05}
          resolutionScale={1}
        />
      </div>
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-[#e10600]/10 rounded-2xl blur-[150px] pointer-events-none z-0" />
      <div className="fixed top-1/4 left-1/4 w-[400px] h-[400px] bg-red-800/10 rounded-2xl blur-[150px] pointer-events-none z-0" />

      {/* ===== TABS CONTENT ===== */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex flex-col relative z-10">
        <div className="relative min-h-[500px] w-full mt-4">
          
          {/* ----- LIVE ----- */}
          <TabsContent value="live" className="mt-0 outline-none">
            {activeTab === 'live' && <F1LiveTab presetLayout={presetLayout} />}
          </TabsContent>

          {/* ----- REPLAY ----- */}
          <TabsContent value="replay" className="mt-0 outline-none">
            {activeTab === 'replay' && <F1ReplayTab />}
          </TabsContent>

          {/* ----- TELEMETRY ----- */}
          <TabsContent value="telemetry" className="mt-0 outline-none">
            {activeTab === 'telemetry' && <F1TelemetryTab />}
          </TabsContent>

          {/* ----- STANDINGS ----- */}
          <TabsContent value="standings" className="mt-0 outline-none">
            {activeTab === 'standings' && <F1StandingsTab />}
          </TabsContent>

          {/* ----- CALENDAR ----- */}
          <TabsContent value="calendar" className="mt-0 outline-none">
            {activeTab === 'calendar' && <F1CalendarTab />}
          </TabsContent>

          {/* ----- RESULTS ----- */}
          <TabsContent value="results" className="mt-0 outline-none">
            {activeTab === 'results' && <F1ResultsTab />}
          </TabsContent>

          {/* ----- UPDATES ----- */}
          <TabsContent value="updates" className="mt-0 outline-none">
            {activeTab === 'updates' && <F1UpdatesTab />}
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
}

export default function F1Hub() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]"><Spin size="large" /></div>}>
      <F1HubContent />
    </Suspense>
  );
}
