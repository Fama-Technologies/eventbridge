'use client';

import Link from 'next/link';
import { Globe, Sun, Menu, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTheme } from '@/providers/theme-provider';
import { BurgerMenu } from '@/components/category'; // Assuming this component handles its own styling or accepts props
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setTheme: updateTheme, resolvedTheme } = useTheme();
  const { data: session } = useSession();
  const user = session?.user;

  const pathname = usePathname();
  const pathnameSafe = pathname ?? '';
  const isHome = pathnameSafe === '/';
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleTheme = () => {
    updateTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
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

  // Determine dashboard link based on role
  const getDashboardLink = () => {
    if (user?.accountType === 'VENDOR') return '/vendor';
    return '/customer/dashboard';
  };

  return (
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
          {/* Find Vendors links to /categories page */}
          <Link
            href="/categories"
            className={`${textColorClass} relative transition-colors duration-200 font-medium after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:origin-center after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 ${pathnameSafe.startsWith('/categories') || pathnameSafe.startsWith('/category') || pathnameSafe.startsWith('/customer/vendor') || pathnameSafe.startsWith('/customer/dashboard/find-vendors')
              ? 'after:scale-x-100'
              : 'after:scale-x-0'
              }`}
          >
            Find Vendors
          </Link>



        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* "Become a Vendor" - Hide for signed-in users */}



          {/* Create Account */}
          {mounted && !user && (
            <Link
              href="/signup"
              className="hidden sm:block px-4 py-2 rounded font-semibold transition-all duration-200 bg-primary-01 text-white hover:opacity-90 shadow-md shadow-primary-01/20"
            >
              Create Account
            </Link>
          )}

          {/* Login Button - Hide if logged in */}
          {mounted && !user && (
            <Link
              href="/login"
              className="hidden sm:block px-4 py-2 rounded font-semibold border transition-all duration-200 text-primary-01 border-primary-01 hover:opacity-90 hover:bg-primary-01 hover:text-shades-white"
            >
              Login
            </Link>
          )}

          {/* User Avatar & Dropdown */}
          {mounted && user && (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-10 h-10 rounded-full bg-neutrals-02 border border-neutrals-03 flex items-center justify-center overflow-hidden focus:outline-none transition-transform active:scale-95"
              >
                {user.image ? (
                  <Image src={user.image} alt={user.name || 'User'} width={40} height={40} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-primary-01 text-white flex items-center justify-center font-bold">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutrals-02 py-2 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                  <div className="px-4 py-3 border-b border-neutrals-02">
                    <p className="text-sm font-semibold text-shades-black truncate">{user.name}</p>
                    <p className="text-xs text-neutrals-06 truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href={getDashboardLink()}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-shades-black hover:bg-neutrals-01 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                    <Link
                      href="/settings" // Assuming a general settings page or specific depending on role
                      className="flex items-center gap-3 px-4 py-2 text-sm text-shades-black hover:bg-neutrals-01 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                  </div>

                  <div className="border-t border-neutrals-02 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

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
            <BurgerMenu variant="light" />
          </div>

          {/* Mobile Menu Button - Show only if not logged in possibly? Or distinct mobile menu logic */}
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
          {/* Find Vendors links to /categories page */}
          <Link
            href="/categories"
            className="block py-2 text-shades-black transition-colors hover:text-primary-01"
          >
            Find Vendors
          </Link>


          {/* Become a Planner */}
          {mounted && !user && (
            <Link
              href="/signup?type=customer"
              className="block py-2 text-shades-black transition-colors hover:text-primary-01"
            >
              Become a Planner
            </Link>
          )}

          {/* Become a Vendor Button */}



          {/* Create Account Mobile */}
          {mounted && !user && (
            <Link
              href="/signup"
              className="block w-full py-2 px-4 rounded font-semibold text-center bg-primary-01 text-shades-white transition-opacity hover:opacity-90"
              onClick={() => setMobileMenuOpen(false)}
            >
              Create Account
            </Link>
          )}

          {/* Login Button (Mobile) */}
          {mounted && !user && (
            <Link
              href="/login"
              className="block py-2 px-4 rounded-lg font-semibold text-center border border-primary-01 text-primary-01 transition-opacity hover:opacity-90"
            >
              Login
            </Link>
          )}

          {/* Mobile Authenticated Links */}
          {mounted && user && (
            <>
              <Link
                href={getDashboardLink()}
                className="block py-2 text-shades-black transition-colors hover:text-primary-01"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2 text-red-600 transition-colors hover:text-red-700"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      )}

    </header>
  );
}