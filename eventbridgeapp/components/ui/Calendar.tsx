'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CalendarProps {
    onDateSelect?: (date: Date | null) => void;
    onDateRangeSelect?: (startDate: Date | null, endDate: Date | null) => void;
    selectedDate?: Date | null;
    selectedStartDate?: Date | null;
    selectedEndDate?: Date | null;
    bookedDates?: Date[];
    blockedDates?: Date[];
    minDate?: Date;
    maxDate?: Date;
    allowRange?: boolean;
    currentMonth?: Date;
    onMonthChange?: (month: Date) => void;
}

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function Calendar({
    onDateSelect,
    onDateRangeSelect,
    selectedDate,
    selectedStartDate,
    selectedEndDate,
    bookedDates = [],
    blockedDates = [],
    minDate,
    maxDate,
    allowRange = false,
    currentMonth: controlledMonth,
    onMonthChange,
}: CalendarProps) {
    const [internalMonth, setInternalMonth] = useState(controlledMonth || new Date());
    const currentMonth = controlledMonth || internalMonth;

    const isDateBooked = (date: Date) => {
        return bookedDates.some(bookedDate => 
            date.getDate() === bookedDate.getDate() &&
            date.getMonth() === bookedDate.getMonth() &&
            date.getFullYear() === bookedDate.getFullYear()
        );
    };

    const isDateBlocked = (date: Date) => {
        return blockedDates.some(blockedDate => 
            date.getDate() === blockedDate.getDate() &&
            date.getMonth() === blockedDate.getMonth() &&
            date.getFullYear() === blockedDate.getFullYear()
        );
    };

    const isDateSelected = (date: Date) => {
        if (allowRange) {
            if (!selectedStartDate) return false;
            if (!selectedEndDate) {
                return date.getTime() === selectedStartDate.getTime();
            }
            return date >= selectedStartDate && date <= selectedEndDate;
        }
        return selectedDate && date.getTime() === selectedDate.getTime();
    };

    const isDateDisabled = (date: Date) => {
        if (minDate && date < minDate) return true;
        if (maxDate && date > maxDate) return true;
        return isDateBooked(date) || isDateBlocked(date);
    };

    const handleDateClick = (date: Date) => {
        if (isDateDisabled(date)) return;

        if (allowRange && onDateRangeSelect) {
            if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
                // Start new selection
                onDateRangeSelect(date, null);
            } else if (selectedStartDate && !selectedEndDate) {
                // Complete the range
                if (date >= selectedStartDate) {
                    onDateRangeSelect(selectedStartDate, date);
                } else {
                    onDateRangeSelect(date, selectedStartDate);
                }
            }
        } else if (onDateSelect) {
            onDateSelect(date);
        }
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
        
        if (onMonthChange) {
            onMonthChange(newMonth);
        } else {
            setInternalMonth(newMonth);
        }
    };

    const getDaysInMonth = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days from previous month
        for (let i = 0; i < startingDayOfWeek; i++) {
            const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
            days.push({
                date: prevDate,
                isCurrentMonth: false,
            });
        }

        // Add days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push({
                date: new Date(year, month, day),
                isCurrentMonth: true,
            });
        }

        // Add empty cells for days from next month to complete the grid
        const totalCells = Math.ceil(days.length / 7) * 7;
        for (let i = days.length; i < totalCells; i++) {
            const nextDate = new Date(year, month + 1, i - days.length + 1);
            days.push({
                date: nextDate,
                isCurrentMonth: false,
            });
        }

        return days;
    };

    const days = getDaysInMonth();

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-shades-black">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => navigateMonth('prev')}
                        className="p-1 hover:bg-neutrals-02 rounded-md transition-colors"
                    >
                        <ChevronLeft size={16} className="text-neutrals-06" />
                    </button>
                    <button
                        onClick={() => navigateMonth('next')}
                        className="p-1 hover:bg-neutrals-02 rounded-md transition-colors"
                    >
                        <ChevronRight size={16} className="text-neutrals-06" />
                    </button>
                </div>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 mb-2">
                {dayNames.map((dayName) => (
                    <div key={dayName} className="h-8 flex items-center justify-center">
                        <span className="text-xs font-medium text-neutrals-06">{dayName}</span>
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((dayInfo, index) => {
                    const { date, isCurrentMonth } = dayInfo;
                    const isSelected = isDateSelected(date);
                    const isDisabled = isDateDisabled(date);
                    const isBooked = isDateBooked(date);
                    const isBlocked = isDateBlocked(date);
                    const isToday = date.toDateString() === new Date().toDateString();

                    let dayClasses = `
                        h-8 flex items-center justify-center text-sm rounded-md transition-colors cursor-pointer
                        ${!isCurrentMonth ? 'text-neutrals-04' : ''}
                        ${isToday && isCurrentMonth ? 'font-semibold' : ''}
                    `;

                    if (isDisabled) {
                        if (isBooked) {
                            dayClasses += ' bg-accents-info text-white cursor-not-allowed';
                        } else if (isBlocked) {
                            dayClasses += ' bg-errors-main text-white cursor-not-allowed';
                        } else {
                            dayClasses += ' text-neutrals-04 cursor-not-allowed';
                        }
                    } else if (isSelected) {
                        dayClasses += ' bg-primary-01 text-white';
                    } else if (isCurrentMonth) {
                        dayClasses += ' text-shades-black hover:bg-neutrals-02';
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => handleDateClick(date)}
                            disabled={isDisabled && !isCurrentMonth}
                            className={dayClasses}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-accents-info"></div>
                    <span className="text-neutrals-06">Booked</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-accents-pending"></div>
                    <span className="text-neutrals-06">Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-errors-main"></div>
                    <span className="text-neutrals-06">Blocked</span>
                </div>
            </div>
        </div>
    );
}