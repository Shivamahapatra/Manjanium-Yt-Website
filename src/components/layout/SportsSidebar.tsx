'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'F1 Hub', href: '/f1', icon: '⚡' },
  { label: 'Football', href: '/football', icon: '⚽' },
  { label: 'Settings', href: '/settings', icon: '⚙️' }
]

export default function SportsSidebar({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/f1') return pathname === '/f1' || pathname.startsWith('/f1/')
    if (href === '/football') return pathname === '/football' || pathname.startsWith('/football/')
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="flex h-full w-full">
      {/* Desktop Sidebar */}
      <aside
        style={{ backgroundColor: 'var(--color-surface-container)', borderRightColor: 'var(--color-border)' }}
        className="hidden md:flex flex-col gap-2 py-4 overflow-hidden h-full w-[72px] hover:w-[220px] transition-all duration-300 ease-in-out border-r shrink-0 relative z-20 group"
      >
        <div className="px-5 mb-4 whitespace-nowrap overflow-hidden">
          <span
            style={{ color: 'var(--color-primary)' }}
            className="font-black text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            CHAMPIONSHIP
          </span>
        </div>

        <nav className="flex flex-col gap-1 w-full">
          {navItems.map(item => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  backgroundColor: active ? 'var(--color-primary)' : 'transparent',
                  color: active ? 'var(--color-background)' : 'var(--color-text-secondary)',
                  borderLeftColor: active ? 'var(--color-primary)' : 'transparent',
                }}
                className="flex items-center gap-4 px-5 py-3.5 border-l-4 font-bold transition-all duration-200 hover:opacity-90 whitespace-nowrap overflow-hidden"
              >
                <span className="text-xl shrink-0 w-6 text-center">{item.icon}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-w-0">
        {children}
      </div>

      {/* Mobile Bottom Nav */}
      <nav
        style={{ backgroundColor: 'var(--color-surface-container)', borderTopColor: 'var(--color-border)' }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex justify-around items-stretch h-16 border-t"
      >
        {navItems.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              }}
              className="flex flex-col items-center justify-center gap-1 flex-1 text-center font-bold transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] uppercase tracking-wider">{item.label.split(' ')[0]}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
