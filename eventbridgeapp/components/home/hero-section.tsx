'use client';

import { Search, MapPin, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const router = useRouter();
  const [what, setWhat] = useState('');
  const [where, setWhere] = useState('');
  const [when, setWhen] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (what) params.set('what', what);
    if (where) params.set('where', where);
    if (when) params.set('when', when);
    router.push(`/search?${params.toString()}`);
  };

  const popularCategories = ['Photographers', 'Catering', 'Venues'];

  return (
    <section
      className="relative min-h-[500px] flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: 'url(/hero.jpg)',
      }}
    >
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
          <div className="flex items-center gap-2 px-4 flex-1">
            <Calendar size={18} className="text-neutrals-06 flex-shrink-0" />
            <div className="flex-1 text-left">
              <label className="text-xs font-semibold text-shades-black block">When</label>
              <input
                type="text"
                placeholder="Add dates"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                className="w-full text-sm text-neutrals-06 placeholder:text-neutrals-06 focus:outline-none bg-transparent"
              />
            </div>
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
