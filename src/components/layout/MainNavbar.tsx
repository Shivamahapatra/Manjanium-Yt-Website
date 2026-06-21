'use client'

import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MainNavbar() {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()

  const navItems = [
    { label: 'F1 HUB', href: '/f1' },
    { label: 'FOOTBALL', href: '/football' },
    { label: 'SETTINGS', href: '/settings' }
  ]

  return (
    <header 
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottomColor: 'var(--color-border)',
        backdropFilter: 'blur(12px)'
      }}
      className="fixed top-0 w-full z-50 flex justify-between items-center h-16 px-6 shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div 
          style={{ backgroundColor: 'var(--color-primary)' }}
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
        >
          MN
        </div>
        <h1 style={{ color: 'var(--color-text-primary)' }} className="font-bold text-lg">
          Manjanium On Softs
        </h1>
      </div>

      <nav className="hidden md:flex gap-6">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              color: pathname.startsWith(item.href) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottomColor: pathname.startsWith(item.href) ? 'var(--color-primary)' : 'transparent'
            }}
            className="font-bold text-xs uppercase tracking-wider border-b-2 pb-1 hover:text-primary transition-colors"
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
