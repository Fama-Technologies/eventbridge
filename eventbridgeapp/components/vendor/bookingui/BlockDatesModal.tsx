"use client";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    format,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isWithinInterval,
    isBefore,
    isAfter,
    startOfDay,
    endOfDay
} from "date-fns";
import type { Booking } from "./data";

interface BlockDatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookings?: Booking[];
    onBlockDates?: (dates: Date[], reason: string, note: string, recurring: boolean) => void;
}

const BLOCK_REASONS = [
    "Other",
    "Personal",
    "Holiday",
    "Maintenance"
];

export default function BlockDatesModal({
    isOpen,
    onClose,
    bookings = [],
    onBlockDates
}: BlockDatesModalProps) {
    const [leftMonth, setLeftMonth] = useState(new Date(2023, 9, 1)); // October 2023
    const [rangeStart, setRangeStart] = useState<Date | null>(null);
    const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
    const [reason, setReason] = useState("Other");
    const [note, setNote] = useState("");
    const [recurring, setRecurring] = useState(false);

    if (!isOpen) return null;

    const rightMonth = addMonths(leftMonth, 1);
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const getDaysForMonth = (month: Date) => {
        const start = startOfMonth(month);
        const end = endOfMonth(month);
        const days = eachDayOfInterval({ start, end });

        // Add padding for the first week
        const firstDayOfWeek = start.getDay();
        const paddedDays: (Date | null)[] = Array(firstDayOfWeek).fill(null);

        return [...paddedDays, ...days];
    };

    const getExistingBooking = (date: Date) => {
        return bookings.find(b =>
            isWithinInterval(date, { start: startOfDay(b.startDate), end: endOfDay(b.endDate) })
        );
    };

    const isRangeStart = (date: Date) => rangeStart && isSameDay(date, rangeStart);
    const isRangeEnd = (date: Date) => rangeEnd && isSameDay(date, rangeEnd);
    const isInRange = (date: Date) => {
        if (!rangeStart) return false;
        if (!rangeEnd) return isSameDay(date, rangeStart);
        return isWithinInterval(date, { start: rangeStart, end: rangeEnd });
    };
    const isRangeMiddle = (date: Date) => {
        if (!rangeStart || !rangeEnd) return false;
        return isAfter(date, rangeStart) && isBefore(date, rangeEnd);
    };

    const handleDateClick = (date: Date) => {
        if (getExistingBooking(date)) return;

        if (!rangeStart || (rangeStart && rangeEnd)) {
            // Start new selection
            setRangeStart(date);
            setRangeEnd(null);
        } else {
            // Check for overlaps before completing selection
            if (isBefore(date, rangeStart)) {
                // Selecting backwards
                const hasOverlap = bookings.some(b =>
                    isWithinInterval(b.startDate, { start: date, end: rangeStart }) ||
                    isWithinInterval(b.endDate, { start: date, end: rangeStart })
                );
                if (hasOverlap) {
                    setRangeStart(date);
                    setRangeEnd(null);
                } else {
                    setRangeEnd(rangeStart);
                    setRangeStart(date);
                }
            } else {
                // Selecting forwards
                const hasOverlap = bookings.some(b =>
                    isWithinInterval(b.startDate, { start: rangeStart, end: date }) ||
                    isWithinInterval(b.endDate, { start: rangeStart, end: date })
                );
                if (hasOverlap) {
                    setRangeStart(date); // Restart selection at new date or just ignore? User logic usually implies restarting.
                    setRangeEnd(null);
                } else {
                    setRangeEnd(date);
                }
            }
        }
    };

    const handleSubmit = () => {
        if (!rangeStart) return;

        const selectedDates: Date[] = [];
        let current = new Date(rangeStart);
        const end = rangeEnd || rangeStart;

        while (!isAfter(current, end)) {
            selectedDates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        if (onBlockDates) {
            onBlockDates(selectedDates, reason, note, recurring);
        }
        onClose();
    };

    const formatSelectedRange = () => {
        if (!rangeStart) return "";
        if (!rangeEnd || isSameDay(rangeStart, rangeEnd)) {
            return format(rangeStart, "MMM d");
        }
        return `${format(rangeStart, "MMM d")} - ${format(rangeEnd, "MMM d")}`;
    };

    const renderCalendar = (month: Date, showLeftNav: boolean, showRightNav: boolean) => {
        const days = getDaysForMonth(month);

        return (
            <div className="flex-1 min-w-0">
                {/* Month Header */}
                <div className="flex items-center justify-between mb-4">
                    {showLeftNav ? (
                        <button
                            onClick={() => setLeftMonth(subMonths(leftMonth, 1))}
                            className="p-1.5 hover:bg-neutrals-02 rounded transition-colors"
                        >
                            <ChevronLeft size={16} className="text-neutrals-06" />
                        </button>
                    ) : <div className="w-7" />}

                    <h3 className="font-semibold text-shades-black text-sm">
                        {format(month, "MMMM yyyy")}
                    </h3>

                    {showRightNav ? (
                        <button
                            onClick={() => setLeftMonth(addMonths(leftMonth, 1))}
                            className="p-1.5 hover:bg-neutrals-02 rounded transition-colors"
                        >
                            <ChevronRight size={16} className="text-neutrals-06" />
                        </button>
                    ) : <div className="w-7" />}
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 mb-2">
                    {dayNames.map(day => (
                        <div key={day} className="text-center text-xs text-neutrals-06 py-1">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7">
                    {days.map((day, i) => {
                        if (!day) {
                            return <div key={`empty-${i}`} className="h-9" />;
                        }

                        const inMonth = isSameMonth(day, month);
                        const existingBooking = getExistingBooking(day);
                        const inRange = isInRange(day);
                        const isStart = isRangeStart(day);
                        const isEnd = isRangeEnd(day);
                        const isMiddle = isRangeMiddle(day);

                        // Determine wrapper classes for range background
                        let wrapperClasses = 'relative h-9 flex items-center justify-center';

                        // Selection range logic (Orange)
                        if (inRange) {
                            if (isMiddle) {
                                wrapperClasses += ' bg-primary-01/30';
                            } else if (isStart && rangeEnd) {
                                wrapperClasses += ' bg-gradient-to-r from-transparent via-primary-01/30 to-primary-01/30';
                            } else if (isEnd) {
                                wrapperClasses += ' bg-gradient-to-r from-primary-01/30 via-primary-01/30 to-transparent';
                            }
                        }
                        // Existing booking range logic
                        else if (existingBooking) {
                            const isBookedStart = isSameDay(day, existingBooking.startDate);
                            const isBookedEnd = isSameDay(day, existingBooking.endDate);
                            const isBookedMiddle = !isBookedStart && !isBookedEnd;
                            const isBlocked = existingBooking.status === 'blocked';

                            const bgClass = isBlocked ? 'bg-errors-main/20' : 'bg-accents-discount/20';

                            if (isBookedMiddle) {
                                wrapperClasses += ` ${bgClass}`;
                            } else if (isBookedStart && !isSameDay(existingBooking.startDate, existingBooking.endDate)) {
                                if (isBlocked) wrapperClasses += ' bg-gradient-to-r from-transparent via-errors-main/20 to-errors-main/20';
                                else wrapperClasses += ' bg-gradient-to-r from-transparent via-accents-discount/20 to-accents-discount/20';
                            } else if (isBookedEnd && !isSameDay(existingBooking.startDate, existingBooking.endDate)) {
                                if (isBlocked) wrapperClasses += ' bg-gradient-to-r from-errors-main/20 via-errors-main/20 to-transparent';
                                else wrapperClasses += ' bg-gradient-to-r from-accents-discount/20 via-accents-discount/20 to-transparent';
                            }
                        }

                        // Determine button classes
                        let buttonClasses = 'relative z-10 w-8 h-8 flex items-center justify-center text-sm rounded-full transition-all cursor-pointer ';

                        if (!inMonth) {
                            buttonClasses += 'text-neutrals-04 cursor-default';
                        } else if (isStart || isEnd) {
                            // Selected range endpoints - orange
                            buttonClasses += 'bg-primary-01 text-shades-white font-medium';
                        } else if (inRange) {
                            // Middle of range
                            buttonClasses += 'text-primary-01 font-medium';
                        } else if (existingBooking) {
                            const isBookedStart = isSameDay(day, existingBooking.startDate);
                            const isBookedEnd = isSameDay(day, existingBooking.endDate);
                            const isBlocked = existingBooking.status === 'blocked';
                            const solidBgClass = isBlocked ? 'bg-errors-main' : 'bg-accents-discount';
                            const textClass = isBlocked ? 'text-errors-main' : 'text-accents-discount';

                            if (isBookedStart || isBookedEnd) {
                                buttonClasses += `${solidBgClass} text-white`;
                            } else {
                                buttonClasses += `${textClass} font-medium border border-${isBlocked ? 'errors-main' : 'accents-discount'} border-opacity-30`;
                                // Added light border to match prev style if desired, or simplified
                            }
                        } else {
                            // Normal dates
                            buttonClasses += 'text-shades-black hover:bg-neutrals-02';
                        }

                        return (
                            <div key={day.getTime()} className={wrapperClasses}>
                                <button
                                    onClick={() => inMonth && handleDateClick(day)}
                                    disabled={!inMonth}
                                    className={buttonClasses}
                                >
                                    {format(day, "d")}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-shades-white rounded-2xl w-full max-w-3xl mx-4 shadow-xl max-h-[90vh] flex flex-col">
                {/* Sticky Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-neutrals-03 flex-shrink-0 sticky top-0 bg-shades-white rounded-t-2xl z-10">
                    <h2 className="text-lg font-bold text-shades-black">Block Dates</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-neutrals-02 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-neutrals-06" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Title and Legend */}
                    <div className="flex items-center justify-between mb-6">
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

                    {/* Dual Calendar */}
                    <div className="flex gap-8 p-5 border border-neutrals-03 rounded-xl mb-6">
                        {renderCalendar(leftMonth, true, false)}
                        {renderCalendar(rightMonth, false, true)}
                    </div>

                    {/* Options Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Reason Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-shades-black mb-2">
                                Reason for blocking
                            </label>
                            <div className="relative">
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full px-4 py-3 border border-neutrals-03 rounded-lg text-shades-black bg-shades-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-01/20 focus:border-primary-01 cursor-pointer"
                                >
                                    {BLOCK_REASONS.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutrals-06 pointer-events-none" />
                            </div>
                        </div>

                        {/* Note */}
                        <div>
                            <label className="block text-sm font-medium text-shades-black mb-2">
                                Add internal note (optional)
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Add details about why these dates are unavailable..."
                                className="w-full px-4 py-3 border border-neutrals-03 rounded-lg text-shades-black placeholder:text-neutrals-06 resize-none h-[46px] focus:outline-none focus:ring-2 focus:ring-primary-01/20 focus:border-primary-01"
                            />
                        </div>
                    </div>

                    {/* Recurring Toggle */}
                    <div className="flex items-center justify-between p-4 bg-neutrals-01 rounded-xl">
                        <div>
                            <h4 className="font-semibold text-shades-black">Make recurring</h4>
                            <p className="text-sm text-neutrals-06">Repeat this block periodically</p>
                        </div>
                        <button
                            onClick={() => setRecurring(!recurring)}
                            className={`w-12 h-6 rounded-full transition-colors ${recurring ? 'bg-primary-01' : 'bg-neutrals-04'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${recurring ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-neutrals-03 flex-shrink-0 sticky bottom-0 bg-shades-white rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="text-shades-black font-semibold hover:text-neutrals-07 transition-colors"
                    >
                        Cancel
                    </button>

                    <div className="flex items-center gap-4">
                        {rangeStart && (
                            <div className="text-right">
                                <p className="text-xs text-neutrals-06">Selected Range</p>
                                <p className="font-semibold text-shades-black">{formatSelectedRange()}</p>
                            </div>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={!rangeStart}
                            className="bg-primary-01 hover:bg-primary-02 disabled:bg-neutrals-03 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                        >
                            Block Dates
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
