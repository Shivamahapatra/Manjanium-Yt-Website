'use client'

import React from 'react'
import { UserButton, useAuth } from '@clerk/nextjs'
import Link from 'next/link'

interface TopAppBarProps {
  title: string
  leading: string
  trailingIcon?: string
}

export function TopAppBar({ title, leading, trailingIcon }: TopAppBarProps) {
  const { isSignedIn } = useAuth()

  return (
    <header
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottomColor: 'var(--color-border)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center h-16 px-6 border-b shadow-sm"
    >
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-background)' }}
            className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0"
          >
            {leading}
          </div>
          <span style={{ color: 'var(--color-text-primary)' }} className="font-bold text-base hidden sm:inline">
            Manjanium On Softs
          </span>
          <span style={{ color: 'var(--color-text-secondary)' }} className="text-sm font-medium">
            / {title}
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {trailingIcon && (
          <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-xl" style={{ color: 'var(--color-primary)' }}>
              {trailingIcon}
            </span>
          </button>
        )}
        {isSignedIn ? (
          <UserButton />
        ) : (
          <div className="flex gap-2">
            <Link
              href="/sign-in"
              className="px-4 py-2 text-sm font-bold rounded hover:opacity-80 text-text-primary"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
