import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "F1 Cosmos",
  description: "High-performance F1 Data Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AntdRegistry>
            <div className="flex h-screen overflow-hidden bg-black">
              <Sidebar />
              <div className="flex flex-col flex-1 overflow-hidden relative">
                <Topbar />
                <main className="flex-1 overflow-y-auto custom-scrollbar">
                  {children}
                </main>
              </div>
            </div>
          </AntdRegistry>
        </ThemeProvider>
      </body>
    </html>
  );
}
