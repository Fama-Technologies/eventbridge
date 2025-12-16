'use client';

import Link from 'next/link';
import { useTheme } from '@/app/providers/theme-provider';
import { Menu, Globe } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

export default function Header() {
  const { theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const bgColor = theme === 'dark' ? 'bg-neutral-800' : 'bg-neutral-900';
  const textColor = theme === 'dark' ? 'text-white' : 'text-white';
  const hoverColor = theme === 'dark' ? 'hover:text-primary-01' : 'hover:text-primary-01';

  return (
    <header
      className={`${bgColor} ${textColor} px-6 py-4 shadow-lg`}
      style={{
        backgroundColor: theme === 'dark' ? 'var(--colors-neutrals-02)' : '#1a1a1a',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center"
            
          >
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
          </span>
          <span style={{ color: 'var(--shades-white)' }}>Event Bridge</span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
          <Link
            href="/find-vendors"
            className="transition-colors duration-200"
            style={{
              color: 'var(--shades-white)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--primary-01)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--shades-white)';
            }}
          >
            Find Vendors
          </Link>
          <Link
            href="/inspiration"
            className="transition-colors duration-200"
            style={{
              color: 'var(--shades-white)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--primary-01)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--shades-white)';
            }}
          >
            Inspiration
          </Link>
          <Link
            href="/become-planner"
            className="transition-colors duration-200"
            style={{
              color: 'var(--shades-white)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--primary-01)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--shades-white)';
            }}
          >
            Become a Planner
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Become a Vendor Button */}
          <Link
            href="/become-vendor"
            className="hidden sm:block px-4 py-2 rounded font-semibold transition-opacity duration-200 hover:opacity-90"
            style={{
              backgroundColor: 'var(--primary-01)',
              color: 'var(--shades-white)',
            }}
          >
            Become a Vendor
          </Link>

          {/* Icons */}
          <button
            className="p-2 rounded transition-colors duration-200"
            style={{
              color: 'var(--shades-white)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--primary-01)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--shades-white)';
            }}
            aria-label="Language"
          >
            <Globe size={20} />
          </button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded transition-colors duration-200"
            style={{
              color: 'var(--shades-white)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--primary-01)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--shades-white)';
            }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav
          className="md:hidden mt-4 pb-4 flex flex-col gap-4"
          style={{
            borderTop: '1px solid var(--neutrals-04)',
            paddingTop: '1rem',
          }}
        >
          <Link
            href="/find-vendors"
            style={{ color: 'var(--shades-white)' }}
            className="block py-2 transition-colors hover:text-primary-01"
          >
            Find Vendors
          </Link>
          <Link
            href="/inspiration"
            style={{ color: 'var(--shades-white)' }}
            className="block py-2 transition-colors hover:text-primary-01"
          >
            Inspiration
          </Link>
          <Link
            href="/become-planner"
            style={{ color: 'var(--shades-white)' }}
            className="block py-2 transition-colors hover:text-primary-01"
          >
            Become a Planner
          </Link>
          <Link
            href="/become-vendor"
            className="block py-2 px-4 rounded font-semibold text-center transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--primary-01)',
              color: 'var(--shades-white)',
            }}
          >
            Become a Vendor
          </Link>
        </nav>
      )}
    </header>
  );
}
