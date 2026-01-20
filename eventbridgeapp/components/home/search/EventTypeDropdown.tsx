'use client';

import { useMemo } from 'react';

// Event types data
export const EVENT_TYPES = [
  { name: 'Wedding', image: '/categories/weddings.jpg', services: ['Photography', 'Catering', 'Venue', 'Decoration'] },
  { name: 'Birthday', image: '/categories/Birthdays.jpg', services: ['Cake', 'Entertainment', 'Venue', 'Catering'] },
  { name: 'Corporate', image: '/categories/Corporate.jpg', services: ['Venue', 'Catering', 'AV Equipment', 'Photography'] },
  { name: 'Anniversary', image: '/categories/Anniversaries.jpg', services: ['Venue', 'Catering', 'Photography', 'Flowers'] },
  { name: 'Graduation', image: '/categories/Graduations.jpg', services: ['Venue', 'Catering', 'Photography', 'Entertainment'] },
  { name: 'Baby Shower', image: '/categories/Baby Showers.png', services: ['Venue', 'Catering', 'Decoration', 'Entertainment'] },
  { name: 'Engagement', image: '/categories/Engagements.jpg', services: ['Photography', 'Venue', 'Catering', 'Flowers'] },
  { name: 'Conference', image: '/categories/Conferences.jpg', services: ['Venue', 'AV Equipment', 'Catering', 'Registration'] },
];

interface EventTypeDropdownProps {
  onSelect: (eventType: string) => void;
  searchValue: string;
  onClose: () => void;
  anchorRect?: DOMRect | null;
}

export default function EventTypeDropdown({
  onSelect,
  searchValue,
  onClose,
  anchorRect
}: EventTypeDropdownProps) {
  // Calculate position based on anchor using useMemo
  const position = useMemo(() => {
    if (!anchorRect) {
      return { top: 280, left: 200 };
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
      left: Math.max(16, left)
    };
  }, [anchorRect]);

  const filtered = EVENT_TYPES.filter(e =>
    e.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    e.services.some(s => s.toLowerCase().includes(searchValue.toLowerCase()))
  );

  if (filtered.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className="fixed bg-[#1E1E1E] rounded-2xl shadow-2xl p-4 border border-white/10 w-80"
        style={{
          top: position.top,
          left: position.left
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto custom-scrollbar">
          {filtered.map((event, index) => (
            <button
              key={index}
              onClick={() => onSelect(event.name)}
              className="w-full flex items-center gap-3 text-left hover:bg-white/5 p-2 rounded-lg transition-colors group"
            >
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10 group-hover:border-primary-01 transition-colors">
                {/* @ts-ignore */}
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm group-hover:text-primary-01 transition-colors">{event.name}</h4>
                <p className="text-white/40 text-xs truncate">
                  {event.services.slice(0, 3).join(', ')}{event.services.length > 3 && '...'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
