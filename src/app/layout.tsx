import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { SportsSidebar } from "@/components/layout/SportsSidebar";

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

import { MainNavbar } from "@/components/layout/MainNavbar";
import { FloatingFeatureDock } from "@/components/layout/FloatingFeatureDock";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col pt-16 relative">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AntdRegistry>
            <MainNavbar />
            <SportsSidebar>{children}</SportsSidebar>
            <FloatingFeatureDock />
          </AntdRegistry>
        </ThemeProvider>
      </body>
    </html>
  );
}
