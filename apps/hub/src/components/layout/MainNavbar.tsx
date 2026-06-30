'use client'

import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'F1 Hub', href: '/f1' },
  { label: 'Football', href: '/football' },
  { label: 'Settings', href: '/settings' }
]

export default function MainNavbar() {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '/f1') return pathname === '/f1' || pathname.startsWith('/f1/')
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-border-primary/50 bg-navbar-bg shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-sm text-white shadow-md"
            >
              MN
            </motion.div>
            <h1 className="font-bold text-base hidden sm:block text-text-primary">
              Manjanium
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-200 rounded-lg ${
                  isActive(item.href)
                    ? 'text-brand-primary bg-brand-primary/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-interactive-hover'
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Section - Auth & Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {isSignedIn ? (
              <UserButton />
            ) : (
              <div className="hidden sm:flex gap-2">
                <SignInButton mode="modal">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 text-sm font-semibold rounded-lg text-text-primary hover:bg-interactive-hover transition-colors duration-200"
                  >
                    Sign In
                  </motion.button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Sign Up
                  </motion.button>
                </SignUpButton>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-interactive-hover transition-colors duration-200"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-text-primary" />
              ) : (
                <Menu className="w-5 h-5 text-text-primary" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden pb-4 border-t border-border-primary/50"
          >
            <nav className="flex flex-col gap-2 mt-4">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-brand-primary bg-brand-primary/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-interactive-hover'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {!isSignedIn && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-border-primary/50">
                <SignInButton mode="modal">
                  <button className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg text-text-primary hover:bg-interactive-hover transition-colors duration-200">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </header>
  )
}
