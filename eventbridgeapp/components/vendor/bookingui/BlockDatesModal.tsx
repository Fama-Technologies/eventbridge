"use client";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    format, 
    isSameMonth, 
    isSameDay,
    addMonths,
    subMonths
} from "date-fns";

interface BlockDatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookedDates?: Date[];
    blockedDates?: Date[];
    onBlockDates?: (dates: Date[], reason: string, note: string, recurring: boolean) => void;
}

const BLOCK_REASONS = [
    "Personal",
    "Holiday",
    "Maintenance",
    "Other"
];

export default function BlockDatesModal({ 
    isOpen, 
    onClose, 
    bookedDates = [],
    blockedDates = [],
    onBlockDates 
}: BlockDatesModalProps) {
    const [leftMonth, setLeftMonth] = useState(new Date(2023, 9, 1)); // October 2023
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [reason, setReason] = useState("Other");
    const [note, setNote] = useState("");
    const [recurring, setRecurring] = useState(false);

    if (!isOpen) return null;

    const rightMonth = addMonths(leftMonth, 1);
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const getDaysForMonth = (month: Date) => {
        const start = startOfWeek(startOfMonth(month));
        const end = endOfWeek(endOfMonth(month));
        return eachDayOfInterval({ start, end });
    };

    const isBooked = (date: Date) => bookedDates.some(d => isSameDay(d, date));
    const isBlocked = (date: Date) => blockedDates.some(d => isSameDay(d, date));
    const isSelected = (date: Date) => selectedDates.some(d => isSameDay(d, date));

    const toggleDate = (date: Date) => {
        if (isBooked(date) || isBlocked(date)) return;
        
        setSelectedDates(prev => {
            const exists = prev.some(d => isSameDay(d, date));
            if (exists) {
                return prev.filter(d => !isSameDay(d, date));
            }
            return [...prev, date];
        });
    };

    const handleSubmit = () => {
        if (selectedDates.length > 0 && onBlockDates) {
            onBlockDates(selectedDates, reason, note, recurring);
        }
        onClose();
    };

    const formatSelectedRange = () => {
        if (selectedDates.length === 0) return "";
        const sorted = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        if (isSameDay(first, last)) {
            return format(first, "MMM d");
        }
        return `${format(first, "MMM d")} - ${format(last, "MMM d")}`;
    };

    const renderCalendar = (month: Date, showLeftNav: boolean, showRightNav: boolean) => {
        const days = getDaysForMonth(month);
        
        return (
            <div className="flex-1">
                {/* Month Header */}
                <div className="flex items-center justify-between mb-4">
                    {showLeftNav ? (
                        <button 
                            onClick={() => setLeftMonth(subMonths(leftMonth, 1))}
                            className="p-1 hover:bg-neutrals-02 rounded transition-colors"
                        >
                            <ChevronLeft size={18} className="text-neutrals-06" />
                        </button>
                    ) : <div className="w-6" />}
                    
                    <h3 className="font-semibold text-shades-black">
                        {format(month, "MMMM yyyy")}
                    </h3>
                    
                    {showRightNav ? (
                        <button 
                            onClick={() => setLeftMonth(addMonths(leftMonth, 1))}
                            className="p-1 hover:bg-neutrals-02 rounded transition-colors"
                        >
                            <ChevronRight size={18} className="text-neutrals-06" />
                        </button>
                    ) : <div className="w-6" />}
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
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, i) => {
                        const inMonth = isSameMonth(day, month);
                        const booked = isBooked(day);
                        const blocked = isBlocked(day);
                        const selected = isSelected(day);

                        let bgClass = "";
                        let textClass = inMonth ? "text-shades-black" : "text-neutrals-04";
                        
                        if (booked) {
                            bgClass = "bg-accents-discount text-white";
                            textClass = "text-white";
                        } else if (blocked) {
                            bgClass = "bg-primary-01 text-white";
                            textClass = "text-white";
                        } else if (selected) {
                            bgClass = "bg-amber-400 text-white";
                            textClass = "text-white";
                        }

                        return (
                            <button
                                key={i}
                                onClick={() => inMonth && toggleDate(day)}
                                disabled={!inMonth || booked || blocked}
                                className={`
                                    aspect-square flex items-center justify-center text-sm rounded-full
                                    transition-colors
                                    ${bgClass}
                                    ${textClass}
                                    ${inMonth && !booked && !blocked ? 'hover:bg-neutrals-02 cursor-pointer' : ''}
                                    ${!inMonth || booked || blocked ? 'cursor-default' : ''}
                                `}
                            >
                                {format(day, "d")}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            
            {/* Modal */}
            <div className="relative bg-white rounded-2xl w-full max-w-3xl mx-4 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutrals-03">
                    <h2 className="text-xl font-bold text-shades-black">Block Dates</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-neutrals-02 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-neutrals-06" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Legend */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-semibold text-shades-black">Select dates to block</h3>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-accents-discount"></div>
                                <span className="text-neutrals-06">Booked</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                <span className="text-neutrals-06">Selected</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-primary-01"></div>
                                <span className="text-neutrals-06">Blocked</span>
                            </div>
                        </div>
                    </div>

                    {/* Calendars */}
                    <div className="flex gap-8 p-4 border border-neutrals-03 rounded-xl mb-6">
                        {renderCalendar(leftMonth, true, false)}
                        {renderCalendar(rightMonth, false, true)}
                    </div>

                    {/* Options Row */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        {/* Reason Dropdown */}
                        <div>
                            <label className="block text-sm font-semibold text-shades-black mb-2">
                                Reason for blocking
                            </label>
                            <select 
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-4 py-3 border border-neutrals-03 rounded-lg text-shades-black bg-white focus:outline-none focus:ring-2 focus:ring-primary-01/20 focus:border-primary-01"
                            >
                                {BLOCK_REASONS.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        {/* Note */}
                        <div>
                            <label className="block text-sm font-semibold text-shades-black mb-2">
                                Add internal note (optional)
                            </label>
                            <textarea 
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Add details about why these dates are unavailable..."
                                className="w-full px-4 py-3 border border-neutrals-03 rounded-lg text-shades-black resize-none h-[46px] focus:outline-none focus:ring-2 focus:ring-primary-01/20 focus:border-primary-01"
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
                            className={`w-12 h-6 rounded-full transition-colors ${recurring ? 'bg-primary-01' : 'bg-neutrals-03'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${recurring ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-neutrals-03">
                    <button 
                        onClick={onClose}
                        className="text-shades-black font-semibold hover:underline"
                    >
                        Cancel
                    </button>
                    
                    <div className="flex items-center gap-4">
                        {selectedDates.length > 0 && (
                            <div className="text-right">
                                <p className="text-xs text-neutrals-06">Selected Range</p>
                                <p className="font-semibold text-shades-black">{formatSelectedRange()}</p>
                            </div>
                        )}
                        <button 
                            onClick={handleSubmit}
                            disabled={selectedDates.length === 0}
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
