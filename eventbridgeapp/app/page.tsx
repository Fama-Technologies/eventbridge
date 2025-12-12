'use client';

import { ThemeToggle } from "./components/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutrals-01 font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-shades-white sm:items-start">
        <div className="w-full flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-shades-black">EventBridge App</h1>
          <ThemeToggle />
        </div>
        
        <div className="flex flex-col gap-8 w-full">
          {/* Color Showcase Section */}
          <section>
            <h2 className="text-xl font-semibold text-shades-black mb-4">Theme Colors</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Primary Colors */}
              <div className="flex flex-col gap-2">
                <div className="h-20 rounded-lg bg-primary-01 flex items-center justify-center">
                  <span className="text-shades-white text-sm font-medium">Primary 01</span>
                </div>
                <div className="h-20 rounded-lg bg-primary-02 flex items-center justify-center">
                  <span className="text-shades-white text-sm font-medium">Primary 02</span>
                </div>
              </div>
              
              {/* Neutrals */}
              <div className="flex flex-col gap-2">
                <div className="h-20 rounded-lg bg-neutrals-03 flex items-center justify-center">
                  <span className="text-shades-black text-sm font-medium">Neutrals 03</span>
                </div>
                <div className="h-20 rounded-lg bg-neutrals-07 flex items-center justify-center">
                  <span className="text-shades-white text-sm font-medium">Neutrals 07</span>
                </div>
              </div>
              
              {/* Accents */}
              <div className="flex flex-col gap-2">
                <div className="h-20 rounded-lg bg-accents-orange flex items-center justify-center">
                  <span className="text-shades-white text-sm font-medium">Orange</span>
                </div>
                <div className="h-20 rounded-lg bg-accents-peach flex items-center justify-center">
                  <span className="text-shades-black text-sm font-medium">Peach</span>
                </div>
              </div>
              
              {/* Special */}
              <div className="flex flex-col gap-2">
                <div className="h-20 rounded-lg bg-accents-discount flex items-center justify-center">
                  <span className="text-shades-white text-sm font-medium">Discount</span>
                </div>
                <div className="h-20 rounded-lg bg-accents-link flex items-center justify-center">
                  <span className="text-shades-white text-sm font-medium">Link</span>
                </div>
              </div>
            </div>
          </section>

          {/* Example Cards */}
          <section>
            <h2 className="text-xl font-semibold text-shades-black mb-4">UI Components</h2>
            <div className="grid gap-4">
              {/* Primary Card */}
              <div className="p-6 rounded-lg bg-neutrals-02 border border-neutrals-03">
                <h3 className="text-lg font-semibold text-shades-black mb-2">Welcome to EventBridge</h3>
                <p className="text-neutrals-07 mb-4">
                  This is an example card using the custom color theme. The theme automatically switches between light and dark modes.
                </p>
                <button className="px-4 py-2 rounded-md bg-primary-01 text-shades-white hover:bg-primary-02 transition-colors">
                  Get Started
                </button>
              </div>

              {/* Info Card */}
              <div className="p-6 rounded-lg bg-neutrals-01 border border-neutrals-03">
                <h3 className="text-lg font-semibold text-shades-black mb-2">Theme Features</h3>
                <ul className="space-y-2 text-neutrals-08">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accents-discount"></span>
                    Automatic dark mode support
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accents-discount"></span>
                    System preference detection
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accents-discount"></span>
                    Manual theme switching
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accents-discount"></span>
                    Persistent theme selection
                  </li>
                </ul>
              </div>

              {/* Error Example */}
              <div className="p-6 rounded-lg bg-errors-bg border border-errors-main">
                <h3 className="text-lg font-semibold text-errors-main mb-2">Error State Example</h3>
                <p className="text-neutrals-08">
                  This demonstrates how error states look with the custom theme colors.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
