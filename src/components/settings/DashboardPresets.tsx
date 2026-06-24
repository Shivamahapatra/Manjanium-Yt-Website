'use client'

import { F1DashboardPresets } from './F1DashboardPresets'
import { FootballDashboardPresets } from './FootballDashboardPresets'

export function DashboardPresets() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-12">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          Dashboard Presets
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Choose a layout preset to control what widgets appear on each hub page.
        </p>
      </div>

      {/* F1 Presets */}
      <section className="space-y-5">
        <F1DashboardPresets />
      </section>

      {/* Football Presets */}
      <section className="space-y-5">
        <div className="flex items-center gap-2 border-l-4 pl-3" style={{ borderColor: '#10B981' }}>
          <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: '#10B981' }}>
            Football Hub Layout
          </h3>
        </div>
        <FootballDashboardPresets />
      </section>
    </div>
  )
}

export default DashboardPresets
