"use client";

import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { IconHome, IconCarCrash, IconBallFootball } from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { setTheme, theme } = useTheme();

  const links = [
    {
      label: "Home",
      href: "/",
      icon: (
        <IconHome className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "F1 Telemetry",
      href: "/f1",
      icon: (
        <IconCarCrash className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Football Center",
      href: "/football",
      icon: (
        <IconBallFootball className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  return (
    <div className="flex h-screen w-full flex-col md:flex-row bg-neutral-100 dark:bg-[#0a0a0a] flex-1 mx-auto overflow-hidden">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-neutral-200 flex-shrink-0" />
              ) : (
                <Moon className="h-5 w-5 text-neutral-700 flex-shrink-0" />
              )}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: open ? 1 : 0 }}
                className="text-sm text-neutral-700 dark:text-neutral-200 whitespace-pre"
              >
                Toggle Theme
              </motion.span>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      <main className="flex-1 overflow-y-auto bg-white dark:bg-black pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}
