'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  };
  return (
    <footer className="bg-shades-white text-shades-black">
      {/* CTA Section */}
      {/* background: linear-gradient(90deg, #222222 36.07%, #CB5E21 71.72%); */}

      <div className="max-w-7xl mx-auto px-6 pt-12 ">
        <div className="relative overflow-hidden rounded-2xl mb-16 flex flex-col md:flex-row bg-linear-to-r from-[#ffffff] from-40% via-[#CB5E21] via-80% to-[#CB5E21]">
          {/* Left side - Gradient background with text */}
          <div className="flex-1 p-8 md:p-10  border-[#FF704333] border-2">
            <h3 className="text-2xl md:text-3xl font-bold text-black mb-3">
              Planning an Event
            </h3>
            <p className="text-[#222222] text-sm leading-relaxed max-w-md">
              Connect with trusted service providers seamlessly to make your vision a
              reality. From intimate gatherings to grand celebrations
            </p>
          </div>

          {/* Right side - Animated gradient button area */}
          <div className="bg-[#CB5E21] md:rounded-l-[40px] flex justify-center items-center w-full md:w-auto py-6 md:py-0" style={{ boxShadow: '0px 4px 6px -4px var(--primary-01), 0px 10px 15px -3px var(--primary-01)' }}>
            <Link
              href="/get-started"
              className="group relative flex items-center justify-center px-12 md:px-20 min-w-[200px] md:min-w-[280px] overflow-hidden"
            >
              {/* Animated gradient background */}

              <span className="relative flex items-center gap-6 text-white font-semibold text-lg whitespace-nowrap">
                Get Started
                <span
                  className="text-2xl transition-transform group-hover:translate-x-1"
                  style={{
                    animation: 'pointRight 1.5s ease-in-out infinite',
                  }}
                >
                  →
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pointRight {
          0%, 100% {
            transform: scale(1) translateX(0);
          }
          50% {
            transform: scale(1.3) translateX(8px);
          }
        }
      `}</style>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12 pb-16">
          {/* For Customers */}
          <div>
            <h4 className="text-neutrals-07 text-xs font-medium uppercase tracking-wider mb-6">
              For Customers
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/find-vendors" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Find vendors
                </Link>
              </li>
              <li>
                <Link href="/budget-tools" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Budget tools
                </Link>
              </li>
              <li>
                <Link href="/my-events" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  My Events
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Success Sories
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h4 className="text-neutrals-07 text-xs font-medium uppercase tracking-wider mb-6">
              For Providers
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/list-business" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  List your business
                </Link>
              </li>
              <li>
                <Link href="/provider-dashboard" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Provider Dashboard
                </Link>
              </li>
              <li>
                <Link href="/bookings-earnings" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Bookings & Earnings
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-neutrals-07 text-xs font-medium uppercase tracking-wider mb-6">
              Categories
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/category/decor-styling" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Decor & Styling
                </Link>
              </li>
              <li>
                <Link href="/category/catering" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Premium Catering
                </Link>
              </li>
              <li>
                <Link href="/category/djs" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Professional Djs
                </Link>
              </li>
              <li>
                <Link href="/category/photography" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Protography
                </Link>
              </li>
              <li>
                <Link href="/category/venues" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Venues
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-neutrals-07 text-xs font-medium uppercase tracking-wider mb-6">
              Info
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  About Event Bridge
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Help Center/ FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Logo Section */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-end">
            <div className="mb-4">
              <Image
                src="/logo.svg"
                alt="Event Bridge Logo"
                width={120}
                height={120}
                className="w-24 h-24 md:w-28 md:h-28"
              />
            </div>
            <h3 className="text-lg font-bold text-primary-01 mb-6">EVENT BRIDGE</h3>
            <div className="w-12 h-[2px] bg-neutrals-07 mb-6" />
            <div className="text-right text-sm text-neutrals-07">
              <p className="mb-1">0394549735</p>
              <p>support@eventbridge.africa</p>
            </div>
          </div>
        </div>

        {/* Social Links Row */}
        <div className="border-t border-neutrals-07/30 py-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            {/* Instagram - Left */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutrals-07">@eventbridgeafrica</span>
              <Link href="https://instagram.com/eventbridgeafrica" target="_blank" className="text-primary-01 hover:opacity-80 transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </Link>
            </div>

            {/* Whatsapp - Middle */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutrals-07">Whatsapp</span>
              <Link href="#" className="text-primary-01 hover:opacity-80 transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </Link>
            </div>

            {/* TikTok - Right */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutrals-07">@eventbridgeafrica</span>
              <Link href="https://tiktok.com/@eventbridgeafrica" target="_blank" className="text-primary-01 hover:opacity-80 transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.03 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright Row */}
        <div className="border-t border-neutrals-07/30 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-neutrals-07">
              © 2025 Event Bridge. All rights reserved.
            </p>
            {/* Dark Mode Toggle */}
            <div className="flex items-center gap-3">
              {/*lets this will have a toggle button for sun and moon*/}
              <Image src="/icons/moon.svg" alt="sun" width={24} height={24} />
              <span className="text-sm text-neutrals-07">Dark mode</span>

              {/* Animated Toggle Button */}
              <button
                onClick={toggleDarkMode}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-01 focus:ring-offset-2 ${isDarkMode ? 'bg-primary-01' : 'bg-gray-300'
                  }`}
                aria-label="Toggle dark mode"
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${isDarkMode ? 'transform translate-x-6' : 'transform translate-x-0'
                    }`}
                >
                  {/* Icon inside the toggle circle */}
                  <div className="w-full h-full flex items-center justify-center">
                    {isDarkMode ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2a10 10 0 1 0 10 10c0-5.523-4.477-10-10-10z" fill="#FF7043" />
                        <path d="M12 22a10 10 0 0 1 0-20c-2.5 2-4 5.5-4 10s1.5 8 4 10z" fill="#7C3F1C" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="5" fill="#FFA726" />
                        <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6m-17.78 7.78l4.24-4.24m5.08-5.08l4.24-4.24" stroke="#FFA726" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
