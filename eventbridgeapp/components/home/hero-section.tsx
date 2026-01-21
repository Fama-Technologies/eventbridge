'use client';

import { Search, MapPin, Calendar } from 'lucide-react';
import type { MediaItem } from './HeroCarousel';
import { useState, useRef, useEffect, useCallback } from 'react';
import HeroCarousel from './HeroCarousel';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { DualMonthCalendar, EventTypeDropdown, LocationDropdown } from './search';

export default function HeroSection() {
  const router = useRouter();
  const [what, setWhat] = useState('');
  const [where, setWhere] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Dropdown visibility states ok
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Refs for positioning dropdowns
  const whatInputRef = useRef<HTMLDivElement>(null);
  const whereInputRef = useRef<HTMLDivElement>(null);
  const whenInputRef = useRef<HTMLDivElement>(null);

  // Store anchor rects for dropdown positioning
  const [whatRect, setWhatRect] = useState<DOMRect | null>(null);
  const [whereRect, setWhereRect] = useState<DOMRect | null>(null);
  const [whenRect, setWhenRect] = useState<DOMRect | null>(null);

  // Update rects on scroll or resize
  const updateRects = useCallback(() => {
    if (whatInputRef.current) setWhatRect(whatInputRef.current.getBoundingClientRect());
    if (whereInputRef.current) setWhereRect(whereInputRef.current.getBoundingClientRect());
    if (whenInputRef.current) setWhenRect(whenInputRef.current.getBoundingClientRect());
  }, []);

  useEffect(() => {
    // Update rects when dropdowns open
    updateRects();

    // Listen to scroll and resize
    window.addEventListener('scroll', updateRects, true);
    window.addEventListener('resize', updateRects);

    return () => {
      window.removeEventListener('scroll', updateRects, true);
      window.removeEventListener('resize', updateRects);
    };
  }, [updateRects, showEventDropdown, showLocationDropdown, showDatePicker]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleEventSelect = (eventType: string) => {
    setWhat(eventType);
    setShowEventDropdown(false);
  };

  const handleLocationSelect = (location: string) => {
    setWhere(location);
    setShowLocationDropdown(false);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (what) params.set('what', what);
    if (where) params.set('where', where);
    if (selectedDate) params.set('when', format(selectedDate, 'yyyy-MM-dd'));
    router.push(`/search?${params.toString()}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  };

  const [currentSlide, setCurrentSlide] = useState(0);

  const popularCategories = [
    { label: 'Photographer', slug: 'photography' },
    { label: 'Catering', slug: 'catering' },
    { label: 'Venue', slug: 'venues' },
    { label: 'Weddings', slug: 'weddings' },
  ];
  const slideContent = [
    {
      title: (
        <>
          Discover & Connect
          <br />
          with Trusted Event Vendors
        </>
      ),
      subtitle: (
        <>
          Plan your perfect event with verified service providers, smart budgeting tools,
          <br />
          and seamless communication
        </>
      ),
    },
    {
      title: (
        <>
          Event Management
          <br />
          Tools in One Platform
        </>
      ),
      subtitle: (
        <>
          Manage bookings, digital invoicing, receipting, and track your budget effortlessly
        </>
      ),
    },
    {
      title: (
        <>
          Discover Service Packages
          <br />
          That Fit Your Budget
        </>
      ),
      subtitle: (
        <>
          Compare vendors, chat directly, and make informed decisions for your special day
        </>
      ),
    },
  ];

  const vendorMedia: MediaItem[] = [
    { src: '/hero/hero.jpg', alt: 'Discover Service Packages', overlay: 'bg-purple-900/40' },
    { src: '/hero/hero1.png', alt: 'Discover & Connect with Trusted Event Vendors' },
    { src: '/hero/hero2.png', alt: 'Manage bookings and track your budget' },
  ];

  return (
    <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden">
      <HeroCarousel mediaItems={vendorMedia} onSlideChange={setCurrentSlide} />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-7xl font-bold text-white mb-4 transition-all duration-500 min-h-[3.6em] md:min-h-[2.4em] flex items-end justify-center">
          <span>{slideContent[currentSlide]?.title}</span>
        </h1>
        <p className="text-white text-base md:text-lg mb-8 transition-all duration-500 min-h-[3em] flex items-start justify-center">
          <span>{slideContent[currentSlide]?.subtitle}</span>
        </p>

        {/* Search Bar */}
        <div className="bg-shades-white rounded-full p-2 flex items-center shadow-2xl max-w-3xl mx-auto border border-white/10">
          {/* What */}
          <div ref={whatInputRef} className="flex items-center gap-3 px-5 flex-1 border-r border-white/20">
            <Search size={18} className="text-shades-black shrink-0" />
            <div className="flex-1 text-left">
              <label className="text-xs font-medium text-shades-black block">What</label>
              <input
                type="text"
                placeholder="Wedding, Birthday..."
                value={what}
                onChange={(e) => {
                  setWhat(e.target.value);
                  setShowEventDropdown(true);
                  setShowLocationDropdown(false);
                  setShowDatePicker(false);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  setShowEventDropdown(true);
                  setShowLocationDropdown(false);
                  setShowDatePicker(false);
                  updateRects();
                }}
                className="w-full text-sm text-shades-black placeholder:text-shades-black/40 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Where */}
          <div ref={whereInputRef} className="flex items-center gap-3 px-5 flex-1 border-r border-white/20">
            <MapPin size={18} className="text-shades-black shrink-0" />
            <div className="flex-1 text-left">
              <label className="text-xs font-medium text-shades-black block">Where</label>
              <input
                type="text"
                placeholder="City or Zip code"
                value={where}
                onChange={(e) => {
                  setWhere(e.target.value);
                  setShowLocationDropdown(true);
                  setShowEventDropdown(false);
                  setShowDatePicker(false);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  setShowLocationDropdown(true);
                  setShowEventDropdown(false);
                  setShowDatePicker(false);
                  updateRects();
                }}
                className="w-full text-sm text-shades-black placeholder:text-shades-black/40 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* When */}
          <div ref={whenInputRef} className="flex items-center gap-3 px-5 flex-1">
            <Calendar size={18} className="text-shades-black shrink-0" />
            <div className="flex-1 text-left">
              <label className="text-xs font-medium text-shades-black block">When</label>
              <input
                type="text"
                placeholder="Add dates"
                value={selectedDate ? format(selectedDate, 'MMM dd, yyyy') : ''}
                onClick={() => {
                  setShowDatePicker(!showDatePicker);
                  setShowEventDropdown(false);
                  setShowLocationDropdown(false);
                  updateRects();
                }}
                readOnly
                className="w-full text-sm text-shades-black placeholder:text-shades-black/40 focus:outline-none bg-transparent cursor-pointer"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="bg-primary-01 hover:bg-primary-02 text-shades-white rounded-full w-11 h-11 flex items-center justify-center transition-colors shrink-0 ml-2"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
        </div>

        {/* Popular Categories */}
        <div className="mt-8 flex items-center justify-center gap-4 text-white">
          <span className="text-sm">Popular:</span>
          <div className="flex gap-3">
            {popularCategories.map((category) => (
              <button
                key={category.label}
                onClick={() => router.push(`/category/${category.slug}`)}
                className="px-4 py-2 rounded-full border border-shades-white/30 hover:bg-primary-01 hover:text-shades-white transition-colors text-sm"
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dropdowns - using portaled fixed positioning */}
      {showEventDropdown && (
        <EventTypeDropdown
          onSelect={handleEventSelect}
          searchValue={what}
          onClose={() => setShowEventDropdown(false)}
          anchorRect={whatRect}
        />
      )}

      {showLocationDropdown && (
        <LocationDropdown
          onSelect={handleLocationSelect}
          searchValue={where}
          onClose={() => setShowLocationDropdown(false)}
          anchorRect={whereRect}
        />
      )}

      {showDatePicker && (
        <DualMonthCalendar
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
          onClose={() => setShowDatePicker(false)}
          anchorRect={whenRect}
        />
      )}
    </section>
  );
}
