'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, Calendar, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/providers/theme-provider';
import { useRouter } from 'next/navigation';
import BurgerMenu from './BurgerMenu';

export default function CategoryHeader() {
  const router = useRouter();
  const [service, setService] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (service) params.set('service', service);
    if (location) params.set('location', location);
    if (date) params.set('date', date);
    router.push(`/search?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-shades-white px-6 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/logo.svg" alt="Event Bridge" width={28} height={28} />
          <span className="text-primary-01 font-bold text-lg hidden sm:block">Event Bridge</span>
        </Link>

        {/* Search Bar - Theme Aware */}
        <div className="flex-1 max-w-xl">
          <div className={`rounded-full flex items-center border transition-colors ${
            isDark 
              ? 'bg-white/10 border-white/20' 
              : 'bg-neutrals-01 border-neutrals-03'
          }`}>
            {/* Service */}
            <div className={`flex items-center gap-2 px-4 py-2 flex-1 border-r ${
              isDark ? 'border-white/20' : 'border-neutrals-03'
            }`}>
              <Search size={16} className={isDark ? 'text-white/60' : 'text-neutrals-06'} />
              <input
                type="text"
                placeholder="Service"
                value={service}
                onChange={(e) => setService(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`bg-transparent text-sm focus:outline-none w-full ${
                  isDark 
                    ? 'text-white placeholder:text-white/50' 
                    : 'text-foreground placeholder:text-neutrals-06'
                }`}
              />
            </div>

            {/* Location */}
            <div className={`flex items-center gap-2 px-4 py-2 flex-1 border-r ${
              isDark ? 'border-white/20' : 'border-neutrals-03'
            }`}>
              <MapPin size={16} className={isDark ? 'text-white/60' : 'text-neutrals-06'} />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`bg-transparent text-sm focus:outline-none w-full ${
                  isDark 
                    ? 'text-white placeholder:text-white/50' 
                    : 'text-foreground placeholder:text-neutrals-06'
                }`}
              />
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 px-4 py-2 flex-1">
              <Calendar size={16} className={isDark ? 'text-white/60' : 'text-neutrals-06'} />
              <input
                type="text"
                placeholder="Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`bg-transparent text-sm focus:outline-none w-full ${
                  isDark 
                    ? 'text-white placeholder:text-white/50' 
                    : 'text-foreground placeholder:text-neutrals-06'
                }`}
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="bg-primary-01 hover:bg-primary-02 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors shrink-0 m-1"
              aria-label="Search"
            >
              <Search size={16} />
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 shrink-0 relative">
          <Link
            href="/signup?type=vendor"
            className="text-primary-01 font-medium text-sm hover:text-primary-02 transition-colors hidden md:block"
          >
            Become a Vendor
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
              isDark 
                ? 'border-white/20 text-white/70 hover:text-white hover:border-white/40' 
                : 'border-neutrals-04 text-neutrals-07 hover:text-primary-01 hover:border-primary-01'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Burger Menu */}
          <BurgerMenu variant={isDark ? 'dark' : 'light'} />
        </div>
      </div>
    </header>
  );
}
