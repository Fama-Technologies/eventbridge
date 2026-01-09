'use client';

import { useState } from 'react';
import { X, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { isSameDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import type { Booking } from './bookingui/data';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: any) => void;
  bookings?: Booking[];
}

export default function BookingModal({
  isOpen,
  onClose,
  onSubmit,
  bookings = []
}: BookingModalProps) {
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [eventName, setEventName] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [hostContact, setHostContact] = useState('');
  const [notes, setNotes] = useState('');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getExistingBooking = (date: Date) => {
    return bookings.find(b =>
      isWithinInterval(date, { start: startOfDay(b.startDate), end: endOfDay(b.endDate) })
    );
  };

  const handleDateClick = (date: Date) => {
    if (getExistingBooking(date)) return;

    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(date);
      setRangeEnd(null);
    } else {
      if (date >= rangeStart) {
        // Check if any booking is inside the new range
        const hasBookingOverlap = bookings.some(b =>
          isWithinInterval(b.startDate, { start: rangeStart, end: date }) ||
          isWithinInterval(b.endDate, { start: rangeStart, end: date }) ||
          (b.startDate >= rangeStart && b.endDate <= date)
        );

        if (hasBookingOverlap) {
          // Can't select across a booking
          setRangeStart(date);
          setRangeEnd(null);
        } else {
          setRangeEnd(date);
        }
      } else {
        // Reverse selection
        const hasBookingOverlap = bookings.some(b =>
          isWithinInterval(b.startDate, { start: date, end: rangeStart })
        );
        if (hasBookingOverlap) {
          setRangeStart(date);
          setRangeEnd(null);
        } else {
          setRangeEnd(rangeStart);
          setRangeStart(date);
        }
      }
    }
  };

  const isInSelectionRange = (date: Date) => {
    if (!rangeStart) return false;
    if (!rangeEnd) return isSameDay(date, rangeStart);
    return isWithinInterval(date, { start: rangeStart, end: rangeEnd });
  };

  const isSelectionStart = (date: Date) => rangeStart && isSameDay(date, rangeStart);
  const isSelectionEnd = (date: Date) => rangeEnd && isSameDay(date, rangeEnd);
  const isSelectionMiddle = (date: Date) => {
    if (!rangeStart || !rangeEnd) return false;
    return date > rangeStart && date < rangeEnd;
  };

  const getSelectedRange = () => {
    if (!rangeStart) return '';
    const formatDate = (d: Date) => `${monthNames[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
    if (!rangeEnd || isSameDay(rangeStart, rangeEnd)) return formatDate(rangeStart);
    return `${formatDate(rangeStart)} - ${formatDate(rangeEnd)}`;
  };

  const handleSubmit = () => {
    if (!rangeStart) return;
    const selectedDates: Date[] = [];
    const current = new Date(rangeStart);
    const end = rangeEnd || rangeStart;
    while (current <= end) {
      selectedDates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const bookingData = {
      eventName,
      guestCount: parseInt(guestCount) || 0,
      totalAmount: parseFloat(totalAmount) || 0,
      hostContact,
      notes,
      selectedDates
    };
    onSubmit(bookingData);
  };

  const renderCalendar = (monthOffset: number = 0, showNavigation: 'left' | 'right') => {
    const displayMonth = new Date(currentMonth);
    displayMonth.setMonth(currentMonth.getMonth() + monthOffset);
    const days = getDaysInMonth(displayMonth);

    return (
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          {showNavigation === 'left' ? (
            <button onClick={() => navigateMonth('prev')} className="p-1 hover:bg-neutrals-03 rounded transition-colors">
              <ChevronLeft className="w-4 h-4 text-neutrals-07" />
            </button>
          ) : <div className="w-6" />}
          <span className="text-sm font-semibold text-shades-black">
            {monthNames[displayMonth.getMonth()]} {displayMonth.getFullYear()}
          </span>
          {showNavigation === 'right' ? (
            <button onClick={() => navigateMonth('next')} className="p-1 hover:bg-neutrals-03 rounded transition-colors">
              <ChevronRight className="w-4 h-4 text-neutrals-07" />
            </button>
          ) : <div className="w-6" />}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center text-xs text-neutrals-06 py-1">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {days.map((day, index) => {
            if (!day) return <div key={index} className="h-8" />;

            const existingBooking = getExistingBooking(day);
            const inSelection = isInSelectionRange(day);
            const isSelStart = isSelectionStart(day);
            const isSelEnd = isSelectionEnd(day);
            const isSelMiddle = isSelectionMiddle(day);

            let wrapperClasses = 'relative h-8 flex items-center justify-center';
            let buttonClasses = 'relative z-10 w-7 h-7 flex items-center justify-center text-sm rounded-full transition-all cursor-pointer ';

            // Selection Styling (Orange)
            if (inSelection) {
              if (isSelMiddle) wrapperClasses += ' bg-primary-01/30'; // Translucent orange
              else if (isSelStart && rangeEnd) wrapperClasses += ' bg-gradient-to-r from-transparent via-primary-01/30 to-primary-01/30';
              else if (isSelEnd) wrapperClasses += ' bg-gradient-to-r from-primary-01/30 via-primary-01/30 to-transparent';

              if (isSelStart || isSelEnd) buttonClasses += 'bg-primary-01 text-white font-medium';
              else buttonClasses += 'text-primary-01 font-medium';
            }
            // Existing Booking Styling
            else if (existingBooking) {
              const isBookedStart = isSameDay(day, existingBooking.startDate);
              const isBookedEnd = isSameDay(day, existingBooking.endDate);
              const isBookedMiddle = !isBookedStart && !isBookedEnd;
              const isBlocked = existingBooking.status === 'blocked';

              const bgClass = isBlocked ? 'bg-errors-main/20' : 'bg-accents-discount/20';
              const solidBgClass = isBlocked ? 'bg-errors-main' : 'bg-accents-discount';
              const textClass = isBlocked ? 'text-errors-main' : 'text-accents-discount';

              // Background range logic
              if (isBookedMiddle) {
                wrapperClasses += ` ${bgClass}`;
              } else if (isBookedStart && !isSameDay(existingBooking.startDate, existingBooking.endDate)) {
                wrapperClasses += ` bg-gradient-to-r from-transparent via-${isBlocked ? 'errors-main/20' : 'accents-discount/20'} to-${isBlocked ? 'errors-main/20' : 'accents-discount/20'}`;
                // Note: tailwind arbitrary values in gradient might not interpolate well with dynamic strings? 
                // Using style tag or fixed classes is safer. 
                // I'll use inline styles or specific classes. 
                // 'bg-gradient-to-r' works if I use full class names.
                // But simply "rounded-l-full" on wrapper might be easier if I just fill it.
                // Let's stick to the gradient logic but hardcode the classes based on status.
                if (isBlocked) wrapperClasses += ' bg-gradient-to-r from-transparent via-errors-main/20 to-errors-main/20';
                else wrapperClasses += ' bg-gradient-to-r from-transparent via-accents-discount/20 to-accents-discount/20';
              } else if (isBookedEnd && !isSameDay(existingBooking.startDate, existingBooking.endDate)) {
                if (isBlocked) wrapperClasses += ' bg-gradient-to-r from-errors-main/20 via-errors-main/20 to-transparent';
                else wrapperClasses += ' bg-gradient-to-r from-accents-discount/20 via-accents-discount/20 to-transparent';
              }

              if (isBookedStart || isBookedEnd) {
                buttonClasses += `${solidBgClass} text-white`;
              } else {
                buttonClasses += `${textClass} font-medium`;
              }
            } else {
              buttonClasses += 'text-shades-black hover:bg-neutrals-03';
            }

            return (
              <div key={day.getTime()} className={wrapperClasses}>
                <button onClick={() => handleDateClick(day)} className={buttonClasses}>
                  {day.getDate()}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-shades-black-30 flex items-center justify-center z-50 p-4">
      <div className="bg-shades-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutrals-03">
          <h2 className="text-lg font-semibold text-shades-black">Booking</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-neutrals-03 rounded-lg transition-colors">
            <X className="w-5 h-5 text-neutrals-07" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-shades-black">Select dates to block</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-accents-discount"></div>
                  <span className="text-neutrals-07">Booked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-01"></div>
                  <span className="text-neutrals-07">Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-errors-main"></div>
                  <span className="text-neutrals-07">Blocked</span>
                </div>
              </div>
            </div>

            <div className="border border-neutrals-03 rounded-xl p-5 mb-6">
              <div className="flex gap-8">
                {renderCalendar(0, 'left')}
                {renderCalendar(1, 'right')}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-shades-black mb-2 tracking-wide">EVENT NAME</label>
                <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g. Corporate Annual Gala" className="w-full px-4 py-3 rounded-lg bg-neutrals-01 border border-neutrals-03 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none transition-colors text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-shades-black mb-2 tracking-wide">GUEST COUNT</label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutrals-06" />
                    <input type="number" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} placeholder="0" className="w-full pl-10 pr-4 py-3 rounded-lg bg-neutrals-01 border border-neutrals-03 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none transition-colors text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-shades-black mb-2 tracking-wide">TOTAL AMOUNT</label>
                  <input type="text" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="UGX 0.00" className="w-full px-4 py-3 rounded-lg bg-neutrals-01 border border-neutrals-03 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none transition-colors text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-shades-black mb-2 tracking-wide">HOST CONTACT</label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutrals-06" />
                  <input type="text" value={hostContact} onChange={(e) => setHostContact(e.target.value)} placeholder="Name, Email or Phone Number" className="w-full pl-10 pr-4 py-3 rounded-lg bg-neutrals-01 border border-neutrals-03 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none transition-colors text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-shades-black mb-2 tracking-wide">NOTES / DESCRIPTION</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any specific details about this booking..." rows={3} className="w-full px-4 py-3 rounded-lg bg-neutrals-01 border border-neutrals-03 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none transition-colors resize-none text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-neutrals-03">
          <button onClick={onClose} className="text-sm font-medium text-shades-black hover:text-neutrals-07 transition-colors">Cancel</button>
          <div className="flex items-center gap-4">
            {rangeStart && <div className="text-sm text-neutrals-06">Selected Range <span className="text-shades-black font-medium ml-1">{getSelectedRange()}</span></div>}
            <button onClick={handleSubmit} disabled={!eventName || !hostContact || !rangeStart} className="px-5 py-2.5 rounded-lg bg-primary-01 text-white text-sm font-medium hover:bg-primary-02 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Create Booking</button>
          </div>
        </div>
      </div>
    </div>
  );
}