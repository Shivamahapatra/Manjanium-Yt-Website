'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'F1 Hub', href: '/f1', icon: '⚡' },
  { label: 'Football', href: '/football', icon: '⚽' },
  { label: 'Live Timing', href: '/timing', icon: '⏱️' },
  { label: 'Settings', href: '/settings', icon: '⚙️' }
]

export default function SportsSidebar({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-full">
      <aside 
        style={{ backgroundColor: 'var(--color-surface-container)', borderRightColor: 'var(--color-border)' }}
        className="hidden md:flex flex-col gap-2 py-4 overflow-hidden h-full w-[80px] hover:w-[240px] transition-all duration-300 border-r shrink-0 relative z-20 group"
      >
        <div className="px-6 mb-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          <span style={{ color: 'var(--color-primary)' }} className="font-bold text-sm">
            CHAMPIONSHIP
          </span>
        </div>

        <nav className="flex flex-col gap-1 w-full">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                backgroundColor: pathname.startsWith(item.href) ? 'var(--color-primary)' : 'transparent',
                color: pathname.startsWith(item.href) ? 'var(--color-background)' : 'var(--color-text-secondary)',
                borderLeftColor: pathname.startsWith(item.href) ? 'var(--color-primary)' : 'transparent'
              }}
              className="flex items-center gap-4 px-6 py-3 border-l-4 font-bold transition-all hover:bg-surface-container-high whitespace-nowrap"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
