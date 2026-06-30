'use client'

import React from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { HeroSection } from '@/components/home/HeroSection'
import { SectionTitle } from '@/components/home/SectionTitle'
import { DashboardGrid } from '@/components/home/DashboardGrid'
import { TimingTowerCard } from '@/components/home/TimingTowerCard'
import { TelemetryCard } from '@/components/home/TelemetryCard'
import { StandingsCard } from '@/components/home/StandingsCard'
import { F1PreviewCard } from '@/components/home/F1PreviewCard'
import { PlayerStatsCard } from '@/components/home/PlayerStatsCard'
import { CommunityPollsCard } from '@/components/home/CommunityPollsCard'
import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Navigation */}
      <Navbar />

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 lg:ml-20">
          {/* Hero Section */}
          <HeroSection />

          {/* F1 Dashboard Section */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto px-6 py-20"
          >
            <SectionTitle
              title="F1 Live"
              subtitle="Real-time session data and telemetry from the track"
            />
            <DashboardGrid>
              <TimingTowerCard />
              <TelemetryCard />
              <StandingsCard />
              <F1PreviewCard />
              <PlayerStatsCard />
              <CommunityPollsCard />
              <Link href="/simulator">
                <motion.div
                  className="bg-linear-to-br from-[#FBBF24]/20 to-surface border border-[#FBBF24]/40 rounded-lg p-6 hover:border-[#FBBF24] transition-colors cursor-pointer h-full"
                  whileHover={{ scale: 1.02, y: -4 }}
                >
                  <div className="text-4xl mb-3">🏎️</div>
                  <h3 className="text-xl font-bold text-[#FBBF24] font-heading mb-2">
                    PADDOCK SIMULATOR
                  </h3>
                  <p className="text-sm text-[#6B7280]">
                    Experience F1 racing with advanced physics, multiplayer modes, and global leaderboards.
                  </p>
                  <div className="mt-4 text-xs text-[#FBBF24] font-bold">
                    Enter Simulator →
                  </div>
                </motion.div>
              </Link>
            </DashboardGrid>
          </motion.section>

          {/* Football Section */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto px-6 py-20 border-t border-border"
          >
            <SectionTitle
              title="Football Center"
              subtitle="World Cup 2026 live scores and standings"
            />
            <DashboardGrid>
              <StandingsCard />
              <PlayerStatsCard />
              <CommunityPollsCard />
            </DashboardGrid>
          </motion.section>

          {/* Footer */}
          <footer className="bg-surface-alt border-t border-border mt-20">
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Brand */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-linear-to-br from-accent to-secondary rounded-lg flex items-center justify-center text-surface font-black">
                      M
                    </div>
                    <span className="font-heading font-bold text-lg">Manjanium</span>
                  </div>
                  <p className="text-muted text-sm">
                    The ultimate F1 & Football hub for real-time data and insights.
                  </p>
                </div>

                {/* Links */}
                <div>
                  <h4 className="font-bold mb-4 text-on-surface">Quick Links</h4>
                  <ul className="space-y-2 text-muted text-sm">
                    <li><Link href="/f1" className="hover:text-accent transition-standard">F1 Hub</Link></li>
                    <li><Link href="/football" className="hover:text-accent transition-standard">Football</Link></li>
                    <li><Link href="/settings" className="hover:text-accent transition-standard">Settings</Link></li>
                  </ul>
                </div>

                {/* Social */}
                <div>
                  <h4 className="font-bold mb-4 text-on-surface">Follow Us</h4>
                  <ul className="space-y-2 text-muted text-sm">
                    <li><a href="#" className="hover:text-accent transition-standard">Twitter / X</a></li>
                    <li><a href="#" className="hover:text-accent transition-standard">Discord</a></li>
                    <li><a href="#" className="hover:text-accent transition-standard">YouTube</a></li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-border pt-8 text-center text-muted text-sm">
                <p>&copy; 2026 Manjanium On Softs. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
