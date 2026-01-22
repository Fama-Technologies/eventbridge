'use client';

import Link from 'next/link';
import { Globe, Sun, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from '@/providers/theme-provider';
import { BurgerMenu } from '@/components/category'; // Assuming this component handles its own styling or accepts props

import { usePathname } from 'next/navigation';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setTheme: updateTheme, resolvedTheme } = useTheme();

  const pathname = usePathname();
  const isHome = pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    updateTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  // Determine header styles based on scroll and page
  const headerBgClass = isHome && !isScrolled
    ? 'bg-transparent border-transparent'
    : 'bg-shades-white shadow-lg border-neutrals-03';

  const headerPositionClass = isHome ? 'fixed' : 'sticky';

  const textColorClass = isHome && !isScrolled
    ? 'text-white hover:text-white/80'
    : 'text-shades-black hover:text-primary-01';

  const logoTextClass = isHome && !isScrolled
    ? 'text-white'
    : 'text-primary-01';

  const logoBgClass = isHome && !isScrolled
    ? 'bg-white/10 backdrop-blur-sm'
    : 'bg-primary-01/10';


  return (
    // CHANGED: Fixed -> Sticky, setting  dynamic bg-transparent, always white/shadow
    <header className={`${headerPositionClass} top-0 left-0 right-0 z-50 px-6 py-4 border-b transition-all duration-300 ${headerBgClass}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${logoBgClass}`}>
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
          </span>
          <span className={`transition-colors duration-300 ${logoTextClass}`}>Event Bridge</span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
          <Link
            href="/find-vendors"
            className={`${textColorClass} relative transition-colors duration-200 font-medium after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:origin-center after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100`}
          >
            Find Vendors
          </Link>
          <Link
            href="/inspiration"
            className={`${textColorClass} relative transition-colors duration-200 font-medium after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:origin-center after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100`}
          >
            Inspiration
          </Link>
          {/* UPDATED: Become a Planner now goes to signup */}
          <Link
            href="/signup?type=customer"
            className={`${textColorClass} relative transition-colors duration-200 font-medium after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:origin-center after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100`}
          >
            Become a Planner
          </Link>

        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Become a Vendor Button */}
          <Link
            href="/signup?type=vendor"
            // CHANGED: Always primary text
            className="hidden sm:block px-4 py-2 rounded font-semibold transition-all duration-200 text-primary-01 hover:opacity-90"
          >
            Become a Vendor
          </Link>
          {/* Login Button (Right Section, visible on desktop) */}
          <Link
            href="/login"
            // CHANGED: Always primary border/text
            className="hidden sm:block px-4 py-2 rounded font-semibold border transition-all duration-200 text-primary-01 border-primary-01 hover:opacity-90 hover:bg-primary-01 hover:text-shades-white "
          >
            Login
          </Link>

          {/* Language Icon */}
          <button
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 border-neutrals-04 ${textColorClass} hover:border-primary-01`}
            aria-label="Language"
          >
            <Globe size={20} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 border-neutrals-04 ${textColorClass} hover:border-primary-01`}
            aria-label="Toggle theme"
          >
            {mounted && (
              <div className="relative w-5 h-5">
                <Sun
                  size={20}
                  className={`absolute inset-0 transition-all duration-500 ${resolvedTheme === 'dark'
                    ? 'rotate-0 scale-100 opacity-100'
                    : 'rotate-90 scale-0 opacity-0'
                    }`}
                />
                <Image src="/icons/moon.svg"
                  alt="Moon"
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

          {/* Burger Menu with Dropdown */}
          <div className="relative">
            {/* CHANGED: Always light variant (which usually means dark icons in this context, assuming 'light' means 'use light mode styles') */}
            {/* Checking existing usage: isHome && !isScrolled ? 'dark' : 'light' -> 'dark' meant white text for dark bg? */}
            {/* If 'light' variant was used for scrolled state (white bg), we use 'light' everywhere. */}
            <BurgerMenu variant="light" />
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 border-neutrals-04 ${textColorClass} hover:border-primary-01`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Mobile Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>


      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4 border-t border-neutrals-04 pt-4 bg-white rounded-b-lg absolute left-0 right-0 px-6 shadow-xl top-full">
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
          {/* Login Button (Mobile) */}
          <Link
            href="/login"
            className="block py-2 px-4 rounded-lg font-semibold text-center border border-primary-01 text-primary-01 transition-opacity hover:opacity-90"
          >
            Login
          </Link>
        </nav>
      )}
    </header>
  );
}