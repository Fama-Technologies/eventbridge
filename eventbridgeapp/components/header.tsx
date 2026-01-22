'use client';

import Link from 'next/link';
import { Globe, Sun, Menu, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from '@/providers/theme-provider';
import { BurgerMenu } from '@/components/category';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setTheme: updateTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    updateTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const getDashboardLink = () => {
    const type = session?.user?.accountType;
    if (type === 'VENDOR') return '/vendor/dashboard';
    if (type === 'ADMIN') return '/admin/dashboard';
    return '/customer/dashboard';
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 px-6 py-4 bg-shades-white shadow-sm border-b border-neutrals-03 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="w-8 h-8 rounded-full flex items-center justify-center bg-primary-01/10">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
          </span>
          <span className="text-primary-01 transition-colors duration-300">Event Bridge</span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
          <Link
            href="/find-vendors"
            className="text-shades-black hover:text-primary-01 transition-colors duration-200 font-medium"
          >
            Find Vendors
          </Link>
          <Link
            href="/inspiration"
            className="text-shades-black hover:text-primary-01 transition-colors duration-200 font-medium"
          >
            Inspiration
          </Link>
          <Link
            href="/signup?type=customer"
            className="text-shades-black hover:text-primary-01 transition-colors duration-200 font-medium"
          >
            Become a Planner
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">

          {/* Language Icon */}
          <button
            className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 border-neutrals-04 text-shades-black hover:text-primary-01 hover:border-primary-01"
            aria-label="Language"
          >
            <Globe size={20} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 border-neutrals-04 text-shades-black hover:text-primary-01 hover:border-primary-01"
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
            <BurgerMenu variant="light" />
          </div>

          {/* Auth Buttons / Profile - Desktop (Moved to End) */}
          {status === 'loading' ? (
            <div className="hidden sm:block w-24 h-10 bg-neutrals-02 rounded animate-pulse" />
          ) : status === 'authenticated' ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full transition-opacity hover:opacity-80"
              >
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-01 text-white flex items-center justify-center text-sm font-bold">
                    {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                {/* ChevronDown removed */}
              </button>

              {/* Profile Dropdown */}
              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileMenuOpen(false)} />
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutrals-03 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-neutrals-03 mb-1">
                      <p className="font-bold text-shades-black truncate">{session?.user?.name || 'User'}</p>
                      <p className="text-xs text-neutrals-06 truncate">{session?.user?.email}</p>
                    </div>

                    <Link
                      href={getDashboardLink()}
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-shades-black hover:bg-neutrals-01 transition-colors"
                    >
                      <LayoutDashboard size={16} className="text-primary-01" />
                      Dashboard
                    </Link>

                    <div className="border-t border-neutrals-03 my-1" />

                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#FF5630] hover:bg-[#FF5630]/10 transition-colors text-left"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/signup?type=vendor"
                className="hidden sm:block px-4 py-2 rounded font-semibold transition-all duration-200 text-primary-01 hover:opacity-90"
              >
                Become a Vendor
              </Link>
              <Link
                href="/login"
                className="hidden sm:block px-4 py-2 rounded font-semibold border transition-all duration-200 text-primary-01 border-primary-01 hover:opacity-90"
              >
                Login
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 border-neutrals-04 text-shades-black hover:text-primary-01 hover:border-primary-01"
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
          <Link
            href="/signup?type=customer"
            className="block py-2 text-shades-black transition-colors hover:text-primary-01"
          >
            Become a Planner
          </Link>

          <div className="border-t border-neutrals-03 my-1" />

          {status === 'authenticated' ? (
            <>
              <div className="flex items-center gap-3 py-2">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={40}
                    height={40}
                    className="rounded-full object-cover border border-neutrals-03"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-01 text-white flex items-center justify-center text-lg font-bold">
                    {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <p className="font-bold text-shades-black">{session?.user?.name}</p>
                  <p className="text-xs text-neutrals-06">{session?.user?.accountType || 'User'}</p>
                </div>
              </div>

              <Link
                href={getDashboardLink()}
                className="flex items-center gap-2 py-2 text-shades-black font-semibold hover:text-primary-01"
              >
                <LayoutDashboard size={18} />
                Go to Dashboard
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 py-2 text-[#FF5630] font-semibold w-full text-left"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signup?type=vendor"
                className="block py-2 px-4 rounded font-semibold text-center bg-primary-01 text-shades-white transition-opacity hover:opacity-90"
              >
                Become a Vendor
              </Link>
              <Link
                href="/login"
                className="block py-2 px-4 rounded-lg font-semibold text-center border border-primary-01 text-primary-01 transition-opacity hover:opacity-90"
              >
                Login
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}