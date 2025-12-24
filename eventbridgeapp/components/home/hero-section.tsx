'use client';

import { Search, MapPin, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MediaItem } from './HeroCarousel';
import { useState, useRef, useEffect } from 'react';
import HeroCarousel from './HeroCarousel';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';

interface DatePickerProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
}

function DatePicker({ onDateSelect, selectedDate }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = monthStart.getDay();

  // Create empty cells for days before the month starts
  const emptyCells = Array(firstDayOfWeek).fill(null);

  const allCells = [...emptyCells, ...days];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl p-4 z-50 w-80 border border-neutrals-03">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 hover:bg-neutrals-02 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} className="text-neutrals-06" />
        </button>
        <h3 className="font-semibold text-shades-black">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 hover:bg-neutrals-02 rounded-lg transition-colors"
        >
          <ChevronRight size={20} className="text-neutrals-06" />
        </button>
      </div>

      {/* Week Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-neutrals-06 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {allCells.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              disabled={!isCurrentMonth}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all
                ${!isCurrentMonth ? 'text-neutrals-04 cursor-not-allowed' : 'text-shades-black hover:bg-primary-01/10'}
                ${isSelected ? 'bg-primary-01 text-white hover:bg-primary-02' : ''}
                ${isCurrentDay && !isSelected ? 'border-2 border-primary-01' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      {/* Clear Selection Button */}
      {selectedDate && (
        <button
          onClick={() => onDateSelect(new Date())}
          className="w-full mt-4 py-2 text-sm text-primary-01 hover:bg-primary-01/10 rounded-lg transition-colors font-medium"
        >
          Clear Selection
        </button>
      )}
    </div>
  );
}


export default function HeroSection() {
  const router = useRouter();
  const [what, setWhat] = useState('');
  const [where, setWhere] = useState('');
  const [when, setWhen] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setWhen(format(date, 'yyyy-MM-dd'));
    setShowDatePicker(false);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (what) params.set('what', what);
    if (where) params.set('where', where);
    if (when) params.set('when', when);
    router.push(`/search?${params.toString()}`);
  };

  const popularCategories = ['Photographers', 'Catering', 'Venues'];
  const vendorMedia: MediaItem[] = [
    { type: 'image', src: '/categories/Corporate.jpg', alt: 'Vendor 1' },
    { type: 'video', src: 'https://youtube.com/shorts/vu0SLhpnS2M?si=ucveake9dcj8uRCY', alt: 'Cinematic Wedding' },
    { type: 'video', src: 'https://youtu.be/3wbaX4DXnrA?si=30kgAxRom_VHAJUF', alt: 'Event Highlight video' },
  ];

  return (
    <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden">
      <HeroCarousel mediaItems={vendorMedia} />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          Plan the perfect event,
          <br />
          <span className="text-primary-01">effortlessly.</span>
        </h1>
        <p className="text-white text-lg mb-8">
          Connect with top-rated planners, venues, and vendors in your area. Curated
          <br />
          specifically for your memorable moments.
        </p>

        {/* Search Bar */}
        <div className="bg-white rounded-full p-1.5 pl-2 flex items-center shadow-2xl max-w-3xl mx-auto">
          {/* What */}
          <div className="flex items-center gap-2 px-4 flex-1 border-r border-neutrals-03">
            <Search size={18} className="text-neutrals-06 flex-shrink-0" />
            <div className="flex-1 text-left">
              <label className="text-xs font-semibold text-shades-black block">What</label>
              <input
                type="text"
                placeholder="Wedding, Birthday..."
                value={what}
                onChange={(e) => setWhat(e.target.value)}
                className="w-full text-sm text-neutrals-06 placeholder:text-neutrals-06 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Where */}
          <div className="flex items-center gap-2 px-4 flex-1 border-r border-neutrals-03">
            <MapPin size={18} className="text-neutrals-06 flex-shrink-0" />
            <div className="flex-1 text-left">
              <label className="text-xs font-semibold text-shades-black block">Where</label>
              <input
                type="text"
                placeholder="City or Zip code"
                value={where}
                onChange={(e) => setWhere(e.target.value)}
                className="w-full text-sm text-neutrals-06 placeholder:text-neutrals-06 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* When */}
          <div className="flex items-center gap-2 px-4 flex-1 relative" ref={datePickerRef}>
            <Calendar size={18} className="text-neutrals-06 flex-shrink-0" />
            <div className="flex-1 text-left">
              <label className="text-xs font-semibold text-shades-black block">When</label>
              <input
                type="text"
                placeholder="Add dates"
                value={selectedDate ? format(selectedDate, 'MMM dd, yyyy') : ''}
                onClick={() => setShowDatePicker(!showDatePicker)}
                readOnly
                className="w-full text-sm text-neutrals-06 placeholder:text-neutrals-06 focus:outline-none bg-transparent cursor-pointer"
              />
            </div>

            {/* Date Picker Popup */}
            {showDatePicker && (
              <DatePicker
                onDateSelect={handleDateSelect}
                selectedDate={selectedDate}
              />
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="bg-primary-01 hover:bg-primary-02 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors flex-shrink-0"
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
                key={category}
                onClick={() => setWhat(category)}
                className="px-4 py-2 rounded-full border border-white/30 hover:bg-white/10 transition-colors text-sm"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
