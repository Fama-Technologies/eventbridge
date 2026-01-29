"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Search } from "lucide-react";
import { useTheme } from '@/providers/theme-provider';
import { usePathname } from 'next/navigation';

const TABS = [
  { name: "Find Vendors", href: "/customer/dashboard/find-vendors" },
  { name: "Templates", href: "/customer/dashboard/templates" },
  { name: "My Events", href: "/customer/dashboard/my-events" },
];

export default function CustomerHeader() {
  const [mounted, setMounted] = useState(false);
  const { setTheme: updateTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    updateTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const textColorClass = 'text-shades-black hover:text-primary-01';

  return (
    <div className="bg-shades-white shadow-sm sticky top-0 z-30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        {/* Top Row: Logo - Theme Toggle */}
        <div className="flex items-center justify-between mb-4">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <span className="flex items-center gap-2 font-bold text-xl text-shades-black">
              <Image
                src="/logo.svg"
                alt="EventBridge Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span>Event Bridge</span>
            </span>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 border-neutrals-04 ${textColorClass} hover:border-primary-01 flex-shrink-0 bg-neutrals-01/50`}
            aria-label="Toggle theme"
          >
            {mounted && (
              <div className="relative w-5 h-5">
                <Image
                  src="/icons/moon.svg" // Assuming dark mode icon
                  alt="Dark Mode"
                  width={20}
                  height={20}
                  className={`absolute inset-0 transition-all duration-500 ${resolvedTheme === 'dark'
                    ? 'rotate-0 scale-100 opacity-100'
                    : 'rotate-90 scale-0 opacity-0'
                    }`}
                />
                <Image
                  src="/icons/moon_black.svg" // Assuming light mode icon
                  alt="Light Mode"
                  width={20}
                  height={20}
                  className={`absolute inset-0 transition-all duration-500 ${resolvedTheme === 'light'
                    ? 'rotate-0 scale-100 opacity-100'
                    : '-rotate-90 scale-0 opacity-0'
                    }`}
                />
              </div>
            )}
          </button>
        </div>

        {/* Middle Row: Centered Search Bar */}
        <div className="flex justify-center mb-4">
          <div className="relative w-full max-w-lg">
            <div className="flex items-center bg-shades-white border border-neutrals-03 rounded-full shadow-lg p-1.5 pl-5 transition-all focus-within:ring-2 focus-within:ring-primary-01/20 focus-within:border-primary-01">
              <input
                type="text"
                placeholder="Start your search"
                className="flex-1 bg-transparent border-none outline-none text-shades-black placeholder:text-neutrals-06 text-sm sm:text-base font-medium"
              />
              <button
                className="bg-primary-01 hover:bg-primary-02 text-shades-white p-2.5 sm:p-3 rounded-full transition-colors flex items-center justify-center"
                aria-label="Search"
              >
                <Search size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row: Navigation Links */}
        <div className="flex items-center justify-center gap-8 mt-4">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                href={tab.href}
                key={tab.name}
                className={cn(
                  "pb-2 text-sm font-semibold transition-all relative border-b-2",
                  isActive
                    ? "text-primary-01 border-primary-01"
                    : "text-neutrals-06 border-transparent hover:text-neutrals-07 hover:border-neutrals-03",
                )}
              >
                {tab.name}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  );
}

