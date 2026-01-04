'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, Calendar, Moon, Sun, PartyPopper } from 'lucide-react';
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
        <div className="flex-1 max-w-xl relative">
          <div className={`rounded-full flex items-center border transition-colors ${
            isDark 
              ? 'bg-white/10 border-white/20' 
              : 'bg-neutrals-01 border-neutrals-03'
          }`}>
            {/* Service */}
            <div ref={serviceRef} className={`relative flex items-center gap-2 px-4 py-2 flex-1 border-r ${
              isDark ? 'border-white/20' : 'border-neutrals-03'
            }`}>
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
                className={`bg-transparent text-sm focus:outline-none w-full ${
                  isDark 
                    ? 'text-white placeholder:text-white/50' 
                    : 'text-foreground placeholder:text-neutrals-06'
                }`}
              />
              
              {/* Service Dropdown */}
              {showServiceDropdown && filteredServices.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-[#1E1E1E] rounded-2xl shadow-2xl border border-white/10 z-50">
                  <div className="p-2 max-h-72 overflow-y-auto">
                    {filteredServices.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleServiceSelect(item.name)}
                        className="w-full flex items-center gap-3 text-left hover:bg-white/5 p-3 rounded-lg transition-colors"
                      >
                        <div className="w-10 h-10 bg-[#444] rounded-lg shrink-0 flex items-center justify-center">
                          <PartyPopper size={20} className="text-white/70" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{item.name}</div>
                          <div className="text-white/60 text-xs">{item.services}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            <div ref={locationRef} className={`relative flex items-center gap-2 px-4 py-2 flex-1 border-r ${
              isDark ? 'border-white/20' : 'border-neutrals-03'
            }`}>
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
                className={`bg-transparent text-sm focus:outline-none w-full ${
                  isDark 
                    ? 'text-white placeholder:text-white/50' 
                    : 'text-foreground placeholder:text-neutrals-06'
                }`}
              />
              
              {/* Location Dropdown */}
              {showLocationDropdown && filteredLocations.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-[#1E1E1E] rounded-2xl shadow-2xl border border-white/10 z-50">
                  <div className="p-2 max-h-72 overflow-y-auto">
                    {filteredLocations.map((loc, index) => (
                      <button
                        key={index}
                        onClick={() => handleLocationSelect(loc.city, loc.country)}
                        className="w-full flex items-center gap-3 text-left hover:bg-white/5 p-3 rounded-lg transition-colors"
                      >
                        <div className="w-10 h-10 bg-[#555] rounded-lg shrink-0" />
                        <span className="text-white font-medium">
                          {loc.city}, {loc.country}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Date */}
            <div ref={dateRef} className="relative flex items-center gap-2 px-4 py-2 flex-1">
              <Calendar size={16} className={isDark ? 'text-white/60' : 'text-neutrals-06'} />
              <input
                type="text"
                placeholder="Date"
                value={date}
                onClick={() => setShowDatePicker(!showDatePicker)}
                onKeyPress={handleKeyPress}
                readOnly
                className={`bg-transparent text-sm focus:outline-none w-full cursor-pointer ${
                  isDark 
                    ? 'text-white placeholder:text-white/50' 
                    : 'text-foreground placeholder:text-neutrals-06'
                }`}
              />
              
              {/* Simple Date Picker */}
              {showDatePicker && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-[#1E1E1E] rounded-2xl shadow-2xl border border-white/10 z-50 p-4">
                  <input
                    type="date"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleDateSelect(new Date(e.target.value));
                      }
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#2a2a2a] text-white border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-01"
                  />
                </div>
              )}
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
