'use client';

import { useState } from 'react';
import { ChevronDown, Search, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import BookingCard from '@/components/vendor/bookings/BookingCard';
import type { Booking, BookingStatus } from '@/components/vendor/bookings/BookingCard';

// Mock data for bookings
const mockBookings: Booking[] = [
    {
        id: '1',
        name: 'David Park',
        initials: 'DP',
        avatar: '/avatars/david.jpg',
        eventType: 'Product Launch',
        eventDate: 'Apr 5, 2025',
        eventTime: '10:00 AM - 6:00 PM',
        location: 'San Francisco, CA',
        guests: 80,
        totalAmount: '15,000',
        paidAmount: '7,500',
        status: 'upcoming',
        bookedAt: '3 days ago',
        paymentStatus: 'partial',
    },
    {
        id: '2',
        name: 'Sarah Chen',
        initials: 'SC',
        avatar: '/avatars/sarah.jpg',
        eventType: 'Corporate Retreat',
        eventDate: 'Mar 15-17, 2025',
        eventTime: '9:00 AM Start',
        location: 'Napa Valley, CA',
        guests: 45,
        totalAmount: '12,000',
        status: 'in_progress',
        bookedAt: '1 week ago',
        paymentStatus: 'paid',
    },
    {
        id: '3',
        name: 'Emily Thompson',
        initials: 'ET',
        avatar: '/avatars/emily.jpg',
        eventType: 'Birthday Celebration',
        eventDate: 'Mar 8, 2025',
        eventTime: '7:00 PM - 11:00 PM',
        location: 'Los Angeles, CA',
        guests: 35,
        totalAmount: '5,500',
        status: 'completed',
        bookedAt: '2 weeks ago',
        paymentStatus: 'paid',
    },
    {
        id: '4',
        name: 'Michael Rodriguez',
        initials: 'MR',
        avatar: '/avatars/michael.jpg',
        eventType: 'Wedding Reception',
        eventDate: 'Feb 22, 2025',
        eventTime: '4:00 PM - 12:00 AM',
        location: 'Santa Barbara, CA',
        guests: 120,
        totalAmount: '18,000',
        status: 'completed',
        bookedAt: '1 month ago',
        paymentStatus: 'paid',
    },
    {
        id: '5',
        name: 'Jennifer Wilson',
        initials: 'JW',
        eventType: 'Anniversary Party',
        eventDate: 'Feb 14, 2025',
        eventTime: '6:00 PM - 10:00 PM',
        location: 'San Diego, CA',
        guests: 60,
        totalAmount: '8,000',
        status: 'cancelled',
        bookedAt: '1 month ago',
    },
];

const statusOptions = [
    { value: 'all', label: 'All Bookings' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'this_month', label: 'This Month' },
    { value: 'next_month', label: 'Next Month' },
    { value: 'this_quarter', label: 'This Quarter' },
    { value: 'this_year', label: 'This Year' },
];

const sortOptions = [
    { value: 'date_asc', label: 'Date: Soonest First' },
    { value: 'date_desc', label: 'Date: Latest First' },
    { value: 'amount_high', label: 'Amount: High to Low' },
    { value: 'amount_low', label: 'Amount: Low to High' },
];

interface DropdownProps {
    label: string;
    icon?: React.ReactNode;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
}

function FilterDropdown({ label, icon, options, value, onChange }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-shades-white border border-neutrals-03 rounded-lg hover:border-neutrals-04 transition-colors"
            >
                {icon}
                <span className="text-sm text-shades-black">{selectedOption?.label || label}</span>
                <ChevronDown size={16} className={`text-neutrals-06 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-48 bg-shades-white border border-neutrals-03 rounded-lg shadow-lg z-20 py-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-2 text-sm text-left hover:bg-neutrals-02 transition-colors ${
                                    value === option.value ? 'text-primary-01 font-medium' : 'text-shades-black'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function BookingsPage() {
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_asc');

    // Calculate stats
    const upcomingCount = mockBookings.filter(b => b.status === 'upcoming').length;
    const inProgressCount = mockBookings.filter(b => b.status === 'in_progress').length;
    const totalRevenue = mockBookings
        .filter(b => b.status !== 'cancelled')
        .reduce((sum, b) => sum + parseInt(b.totalAmount.replace(/,/g, '')), 0);

    // Filter bookings
    const filteredBookings = mockBookings.filter(booking => {
        if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
        return true;
    });

    const handleViewDetails = (booking: Booking) => {
        console.log('View details:', booking.id);
    };

    const handleMessage = (booking: Booking) => {
        console.log('Message:', booking.id);
    };

    const handleCancel = (booking: Booking) => {
        console.log('Cancel booking:', booking.id);
    };

    const handleMarkComplete = (booking: Booking) => {
        console.log('Mark complete:', booking.id);
    };

    return (
        <div className="min-h-screen bg-neutrals-01">
            {/* Header */}
            <div className="p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-shades-black">Bookings</h1>
                        <p className="text-sm text-neutrals-06 mt-1">
                            {upcomingCount} upcoming, {inProgressCount} in progress
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutrals-05" />
                        <input
                            type="text"
                            placeholder="Search bookings..."
                            className="pl-10 pr-4 py-2.5 bg-shades-white border border-neutrals-03 rounded-lg text-sm focus:outline-none focus:border-primary-01 w-full sm:w-64"
                        />
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-shades-white rounded-xl border border-neutrals-03 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-neutrals-06">Upcoming Bookings</span>
                            <Calendar size={18} className="text-accents-info" />
                        </div>
                        <p className="text-2xl font-bold text-shades-black mt-2">{upcomingCount}</p>
                    </div>
                    <div className="bg-shades-white rounded-xl border border-neutrals-03 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-neutrals-06">In Progress</span>
                            <TrendingUp size={18} className="text-accents-pending" />
                        </div>
                        <p className="text-2xl font-bold text-shades-black mt-2">{inProgressCount}</p>
                    </div>
                    <div className="bg-shades-white rounded-xl border border-neutrals-03 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-neutrals-06">Total Revenue</span>
                            <DollarSign size={18} className="text-accents-discount" />
                        </div>
                        <p className="text-2xl font-bold text-shades-black mt-2">${totalRevenue.toLocaleString()}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <FilterDropdown
                        label="Status"
                        options={statusOptions}
                        value={statusFilter}
                        onChange={setStatusFilter}
                    />
                    <FilterDropdown
                        label="Date Range"
                        icon={<Calendar size={16} className="text-neutrals-06" />}
                        options={dateRangeOptions}
                        value={dateFilter}
                        onChange={setDateFilter}
                    />
                    <div className="ml-auto">
                        <FilterDropdown
                            label="Sort by"
                            options={sortOptions}
                            value={sortBy}
                            onChange={setSortBy}
                        />
                    </div>
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            onViewDetails={handleViewDetails}
                            onMessage={handleMessage}
                            onCancel={handleCancel}
                            onMarkComplete={handleMarkComplete}
                        />
                    ))}
                </div>

                {/* Load More */}
                {filteredBookings.length > 0 && (
                    <div className="mt-6 text-center">
                        <button className="px-6 py-2.5 text-sm font-medium text-primary-01 hover:bg-primary-01/10 rounded-lg transition-colors">
                            Load more bookings
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {filteredBookings.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-neutrals-02 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar size={24} className="text-neutrals-05" />
                        </div>
                        <h3 className="text-lg font-semibold text-shades-black mb-2">No bookings found</h3>
                        <p className="text-sm text-neutrals-06">
                            Try adjusting your filters to find more bookings.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}   