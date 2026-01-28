// app/layout.tsx
export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { LoadingProvider } from "@/components/providers/LoadingProvider";
import { SonnerProvider } from "@/components/providers/SonnerProvider";
import { Providers } from "./providers";
import { NextAuthProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/logo.svg" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: "180x180", type: "image/png" },
    ],
  },
  title: "EventBridge - Event Planning Platform",
  description: "Find and book the best event vendors in Uganda",
  manifest: '/manifest.json',
  themeColor: '#7C3AED',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EventBridge',
  },
  applicationName: 'EventBridge',
  keywords: ['event planning', 'vendors', 'Uganda', 'events', 'wedding', 'party'],
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

  const swScript = `
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(
          function(registration) {
            console.log('ServiceWorker registration successful');
          },
          function(err) {
            console.log('ServiceWorker registration failed: ', err);
          }
        );
      });
    }
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme Script */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="EventBridge" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EventBridge" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
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
        
        {/* Service Worker Registration */}
        <script dangerouslySetInnerHTML={{ __html: swScript }} />
      </body>
    </html>
  );
}
