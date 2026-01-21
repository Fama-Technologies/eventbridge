'use client';

import { useMemo } from 'react';

// Location suggestions data
export const LOCATION_SUGGESTIONS = [
  { city: 'Kampala', country: 'Uganda' },
  { city: 'Entebbe', country: 'Uganda' },
  { city: 'Jinja', country: 'Uganda' },
  { city: 'Mbarara', country: 'Uganda' },
  { city: 'Gulu', country: 'Uganda' },
  { city: 'Nairobi', country: 'Kenya' },
  { city: 'Kigali', country: 'Rwanda' },
  { city: 'Dar es Salaam', country: 'Tanzania' },
];

interface LocationDropdownProps {
  onSelect: (location: string) => void;
  searchValue: string;
  onClose: () => void;
  anchorRect?: DOMRect | null;
}

export default function LocationDropdown({
  onSelect,
  searchValue,
  onClose,
  anchorRect
}: LocationDropdownProps) {
  // Calculate position based on anchor using useMemo
  const position = useMemo(() => {
    if (!anchorRect) {
      return { top: 280, left: '50%', transform: 'translateX(-50%)' };
    }

    const dropdownWidth = 320;
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;

    let left = anchorRect.left;

    // Keep within viewport
    if (left + dropdownWidth > viewportWidth - 16) {
      left = viewportWidth - dropdownWidth - 16;
    }

    return {
      top: anchorRect.bottom + 12,
      left: Math.max(16, left),
      transform: 'none'
    };
  }, [anchorRect]);

  const filtered = LOCATION_SUGGESTIONS.filter(loc =>
    loc.city.toLowerCase().includes(searchValue.toLowerCase()) ||
    loc.country.toLowerCase().includes(searchValue.toLowerCase())
  );

  if (filtered.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className="fixed bg-shades-white rounded-2xl shadow-2xl p-4 border border-neutrals-03 w-80"
        style={{
          top: position.top,
          left: position.left,
          transform: position.transform
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto custom-scrollbar">
          {filtered.map((location, index) => (
            <button
              key={index}
              onClick={() => onSelect(`${location.city}, ${location.country}`)}
              className="w-full flex items-center gap-3 text-left hover:bg-neutrals-01 p-2 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-neutrals-03 rounded-lg shrink-0" />
              <span className="text-shades-black font-medium">
                {location.city}, {location.country}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
