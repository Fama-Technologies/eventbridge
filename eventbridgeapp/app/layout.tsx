import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast"; 

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "EventBridge",
  description: "Event planning platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prevent theme flash before hydration
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
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}