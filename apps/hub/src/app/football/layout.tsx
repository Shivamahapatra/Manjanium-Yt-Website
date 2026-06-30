'use client'

import TerminalChat from '@/components/chat/TerminalChat'

export default function FootballLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {/* ✅ Terminal Chat appears ONLY in Football Hub */}
      <TerminalChat context="football" />
      {children}
    </div>
  )
}
