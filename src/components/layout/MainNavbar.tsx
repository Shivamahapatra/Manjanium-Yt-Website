"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IconSettings, IconUser, IconMenu2, IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

interface MainNavbarProps {
  currentSport?: "f1" | "football" | "other";
  liveMatchCount?: number;
  onSportChange?: (sport: string) => void;
  onSettingsClick?: () => void;
}

export function MainNavbar({
  currentSport = "f1",
  liveMatchCount = 3,
  onSportChange,
  onSettingsClick,
}: MainNavbarProps) {
  const pathname = usePathname();
  const [isSportDropdownOpen, setIsSportDropdownOpen] = useState(false);
  const { isSignedIn } = useAuth();
  
  // Attempt to use Sidebar context if available (it might fail if not wrapped, so we conditionally use it)
  let setOpenSidebar: any = null;
  let isSidebarOpen = false;
  try {
    const sidebar = useSidebar();
    setOpenSidebar = sidebar.setOpen;
    isSidebarOpen = sidebar.open;
  } catch (e) {
    // If not inside SidebarProvider, ignore
  }

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "F1 Hub", href: "/f1" },
    { name: "Football Hub", href: "/football" },
    { name: "Live Stats", href: "/stats" },
    ...(currentSport === "football" ? [{ name: "World Cup 2026", href: "/world-cup" }] : []),
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-[5000] w-full h-16",
        "bg-bg-primary/80 backdrop-blur-lg border-b border-border-color shadow-sm transition-colors duration-200",
        "flex items-center justify-between px-4 md:px-8"
      )}
    >
      {/* LEFT SECTION: Logo & Sports Selector */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-surface rounded-lg flex items-center justify-center border border-border-color group-hover:border-accent transition-colors shadow-sm">
            <span className="text-text-primary font-bold text-lg leading-none">M</span>
          </div>
          <span className="hidden sm:block text-text-primary font-heading font-bold tracking-widest text-lg">
            MANJANIUM
          </span>
        </Link>

        {/* Sports Selector */}
        <div className="relative">
          <button
            onClick={() => setIsSportDropdownOpen(!isSportDropdownOpen)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface hover:bg-surface/80 border border-border-color transition-colors text-sm font-medium shadow-sm"
          >
            <span className={cn(currentSport === "f1" ? "text-semantic-red" : currentSport === "football" ? "text-semantic-green" : "text-text-secondary")}>
              {currentSport === "f1" ? "F1" : currentSport === "football" ? "FOOTBALL" : "OTHER"}
            </span>
            <IconChevronDown className={cn("w-4 h-4 text-text-secondary transition-transform", isSportDropdownOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {isSportDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-2 w-40 bg-surface border border-border-color rounded-xl shadow-md overflow-hidden flex flex-col py-1"
              >
                {["f1", "football", "other"].map((sport) => (
                  <button
                    key={sport}
                    onClick={() => {
                      onSportChange?.(sport);
                      setIsSportDropdownOpen(false);
                    }}
                    className={cn(
                      "px-4 py-2 text-left text-sm hover:bg-bg-primary transition-colors font-medium",
                      currentSport === sport ? "text-accent" : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    {sport.toUpperCase()}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CENTER SECTION: Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-1">
        {navLinks.map((link, idx) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
          return (
            <Link key={link.name} href={link.href} className="relative group px-4 py-2">
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
                className={cn(
                  "text-sm font-semibold transition-colors duration-150 z-10 relative",
                  isActive ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"
                )}
              >
                {link.name}
              </motion.span>
              
              {/* Active / Hover Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent shadow-[0_0_8px_var(--accent)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {!isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent/50 transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100" />
              )}
            </Link>
          );
        })}
      </div>

      {/* RIGHT SECTION: Badges & Profile */}
      <div className="flex items-center gap-4">
        {/* Live Badge */}
        {liveMatchCount > 0 && (
          <button 
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-semantic-red/10 border border-semantic-red/20 hover:bg-semantic-red/20 transition-colors group"
          >
            <div className="w-2 h-2 rounded-full bg-semantic-red animate-pulse shadow-[0_0_8px_var(--semantic-red)]" />
            <span className="text-xs font-bold text-semantic-red tracking-wider hidden sm:block">
              {liveMatchCount} LIVE MATCHES
            </span>
            <span className="text-xs font-bold text-semantic-red tracking-wider sm:hidden">
              LIVE
            </span>
          </button>
        )}

        {/* Settings Icon */}
        <button 
          onClick={onSettingsClick}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-full hover:bg-surface hidden sm:block"
        >
          <IconSettings className="w-5 h-5 transition-transform hover:rotate-45" />
        </button>

        {/* User Avatar */}
        {!isSignedIn ? (
          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <button className="hidden sm:block px-4 py-1.5 rounded-lg text-sm font-medium text-text-primary hover:bg-surface transition-colors border border-border-color shadow-sm">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="hidden sm:block px-4 py-1.5 rounded-lg text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity shadow-sm">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        ) : (
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 rounded-full",
                userButtonBox: "flex-row-reverse",
                userButtonPopoverCard: "rounded-xl shadow-md border border-border-color bg-surface"
              }
            }}
          />
        )}

        {/* Mobile Hamburger (only visible when < lg) */}
        <button 
          className="lg:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-full transition-colors"
          onClick={() => setOpenSidebar?.(!isSidebarOpen)}
        >
          <IconMenu2 className="w-6 h-6" />
        </button>
      </div>
    </motion.nav>
  );
}
