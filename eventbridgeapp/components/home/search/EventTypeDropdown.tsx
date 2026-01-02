'use client';

import { useMemo } from 'react';

// Event types data
export const EVENT_TYPES = [
  { name: 'Wedding', services: ['Photography', 'Catering', 'Venue', 'Decoration'] },
  { name: 'Birthday', services: ['Cake', 'Entertainment', 'Venue', 'Catering'] },
  { name: 'Corporate', services: ['Venue', 'Catering', 'AV Equipment', 'Photography'] },
  { name: 'Anniversary', services: ['Venue', 'Catering', 'Photography', 'Flowers'] },
  { name: 'Graduation', services: ['Venue', 'Catering', 'Photography', 'Entertainment'] },
  { name: 'Baby Shower', services: ['Venue', 'Catering', 'Decoration', 'Entertainment'] },
  { name: 'Engagement', services: ['Photography', 'Venue', 'Catering', 'Flowers'] },
  { name: 'Conference', services: ['Venue', 'AV Equipment', 'Catering', 'Registration'] },
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
              className="w-full flex items-center gap-3 text-left hover:bg-white/5 p-2 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-[#444] rounded-lg shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm">{event.name}</h4>
                <p className="text-white/40 text-xs truncate">
                  {event.services.slice(0, 3).join(', ')}{event.services.length > 3 && ' and more'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
