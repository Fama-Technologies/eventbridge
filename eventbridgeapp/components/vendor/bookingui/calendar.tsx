"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
  isWithinInterval,
  startOfDay,
  endOfDay
} from "date-fns";
import type { Booking } from "./data";

interface CalendarUIProps {
  currentDate?: Date;
  bookings?: Booking[];
  onSelectBooking?: (booking: Booking) => void;
}

export default function CalendarUI({
  currentDate = new Date(2023, 9, 1),
  bookings = [],
  onSelectBooking
}: CalendarUIProps) {

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const dayHeaders = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const getBookingsForDate = (date: Date) =>
    bookings.filter((b) => {
      // Handle potential missing startDate/endDate by falling back to date
      const start = b.startDate ? startOfDay(b.startDate) : startOfDay(b.date);
      const end = b.endDate ? endOfDay(b.endDate) : endOfDay(b.date);
      return isWithinInterval(date, { start, end });
    });

  // Updated styles to match your specific hex requirements
  const getStatusStyles = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "text-accents-discount border-accents-discount bg-accents-discount/20 border-l-4";
      case "pending":
        return "text-[#F59E0B] border-[#F59E0B] bg-[#FEF3C733] border-l-4";
      case "blocked":
        return "text-errors-main border-errors-main bg-errors-main/10 border-l-4";
      default:
        return "bg-gray-100 text-gray-600 border-l-4 border-gray-400";
    }
  };

  return (
    <div className="w-full select-none">
      {/* 1. Header Row (Day Names) */}
      <div className="grid grid-cols-7 mb-2">
        {dayHeaders.map((d) => (
          <div key={d} className="py-2 text-center text-neutrals-08 text-[12px] font-bold tracking-widest">
            {d}
          </div>
        ))}
      </div>

      {/* 2. Calendar Grid Box */}
      <div className="rounded-3xl border border-neutrals-03 overflow-hidden bg-shades-white shadow-sm">
        <div className="grid grid-cols-7 border-t border-l border-neutrals-03">
          {calendarDays.map((day, i) => {
            const dayBookings = getBookingsForDate(day);
            const inMonth = isSameMonth(day, currentDate);
            const today = isToday(day);

            return (
              <div
                key={i}
                className={`
                  min-h-[110px] p-2  border-neutrals-03 transition-colors
                  ${inMonth ? "bg-shades-white" : "bg-neutrals-02"}
                  hover:bg-gray-50/80 cursor-pointer
                `}
              >
                {/* Date Number */}
                <div className={`
                  text-sm font-semibold mb-2
                  ${today ? "text-[#FF5C61]" : inMonth ? "text-neutrals-07" : "text-neutrals-06"}
                `}>
                  {format(day, "d")}
                </div>

                {/* Bookings List */}
                <div className="space-y-1">
                  {dayBookings.map((booking) => (
                    <div
                      key={booking.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBooking?.(booking);
                      }}
                      className={`
                        text-[10px] px-2 py-1 rounded-sm font-medium cursor-pointer hover:opacity-80 transition-opacity
                        ${getStatusStyles(booking.status)}
                      `}
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {booking.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}