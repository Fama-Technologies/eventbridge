'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

interface DualMonthCalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
  onClose: () => void;
  anchorRect?: DOMRect | null;
}

export default function DualMonthCalendar({
  onDateSelect,
  selectedDate,
  onClose,
  anchorRect
}: DualMonthCalendarProps) {
  const [leftMonth, setLeftMonth] = useState(new Date());
  const rightMonth = addMonths(leftMonth, 1);
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Calculate position based on anchor using useMemo
  const position = useMemo(() => {
    if (!anchorRect) {
      return { top: 280, left: '50%', transform: 'translateX(-50%)' };
    }

    const calendarWidth = 420;
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;

    let left = anchorRect.left + (anchorRect.width / 2) - (calendarWidth / 2);

    // Keep within viewport bounds
    if (left < 16) left = 16;
    if (left + calendarWidth > viewportWidth - 16) left = viewportWidth - calendarWidth - 16;

    return {
      top: anchorRect.bottom + 12,
      left: left,
      transform: 'none'
    };
  }, [anchorRect]);

  const handlePrevMonth = () => {
    setLeftMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setLeftMonth(prev => addMonths(prev, 1));
  };

  const renderMonth = (month: Date, showNav: 'left' | 'right' | 'none') => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfWeek = monthStart.getDay();
    const emptyCells = Array(firstDayOfWeek).fill(null);
    const allCells = [...emptyCells, ...days];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div className="w-44">
        {/* Month header with navigation */}
        <div className="flex items-center justify-between mb-3">
          {showNav === 'left' ? (
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-shades-black/10 rounded transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} className="text-shades-black/70" />
            </button>
          ) : (
            <div className="w-6" />
          )}

          <h3 className="text-shades-black text-sm font-medium">
            {format(month, 'MMMM yyyy')}
          </h3>

          {showNav === 'right' ? (
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-shades-black/10 rounded transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={16} className="text-shades-black/70" />
            </button>
          ) : (
            <div className="w-6" />
          )}
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {weekDays.map((day, idx) => (
            <div
              key={`${month.getTime()}-${day}-${idx}`}
              className="w-5 h-5 text-center text-[10px] text-shades-black/50 flex items-center justify-center"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {allCells.map((day, index) => {
            if (!day) return <div key={`empty-${month.getTime()}-${index}`} className="w-5 h-5" />;

            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isPast = day < today;
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={day.toISOString()}
                onClick={() => !isPast && onDateSelect(day)}
                disabled={isPast}
                className={`w-5 h-5 text-[11px] flex items-center justify-center rounded transition-colors
                  ${isPast ? 'text-shades-black/20 cursor-not-allowed' : 'text-shades-black/70 hover:bg-shades-black/10'}
                  ${isSelected ? 'bg-primary-01 text-white' : ''}
                  ${isToday && !isSelected ? 'ring-1 ring-primary-01' : ''}`}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className="fixed bg-shades-white rounded-2xl shadow-2xl p-5 border border-neutrals-03"
        style={{
          top: position.top,
          left: position.left,
          transform: position.transform
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-6">
          {renderMonth(leftMonth, 'left')}
          {renderMonth(rightMonth, 'right')}
        </div>
      </div>
    </div>
  );
}
