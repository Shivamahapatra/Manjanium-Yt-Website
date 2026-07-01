"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ConfigProvider, theme } from "antd";
import { useTheme } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <AntdThemeProvider>{children}</AntdThemeProvider>
    </NextThemesProvider>
  );
}

function AntdThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm:
          resolvedTheme === "dark"
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1677ff",
          fontFamily: "var(--font-geist-sans), sans-serif",
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
