"use client";

import React from 'react';
import { LiveTimingTower } from '@/components/f1/LiveTimingTower';

export default function LiveDashboardPage() {
  return (
    <div className="p-4 md:p-8 min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <LiveTimingTower />
      </div>
    </div>
  );
}
