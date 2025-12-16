'use client';

import { Search, MapPin, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function HeroSection() {
  const [what, setWhat] = useState('');
  const [where, setWhere] = useState('');
  const [when, setWhen] = useState('');

  const handleSearch = () => {
    console.log({ what, where, when });
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
        <div className="bg-white/95 backdrop-blur-sm rounded-full p-2 flex items-center gap-0 shadow-2xl max-w-4xl mx-auto">
          <div className="flex items-start gap-3 px-6 flex-1 border-r border-neutrals-04 py-3">
            <Search size={20} className="text-neutrals-06 mt-0.5" />
            <div className="flex-1">
              <input
                type="text"
                placeholder="What"
                value={what}
                onChange={(e) => setWhat(e.target.value)}
                className="w-full text-base font-medium text-shades-black placeholder:text-shades-black focus:outline-none mb-0.5"
              />
              <span className="text-xs text-neutrals-06 block">Wedding, Birthday...</span>
            </div>
          </div>

          <div className="flex items-start gap-3 px-6 flex-1 border-r border-neutrals-03 py-3">
            <MapPin size={20} className="text-neutrals-06 mt-0.5" />
            <div className="flex-1">
              <input
                type="text"
                placeholder="Where"
                value={where}
                onChange={(e) => setWhere(e.target.value)}
                className="w-full text-base font-medium text-shades-black placeholder:text-shades-black focus:outline-none mb-0.5"
              />
              <span className="text-xs text-neutrals-06 block">City or Zip code</span>
            </div>
          </div>

          <div className="flex items-start gap-3 px-6 flex-1 py-3">
            <Calendar size={20} className="text-neutrals-06 mt-0.5" />
            <div className="flex-1">
              <input
                type="text"
                placeholder="When"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                className="w-full text-base font-medium text-shades-black placeholder:text-shades-black focus:outline-none mb-0.5"
              />
              <span className="text-xs text-neutrals-06 block">Add dates</span>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="bg-primary-01 hover:bg-primary-02 text-white rounded-full w-14 h-14 flex items-center justify-center transition-colors ml-2"
            aria-label="Search"
          >
            <Search size={24} />
          </button>
        </div>

        {/* Popular Categories */}
        <div className="mt-8 flex items-center justify-center gap-4 text-white">
          <span className="text-sm">Popular:</span>
          <div className="flex gap-3">
            {popularCategories.map((category) => (
              <button
                key={category}
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
