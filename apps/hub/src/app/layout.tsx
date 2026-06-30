import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/design-system.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";

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
  title: "Manjanium Sports Network",
  description: "F1 Live Telemetry & FIFA World Cup 2026 Coverage",
};

import { MainLayout } from "@/components/layout/MainLayout";
import { SettingsProvider } from "@/lib/settings-context";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { ClerkProvider } from "@clerk/nextjs";
import AppearanceProvider from "@/components/providers/AppearanceProvider";
import { GlobeProvider } from "@/components/providers/GlobeProvider";
import { TerminalChatProvider } from "@/components/providers/TerminalChatProvider";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@500;700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className="min-h-full flex flex-col relative" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)' }}>
        <ClerkProvider>
          {/* TerminalChatProvider: opens the realtime channel once at app level */}
          <TerminalChatProvider>
            {/* GlobeProvider: keeps Globe Canvas alive across preset switches */}
            <GlobeProvider>
              <AppearanceProvider>
                <SettingsProvider>
                  <OnboardingModal />
                  <AntdRegistry>
                    <MainLayout>{children}</MainLayout>
                  </AntdRegistry>
                </SettingsProvider>
              </AppearanceProvider>
            </GlobeProvider>
          </TerminalChatProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
