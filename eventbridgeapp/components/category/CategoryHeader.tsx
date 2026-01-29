'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, Calendar, Moon, Sun, PartyPopper, SlidersHorizontal, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/providers/theme-provider';
import { useRouter } from 'next/navigation';
import BurgerMenu from './BurgerMenu';
import { format } from 'date-fns';

// Service suggestions
const SERVICE_SUGGESTIONS = [
  { name: 'Wedding', services: 'Photography, Catering, Venue and more' },
  { name: 'Birthday', services: 'Cake, Entertainment, Venue and more' },
  { name: 'Corporate', services: 'Venue, Catering, AV Equipment and more' },
  { name: 'Anniversary', services: 'Venue, Catering, Photography and more' },
  { name: 'Graduation', services: 'Photography, Catering, Venue and more' },
];

// Location suggestions
const LOCATION_SUGGESTIONS = [
  { city: 'Kampala', country: 'Uganda' },
  { city: 'Nairobi', country: 'Kenya' },
  { city: 'Kigali', country: 'Rwanda' },
  { city: 'Dar es Salaam', country: 'Tanzania' },
  { city: 'Entebbe', country: 'Uganda' },
];

export default function CategoryHeader() {
  const router = useRouter();
  const [service, setService] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { resolvedTheme, setTheme } = useTheme();

  // Dropdown visibility
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Mobile search state
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Refs
  const serviceRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  const isDark = resolvedTheme === 'dark';

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (serviceRef.current && !serviceRef.current.contains(event.target as Node)) {
        setShowServiceDropdown(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleServiceSelect = (serviceName: string) => {
    setService(serviceName);
    setShowServiceDropdown(false);
  };

  const handleLocationSelect = (city: string, country: string) => {
    setLocation(`${city}, ${country}`);
    setShowLocationDropdown(false);
  };

  const handleDateSelect = (selectedDate: Date) => {
    setSelectedDate(selectedDate);
    setDate(format(selectedDate, 'MMM dd, yyyy'));
    setShowDatePicker(false);
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

  // Filter suggestions
  const filteredServices = service
    ? SERVICE_SUGGESTIONS.filter(s => s.name.toLowerCase().includes(service.toLowerCase()))
    : SERVICE_SUGGESTIONS;

  const filteredLocations = location
    ? LOCATION_SUGGESTIONS.filter(l =>
      l.city.toLowerCase().includes(location.toLowerCase()) ||
      l.country.toLowerCase().includes(location.toLowerCase())
    )
    : LOCATION_SUGGESTIONS;

  return (
    <header className="sticky top-0 z-40 bg-shades-white px-6 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/logo.svg" alt="Event Bridge" width={28} height={28} />
          <span className="text-primary-01 font-bold text-lg hidden sm:block">Event Bridge</span>
        </Link>

        {/* Search Bar - Theme Aware */}
        {/* Search Bar - Theme Aware */}
        <div className="flex-1 max-w-xl relative">

          {/* Mobile Search Pill */}
          <div
            className={`md:hidden rounded-full flex items-center shadow-md border px-1 py-1 transition-all cursor-pointer ${isDark ? 'bg-white/10 border-white/20' : 'bg-neutrals-01 border-neutrals-03'
              } ${showMobileSearch ? 'hidden' : 'flex'}`}
            onClick={() => setShowMobileSearch(true)}
          >
            <div className={`pl-3 pr-2 border-r ${isDark ? 'border-white/20' : 'border-neutrals-03'}`}>
              <SlidersHorizontal size={16} className="text-primary-01" />
            </div>
            <span className={`flex-1 text-sm font-medium px-3 truncate ${isDark ? 'text-white' : 'text-shades-black'}`}>
              Start your search
            </span>
            <div className="bg-primary-01 text-white p-2 rounded-full">
              <Search size={14} />
            </div>
          </div>

          <div className={`${showMobileSearch ? 'fixed inset-x-0 top-0 bg-white z-50 p-6 flex flex-col h-auto rounded-b-3xl shadow-xl' : 'hidden md:flex items-center border rounded-full'} transition-all ${!showMobileSearch && (isDark ? 'bg-white/10 border-white/20' : 'bg-neutrals-01 border-neutrals-03')}`}>

            {/* Close Button for Mobile */}
            {showMobileSearch && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMobileSearch(false);
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-neutrals-02 text-shades-black z-50 hover:bg-neutrals-03 transition-colors"
              >
                <X size={20} />
              </button>
            )}

            {/* Service (What) */}
            <div ref={serviceRef} className={`${showMobileSearch ? 'w-full mb-6 relative' : 'flex-1 relative flex items-center gap-2 px-4 py-2 border-r'} ${!showMobileSearch && (isDark ? 'border-white/20' : 'border-neutrals-03')}`}>
              {showMobileSearch ? (
                <>
                  <label className="block text-sm font-bold text-shades-black mb-1 ml-1">What</label>
                  <div className="flex items-center border-b border-neutrals-03 pb-2">
                    <Search size={20} className="text-neutrals-05 mr-3" />
                    <input
                      type="text"
                      placeholder="Wedding, Birthday..."
                      value={service}
                      onChange={(e) => {
                        setService(e.target.value);
                        setShowServiceDropdown(true);
                        // We don't hide others in this design, we keep it open
                      }}
                      onFocus={() => setShowServiceDropdown(true)}
                      onKeyPress={handleKeyPress}
                      className="bg-transparent text-base focus:outline-none w-full text-shades-black placeholder:text-neutrals-05"
                    />
                  </div>
                </>
              ) : (
                <>
                  <Search size={16} className={isDark ? 'text-white/60' : 'text-neutrals-06'} />
                  <input
                    type="text"
                    placeholder="Service"
                    value={service}
                    onChange={(e) => {
                      setService(e.target.value);
                      setShowServiceDropdown(true);
                    }}
                    onFocus={() => setShowServiceDropdown(true)}
                    onKeyPress={handleKeyPress}
                    className={`bg-transparent text-sm focus:outline-none w-full ${isDark
                        ? 'text-white placeholder:text-white/50'
                        : 'text-foreground placeholder:text-neutrals-06'
                      }`}
                  />
                </>
              )}

              {/* Service Dropdown */}
              {showServiceDropdown && filteredServices.length > 0 && (
                <div className={`absolute top-full left-0 mt-2 w-full z-50 rounded-xl shadow-lg border max-h-60 overflow-y-auto ${isDark
                    ? 'bg-[#1E1E1E] border-white/10'
                    : 'bg-white border-neutrals-03'
                  }`}>
                  {filteredServices.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleServiceSelect(item.name)}
                      className={`w-full flex items-center gap-3 text-left p-3 transition-colors ${isDark
                          ? 'hover:bg-white/5 text-white'
                          : 'hover:bg-neutrals-01 text-shades-black'
                        }`}
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs opacity-60 ml-auto">{item.services}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Location (Where) */}
            <div ref={locationRef} className={`${showMobileSearch ? 'w-full mb-6 relative' : 'flex-1 relative flex items-center gap-2 px-4 py-2 border-r'} ${!showMobileSearch && (isDark ? 'border-white/20' : 'border-neutrals-03')}`}>
              {showMobileSearch ? (
                <>
                  <label className="block text-sm font-bold text-shades-black mb-1 ml-1">Where</label>
                  <div className="flex items-center border-b border-neutrals-03 pb-2">
                    <MapPin size={20} className="text-neutrals-05 mr-3" />
                    <input
                      type="text"
                      placeholder="City or Zip code"
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        setShowLocationDropdown(true);
                      }}
                      onFocus={() => setShowLocationDropdown(true)}
                      onKeyPress={handleKeyPress}
                      className="bg-transparent text-base focus:outline-none w-full text-shades-black placeholder:text-neutrals-05"
                    />
                  </div>
                </>
              ) : (
                <>
                  <MapPin size={16} className={isDark ? 'text-white/60' : 'text-neutrals-06'} />
                  <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setShowLocationDropdown(true);
                    }}
                    onFocus={() => setShowLocationDropdown(true)}
                    onKeyPress={handleKeyPress}
                    className={`bg-transparent text-sm focus:outline-none w-full ${isDark
                        ? 'text-white placeholder:text-white/50'
                        : 'text-foreground placeholder:text-neutrals-06'
                      }`}
                  />
                </>
              )}

              {/* Location Dropdown */}
              {showLocationDropdown && filteredLocations.length > 0 && (
                <div className={`absolute top-full left-0 mt-2 w-full z-50 rounded-xl shadow-lg border max-h-60 overflow-y-auto ${isDark
                    ? 'bg-[#1E1E1E] border-white/10'
                    : 'bg-white border-neutrals-03'
                  }`}>
                  {filteredLocations.map((loc, index) => (
                    <button
                      key={index}
                      onClick={() => handleLocationSelect(loc.city, loc.country)}
                      className={`w-full flex items-center gap-3 text-left p-3 transition-colors ${isDark
                          ? 'hover:bg-white/5 text-white'
                          : 'hover:bg-neutrals-01 text-shades-black'
                        }`}
                    >
                      <span className="font-medium">{loc.city}, {loc.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date (When) */}
            <div ref={dateRef} className={`${showMobileSearch ? 'w-full mb-8 relative' : 'flex-1 relative flex items-center gap-2 px-4 py-2'}`}>
              {showMobileSearch ? (
                <>
                  <label className="block text-sm font-bold text-shades-black mb-1 ml-1">When</label>
                  <div className="flex items-center border-b border-neutrals-03 pb-2" onClick={() => setShowDatePicker(!showDatePicker)}>
                    <Calendar size={20} className="text-neutrals-05 mr-3" />
                    <input
                      type="text"
                      placeholder="Add dates"
                      value={date}
                      readOnly
                      className="bg-transparent text-base focus:outline-none w-full text-shades-black placeholder:text-neutrals-05"
                    />
                  </div>
                </>
              ) : (
                <>
                  <Calendar size={16} className={isDark ? 'text-white/60' : 'text-neutrals-06'} />
                  <input
                    type="text"
                    placeholder="Date"
                    value={date}
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    onKeyPress={handleKeyPress}
                    readOnly
                    className={`bg-transparent text-sm focus:outline-none w-full cursor-pointer ${isDark
                        ? 'text-white placeholder:text-white/50'
                        : 'text-foreground placeholder:text-neutrals-06'
                      }`}
                  />
                </>
              )}

              {/* Simple Date Picker */}
              {showDatePicker && (
                <div className={`absolute top-full right-0 mt-2 w-64 rounded-2xl shadow-2xl border z-50 p-4 ${isDark
                    ? 'bg-[#1E1E1E] border-white/10'
                    : 'bg-white border-neutrals-03'
                  } ${showMobileSearch ? 'left-0 w-full' : ''}`}>
                  <input
                    type="date"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleDateSelect(new Date(e.target.value));
                      }
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-01 ${isDark
                        ? 'bg-[#2a2a2a] text-white border-white/10'
                        : 'bg-shades-white text-foreground border-neutrals-03'
                      }`}
                  />
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className={`${showMobileSearch
                  ? 'w-full py-4 bg-primary-01 hover:bg-primary-02 text-white rounded-full font-bold text-lg shadow-lg flex items-center justify-center gap-2'
                  : 'bg-primary-01 hover:bg-primary-02 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors shrink-0 m-1'
                }`}
              aria-label="Search"
            >
              <Search size={showMobileSearch ? 24 : 16} strokeWidth={showMobileSearch ? 3 : 2} />
              {showMobileSearch && "Search"}
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
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${isDark
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
