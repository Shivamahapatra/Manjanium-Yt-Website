import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { SidebarLayout } from "@/components/layout/SidebarLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Manjanium On Softs",
  description: "Live F1 Telemetry & Football Match Center",
};

import { FloatingNav } from "@/components/ui/floating-navbar";
import { IconHome, IconCarCrash, IconBallFootball } from "@tabler/icons-react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navItems = [
    { name: "Home", link: "/", icon: <IconHome className="h-4 w-4 text-neutral-500 dark:text-white" /> },
    { name: "F1 Hub", link: "/f1", icon: <IconCarCrash className="h-4 w-4 text-neutral-500 dark:text-white" /> },
    { name: "Football Center", link: "/football", icon: <IconBallFootball className="h-4 w-4 text-neutral-500 dark:text-white" /> },
  ];

  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AntdRegistry>
            <FloatingNav navItems={navItems} />
            <SidebarLayout>{children}</SidebarLayout>
          </AntdRegistry>
        </ThemeProvider>
      </body>
    </html>
  );
}
