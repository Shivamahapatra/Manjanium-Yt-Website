'use client'

import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'F1 Hub', href: '/f1' },
  { label: 'Football', href: '/football' },
  { label: 'Settings', href: '/settings' }
]

export default function MainNavbar() {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '/f1') return pathname === '/f1' || pathname.startsWith('/f1/')
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <header
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottomColor: 'var(--color-border)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      className="fixed top-0 w-full z-50 flex justify-between items-center h-16 px-6 border-b shadow-sm"
    >
      <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
        <div
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-background)' }}
          className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0"
        >
          MN
        </div>
        <h1 style={{ color: 'var(--color-text-primary)' }} className="font-bold text-base hidden sm:block">
          Manjanium On Softs
        </h1>
      </Link>

      <nav className="hidden md:flex gap-1">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              color: isActive(item.href) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottomColor: isActive(item.href) ? 'var(--color-primary)' : 'transparent',
            }}
            className="font-bold text-xs uppercase tracking-wider border-b-2 pb-0.5 px-3 py-1 hover:opacity-90 transition-all rounded-sm"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        {isSignedIn ? (
          <UserButton />
        ) : (
          <div className="flex gap-2">
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm font-bold rounded hover:opacity-80">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button 
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-background)' }}
                className="px-4 py-2 text-sm font-bold rounded hover:opacity-80"
              >
                Sign Up
              </button>
            </SignUpButton>
          </div>
        )}
      </div>
    </header>
  )
}
