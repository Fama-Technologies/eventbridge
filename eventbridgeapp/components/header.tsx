'use client';

import Link from 'next/link';
import { Menu, Globe } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-neutrals-01 px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="w-8 h-8 rounded-full flex items-center justify-center">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
          </span>
          <span className="text-shades-black">Event Bridge</span>
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
          <Link
            href="/become-planner"
            className="text-shades-black transition-colors duration-200 hover:text-primary-01"
          >
            Become a Planner
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Become a Vendor Button */}
          <Link
            href="/become-vendor"
            className="hidden sm:block px-4 py-2 rounded font-semibold text-primary-01 transition-opacity duration-200 hover:opacity-90"
          >
            Become a Vendor
          </Link>

          {/* Icons */}
          <button
            className="p-2 rounded text-shades-black transition-colors duration-200 hover:text-primary-01"
            aria-label="Language"
          >
            <Globe size={20} />
          </button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded text-shades-black transition-colors duration-200 hover:text-primary-01"
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
          <Link
            href="/become-planner"
            className="block py-2 text-shades-black transition-colors hover:text-primary-01"
          >
            Become a Planner
          </Link>
          <Link
            href="/become-vendor"
            className="block py-2 px-4 rounded font-semibold text-center bg-primary-01 text-shades-white transition-opacity hover:opacity-90"
          >
            Become a Vendor
          </Link>
        </nav>
      )}
    </header>
  );
}
