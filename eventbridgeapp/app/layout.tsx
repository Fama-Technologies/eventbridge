export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { LoadingProvider } from "@/components/providers/LoadingProvider";
import { SonnerProvider } from "@/components/providers/SonnerProvider";
import { Providers } from "./providers";
import { NextAuthProvider } from "@/components/providers/session-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  icons: {
    icon: "/logo.svg",
  },
  title: "EventBridge",
  description: "Event planning platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeScript = `
    (function () {
      try {
        var theme = localStorage.getItem('theme');
        var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var resolved =
          theme === 'dark'
            ? 'dark'
            : theme === 'light'
            ? 'light'
            : systemDark
            ? 'dark'
            : 'light';
        document.documentElement.setAttribute('data-theme', resolved);
        // Also add/remove 'dark' class for Tailwind dark mode utilities
        if (resolved === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <NextAuthProvider>
          <Providers>
            <ThemeProvider>
              <LoadingProvider>
                <ToastProvider>
                  <SonnerProvider />
                  {children}
                </ToastProvider>
              </LoadingProvider>
            </ThemeProvider>
          </Providers>
        </NextAuthProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}