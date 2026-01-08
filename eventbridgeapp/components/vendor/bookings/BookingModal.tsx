'use client';

import { useState } from 'react';
import { X, Users, Calendar as CalendarIcon } from 'lucide-react';
import Calendar from '@/components/ui/Calendar';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (bookingData: BookingFormData) => void;
    existingBookings?: Date[];
    blockedDates?: Date[];
}

export interface BookingFormData {
    startDate: Date | null;
    endDate: Date | null;
    eventName: string;
    guestCount: number;
    totalAmount: number;
    hostContact: string;
    notes: string;
}

export default function BookingModal({ isOpen, onClose, onSubmit, existingBookings = [], blockedDates = [] }: BookingModalProps) {
    const [currentView, setCurrentView] = useState<'october' | 'november'>('october');
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
    const [eventName, setEventName] = useState('');
    const [guestCount, setGuestCount] = useState<number>(0);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [hostContact, setHostContact] = useState('');
    const [notes, setNotes] = useState('');

    // Mock booked dates for October 2023
    const octoberBookedDates = [
        new Date(2023, 9, 5), // Oct 5
        new Date(2023, 9, 9),
        new Date(2023, 9, 10),
        new Date(2023, 9, 11),
    ];

    // Mock booked dates for November 2023  
    const novemberBookedDates = [
        new Date(2023, 10, 15), // Nov 15
    ];

    const octoberMonth = new Date(2023, 9, 1); // October 2023
    const novemberMonth = new Date(2023, 10, 1); // November 2023

    const handleDateRangeSelect = (startDate: Date | null, endDate: Date | null) => {
        setSelectedStartDate(startDate);
        setSelectedEndDate(endDate);
    };

    const formatDateRange = () => {
        if (!selectedStartDate) return 'Select dates';
        if (!selectedEndDate) return `${selectedStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ...`;
        
        const start = selectedStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const end = selectedEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        if (selectedStartDate.getTime() === selectedEndDate.getTime()) {
            return start;
        }
        return `${start} - ${end}`;
    };

    const handleSubmit = () => {
        if (!selectedStartDate || !eventName || guestCount === 0) {
            return; // Basic validation
        }

        const bookingData: BookingFormData = {
            startDate: selectedStartDate,
            endDate: selectedEndDate,
            eventName,
            guestCount,
            totalAmount,
            hostContact,
            notes,
        };

        onSubmit?.(bookingData);
        onClose();
    };

    const handleCancel = () => {
        // Reset form
        setSelectedStartDate(null);
        setSelectedEndDate(null);
        setEventName('');
        setGuestCount(0);
        setTotalAmount(0);
        setHostContact('');
        setNotes('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutrals-03">
                    <h2 className="text-xl font-semibold text-shades-black">Booking</h2>
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
                        <h3 className="text-lg font-medium text-shades-black mb-4">Select dates to book</h3>
                        
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
                                    bookedDates={octoberBookedDates}
                                    blockedDates={blockedDates}
                                    allowRange={true}
                                    selectedStartDate={selectedStartDate}
                                    selectedEndDate={selectedEndDate}
                                    onDateRangeSelect={handleDateRangeSelect}
                                />
                            </div>
                            <div>
                                <Calendar
                                    currentMonth={novemberMonth}
                                    bookedDates={novemberBookedDates}
                                    blockedDates={blockedDates}
                                    allowRange={true}
                                    selectedStartDate={selectedStartDate}
                                    selectedEndDate={selectedEndDate}
                                    onDateRangeSelect={handleDateRangeSelect}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Booking Details Form */}
                    <div className="space-y-6">
                        {/* Event Name */}
                        <div>
                            <label htmlFor="eventName" className="block text-sm font-medium text-shades-black mb-2">
                                EVENT NAME
                            </label>
                            <input
                                id="eventName"
                                type="text"
                                placeholder="e.g. Corporate Annual Gala"
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                                className="w-full px-4 py-3 border border-neutrals-03 rounded-lg focus:outline-none focus:border-primary-01 text-sm"
                            />
                        </div>

                        {/* Guest Count and Total Amount */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="guestCount" className="block text-sm font-medium text-shades-black mb-2">
                                    GUEST COUNT
                                </label>
                                <div className="relative">
                                    <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutrals-05" />
                                    <input
                                        id="guestCount"
                                        type="number"
                                        placeholder="0"
                                        value={guestCount || ''}
                                        onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
                                        className="w-full pl-10 pr-4 py-3 border border-neutrals-03 rounded-lg focus:outline-none focus:border-primary-01 text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="totalAmount" className="block text-sm font-medium text-shades-black mb-2">
                                    TOTAL AMOUNT
                                </label>
                                <input
                                    id="totalAmount"
                                    type="text"
                                    placeholder="UGX 0.00"
                                    value={totalAmount ? `UGX ${totalAmount.toLocaleString()}.00` : ''}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^\d]/g, '');
                                        setTotalAmount(parseInt(value) || 0);
                                    }}
                                    className="w-full px-4 py-3 border border-neutrals-03 rounded-lg focus:outline-none focus:border-primary-01 text-sm"
                                />
                            </div>
                        </div>

                        {/* Host Contact */}
                        <div>
                            <label htmlFor="hostContact" className="block text-sm font-medium text-shades-black mb-2">
                                HOST CONTACT
                            </label>
                            <input
                                id="hostContact"
                                type="text"
                                placeholder="Name, Email or Phone Number"
                                value={hostContact}
                                onChange={(e) => setHostContact(e.target.value)}
                                className="w-full px-4 py-3 border border-neutrals-03 rounded-lg focus:outline-none focus:border-primary-01 text-sm"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-shades-black mb-2">
                                NOTES / DESCRIPTION
                            </label>
                            <textarea
                                id="notes"
                                rows={4}
                                placeholder="Add any specific details about this booking..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-4 py-3 border border-neutrals-03 rounded-lg focus:outline-none focus:border-primary-01 text-sm resize-none"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutrals-03">
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
                                disabled={!selectedStartDate || !eventName || guestCount === 0}
                                className="px-6 py-3 bg-primary-01 text-white text-sm font-medium rounded-lg hover:bg-primary-01/90 transition-colors disabled:bg-neutrals-04 disabled:cursor-not-allowed"
                            >
                                Create Booking
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}