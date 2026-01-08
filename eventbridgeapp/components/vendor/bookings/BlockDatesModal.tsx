'use client';

import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import Calendar from '@/components/ui/Calendar';

interface BlockDatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (blockData: BlockDatesData) => void;
    existingBlockedDates?: Date[];
}

interface BlockDatesData {
    startDate: Date | null;
    endDate: Date | null;
    reason: string;
    isRecurring: boolean;
    internalNote: string;
}

const blockReasons = [
    { value: 'personal', label: 'Personal Leave' },
    { value: 'vacation', label: 'Vacation' },
    { value: 'maintenance', label: 'Equipment Maintenance' },
    { value: 'booked', label: 'Already Booked' },
    { value: 'unavailable', label: 'Service Unavailable' },
    { value: 'other', label: 'Other' },
];

export default function BlockDatesModal({ isOpen, onClose, onSubmit, existingBlockedDates = [] }: BlockDatesModalProps) {
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
    const [reason, setReason] = useState('other');
    const [isRecurring, setIsRecurring] = useState(false);
    const [internalNote, setInternalNote] = useState('');
    const [showReasonDropdown, setShowReasonDropdown] = useState(false);

    const octoberMonth = new Date(2023, 9, 1); // October 2023
    const novemberMonth = new Date(2023, 10, 1); // November 2023

    // Mock some existing blocked dates for demo
    const mockBlockedDates = [
        new Date(2023, 9, 9),  // Oct 9
        new Date(2023, 9, 10), // Oct 10
        new Date(2023, 9, 11), // Oct 11
    ];

    // Mock some existing bookings for demo
    const mockBookedDates = [
        new Date(2023, 9, 5),  // Oct 5
        new Date(2023, 9, 24), // Oct 24
        new Date(2023, 9, 25), // Oct 25
        new Date(2023, 9, 26), // Oct 26
        new Date(2023, 10, 15), // Nov 15
    ];

    const handleDateRangeSelect = (startDate: Date | null, endDate: Date | null) => {
        setSelectedStartDate(startDate);
        setSelectedEndDate(endDate);
    };

    const formatDateRange = () => {
        if (!selectedStartDate) return 'Select dates to block';
        if (!selectedEndDate) return selectedStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const start = selectedStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const end = selectedEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        if (selectedStartDate.getTime() === selectedEndDate.getTime()) {
            return start;
        }
        return `${start} - ${end}`;
    };

    const getSelectedReason = () => {
        return blockReasons.find(r => r.value === reason)?.label || 'Other';
    };

    const handleSubmit = () => {
        if (!selectedStartDate) return;

        const blockData: BlockDatesData = {
            startDate: selectedStartDate,
            endDate: selectedEndDate,
            reason,
            isRecurring,
            internalNote,
        };

        onSubmit?.(blockData);
        handleCancel();
    };

    const handleCancel = () => {
        setSelectedStartDate(null);
        setSelectedEndDate(null);
        setReason('other');
        setIsRecurring(false);
        setInternalNote('');
        setShowReasonDropdown(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutrals-03">
                    <h2 className="text-xl font-semibold text-shades-black">Block Dates</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-neutrals-02 rounded-md transition-colors"
                    >
                        <X size={20} className="text-neutrals-06" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Date Selection Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-medium text-shades-black mb-4">Select dates to block</h3>
                        
                        {/* Legend */}
                        <div className="flex items-center justify-end gap-4 mb-4 text-sm">
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

                        {/* Dual Calendar View */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <Calendar
                                    currentMonth={octoberMonth}
                                    bookedDates={mockBookedDates}
                                    blockedDates={[...mockBlockedDates, ...existingBlockedDates]}
                                    allowRange={true}
                                    selectedStartDate={selectedStartDate}
                                    selectedEndDate={selectedEndDate}
                                    onDateRangeSelect={handleDateRangeSelect}
                                />
                            </div>
                            <div>
                                <Calendar
                                    currentMonth={novemberMonth}
                                    bookedDates={mockBookedDates}
                                    blockedDates={[...mockBlockedDates, ...existingBlockedDates]}
                                    allowRange={true}
                                    selectedStartDate={selectedStartDate}
                                    selectedEndDate={selectedEndDate}
                                    onDateRangeSelect={handleDateRangeSelect}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Block Details Form */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Reason for blocking */}
                        <div>
                            <label className="block text-sm font-medium text-shades-black mb-2">
                                Reason for blocking
                            </label>
                            <div className="relative">
                                <button
                                    onClick={() => setShowReasonDropdown(!showReasonDropdown)}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-neutrals-03 rounded-lg hover:border-neutrals-04 transition-colors text-left"
                                >
                                    <span className="text-shades-black">{getSelectedReason()}</span>
                                    <ChevronDown 
                                        size={16} 
                                        className={`text-neutrals-06 transition-transform ${showReasonDropdown ? 'rotate-180' : ''}`} 
                                    />
                                </button>

                                {showReasonDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowReasonDropdown(false)} />
                                        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-neutrals-03 rounded-lg shadow-lg z-20 py-1">
                                            {blockReasons.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setReason(option.value);
                                                        setShowReasonDropdown(false);
                                                    }}
                                                    className={`w-full px-4 py-2 text-sm text-left hover:bg-neutrals-02 transition-colors ${
                                                        reason === option.value ? 'text-primary-01 font-medium' : 'text-shades-black'
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Internal Note */}
                        <div>
                            <label className="block text-sm font-medium text-shades-black mb-2">
                                Add internal note (optional)
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Add details about why these dates are unavailable..."
                                value={internalNote}
                                onChange={(e) => setInternalNote(e.target.value)}
                                className="w-full px-4 py-3 border border-neutrals-03 rounded-lg focus:outline-none focus:border-primary-01 text-sm resize-none"
                            />
                        </div>
                    </div>

                    {/* Recurring Option */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={isRecurring}
                                        onChange={(e) => setIsRecurring(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-11 h-6 rounded-full transition-colors ${
                                        isRecurring ? 'bg-primary-01' : 'bg-neutrals-04'
                                    }`}>
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform transform ${
                                            isRecurring ? 'translate-x-5' : 'translate-x-0.5'
                                        } mt-0.5`} />
                                    </div>
                                </div>
                                <div>
                                    <div className="font-medium text-shades-black">Make recurring</div>
                                    <div className="text-sm text-neutrals-06">Repeat this block periodically</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-6 border-t border-neutrals-03">
                        <button
                            onClick={handleCancel}
                            className="px-6 py-3 text-sm font-medium text-neutrals-06 hover:text-shades-black transition-colors"
                        >
                            Cancel
                        </button>
                        
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-sm text-neutrals-06">Selected Range</div>
                                <div className="font-medium text-shades-black">{formatDateRange()}</div>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={!selectedStartDate}
                                className="px-6 py-3 bg-primary-01 text-white text-sm font-medium rounded-lg hover:bg-primary-01/90 transition-colors disabled:bg-neutrals-04 disabled:cursor-not-allowed"
                            >
                                Block Dates
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}