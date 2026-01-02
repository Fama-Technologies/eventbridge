'use client';

import Link from 'next/link';
import { Menu, Globe, Sun, Moon, MenuIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from '@/providers/theme-provider';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme: updateTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    updateTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="bg-shades-white px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="w-8 h-8 rounded-full flex items-center justify-center">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
          </span>
          <span className="text-primary-01">Event Bridge</span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
          <Link
            href="/find-vendors"
            className="text-shades-black transition-colors duration-200 hover:text-primary-01"
          >
            Find Vendors
          </Link>
          <Link
            href="/inspiration"
            className="text-shades-black transition-colors duration-200 hover:text-primary-01"
          >
            Inspiration
          </Link>
          {/* UPDATED: Become a Planner now goes to signup */}
          <Link
            href="/signup?type=customer"
            className="text-shades-black transition-colors duration-200 hover:text-primary-01"
          >
            Become a Planner
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Become a Vendor Button */}
          <Link
            href="/signup?type=vendor"
            className="hidden sm:block px-4 py-2 rounded font-semibold text-primary-01 transition-opacity duration-200 hover:opacity-90"
          >
            Become a Vendor
          </Link>

          {/* Language Icon */}
          <button
            className="w-10 h-10 rounded-full border border-neutrals-04 flex items-center justify-center text-shades-black transition-all duration-200 hover:text-primary-01 hover:border-primary-01"
            aria-label="Language"
          >
            <Globe size={20} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full border border-neutrals-04 flex items-center justify-center text-shades-black transition-all duration-300 hover:text-primary-01 hover:border-primary-01"
            aria-label="Toggle theme"
          >
            {mounted && (
              <div className="relative w-5 h-5">
                <Sun
                  size={20}
                  className={`absolute inset-0 transition-all duration-500 ${
                    resolvedTheme === 'dark'
                      ? 'rotate-0 scale-100 opacity-100'
                      : 'rotate-90 scale-0 opacity-0'
                  }`}
                />
                <Moon
                  size={20}
                  className={`absolute inset-0 transition-all duration-500 ${
                    resolvedTheme === 'light'
                      ? 'rotate-0 scale-100 opacity-100'
                      : '-rotate-90 scale-0 opacity-0'
                  }`}
                />
              </div>
            )}
          </button>
           {/* Language Icon */}
          <button
            className="w-10 h-10 rounded-full border border-neutrals-04 flex items-center justify-center text-shades-black transition-all duration-200 hover:text-primary-01 hover:border-primary-01"
            aria-label="Language"
          >
            <MenuIcon size={20} />
          </button>


          {/* Mobile Menu Button */}
          <button
            className="md:hidden w-10 h-10 rounded-full border border-neutrals-04 flex items-center justify-center text-shades-black transition-all duration-200 hover:text-primary-01 hover:border-primary-01"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>


      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4 border-t border-neutrals-04 pt-4">
          <Link
            href="/find-vendors"
            className="block py-2 text-shades-black transition-colors hover:text-primary-01"
          >
            Find Vendors
          </Link>
          <Link
            href="/inspiration"
            className="block py-2 text-shades-black transition-colors hover:text-primary-01"
          >
            Inspiration
          </Link>
          {/* UPDATED: Become a Planner now goes to signup */}
          <Link
            href="/signup?type=customer"
            className="block py-2 text-shades-black transition-colors hover:text-primary-01"
          >
            Become a Planner
          </Link>
          {/* Become a Vendor Button */}
          <Link
            href="/signup?type=vendor"
            className="block py-2 px-4 rounded font-semibold text-center bg-primary-01 text-shades-white transition-opacity hover:opacity-90"
          >
            Become a Vendor
          </Link>
        </nav>
      )}
    </header>
  );
}