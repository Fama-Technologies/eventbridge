'use client';

import { useState } from 'react';
import { 
    ChevronDown, 
    Search, 
    Calendar, 
    DollarSign, 
    TrendingUp, 
    Plus,
    ChevronLeft,
    ChevronRight,
    Ban
} from 'lucide-react';
import BookingCard from '@/components/vendor/bookings/BookingCard';
import BookingModal from '@/components/vendor/bookings/BookingModal';
import BookingDetailsModal from '@/components/vendor/bookings/BookingDetailsModal';
import BlockDatesModal from '@/components/vendor/bookings/BlockDatesModal';
import type { Booking, BookingStatus } from '@/components/vendor/bookings/BookingCard';
import type { DetailedBooking } from '@/components/vendor/bookings/BookingDetailsModal';

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
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
    const [currentMonth, setCurrentMonth] = useState(new Date(2023, 9, 1)); // October 2023
    
    // Modal states
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showBlockDatesModal, setShowBlockDatesModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

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
        setSelectedBooking(booking);
        setShowDetailsModal(true);
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

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
        setCurrentMonth(newMonth);
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Calendar view with bookings
    const getBookingsForDate = (date: Date) => {
        return mockBookings.filter(booking => {
            const bookingDate = new Date(booking.eventDate);
            return (
                date.getDate() === bookingDate.getDate() &&
                date.getMonth() === bookingDate.getMonth() &&
                date.getFullYear() === bookingDate.getFullYear()
            );
        });
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
        <div className="min-h-screen bg-neutrals-01">
            <div className="flex">
                {/* Main Content */}
                <div className="flex-1 p-6 lg:p-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-shades-black">Bookings</h1>
                            <p className="text-sm text-neutrals-06 mt-1">
                                You have <span className="text-primary-01 font-medium">{upcomingCount} confirmed bookings</span> in your calendar.
                            </p>
                        </div>

                        {/* Header Actions */}
                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 text-sm font-medium text-shades-black bg-shades-white border border-neutrals-04 rounded-lg hover:bg-neutrals-02 transition-colors">
                                Today
                            </button>
                            <div className="flex items-center bg-neutrals-02 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('calendar')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                        viewMode === 'calendar' ? 'bg-white text-shades-black shadow-sm' : 'text-neutrals-06'
                                    }`}
                                >
                                    Calendar
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                        viewMode === 'list' ? 'bg-white text-shades-black shadow-sm' : 'text-neutrals-06'
                                    }`}
                                >
                                    List
                                </button>
                            </div>
                            <button
                                onClick={() => setShowBookingModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-01 text-white text-sm font-medium rounded-lg hover:bg-primary-01/90 transition-colors"
                            >
                                <Plus size={16} />
                                Add Bookings
                            </button>
                        </div>
                    </div>

                    {/* Calendar View */}
                    {viewMode === 'calendar' && (
                        <>
                            {/* Calendar Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => navigateMonth('prev')}
                                        className="p-2 hover:bg-neutrals-02 rounded-lg transition-colors"
                                    >
                                        <ChevronLeft size={20} className="text-neutrals-06" />
                                    </button>
                                    <h2 className="text-xl font-semibold text-shades-black">
                                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                    </h2>
                                    <button
                                        onClick={() => navigateMonth('next')}
                                        className="p-2 hover:bg-neutrals-02 rounded-lg transition-colors"
                                    >
                                        <ChevronRight size={20} className="text-neutrals-06" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <div className="w-3 h-3 rounded-sm bg-accents-discount"></div>
                                        <span className="text-neutrals-06">Confirmed</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <div className="w-3 h-3 rounded-sm bg-accents-pending"></div>
                                        <span className="text-neutrals-06">Pending</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <div className="w-3 h-3 rounded-sm bg-errors-main"></div>
                                        <span className="text-neutrals-06">Blocked</span>
                                    </div>
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            <div className="bg-white rounded-lg border border-neutrals-03">
                                {/* Day Headers */}
                                <div className="grid grid-cols-7 border-b border-neutrals-03">
                                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                                        <div key={day} className="p-4 text-xs font-medium text-neutrals-06 text-center">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Days */}
                                <div className="grid grid-cols-7">
                                    {days.map((dayInfo, index) => {
                                        const { date, isCurrentMonth } = dayInfo;
                                        const dayBookings = getBookingsForDate(date);
                                        const isToday = date.toDateString() === new Date().toDateString();

                                        return (
                                            <div
                                                key={index}
                                                className={`min-h-[120px] p-2 border-r border-b border-neutrals-03 ${
                                                    !isCurrentMonth ? 'bg-neutrals-01' : 'bg-white'
                                                } ${index % 7 === 6 ? 'border-r-0' : ''} last:border-b-0`}
                                            >
                                                <div className={`text-sm mb-2 ${
                                                    !isCurrentMonth ? 'text-neutrals-04' : isToday ? 'text-primary-01 font-semibold' : 'text-shades-black'
                                                }`}>
                                                    {date.getDate()}
                                                </div>

                                                <div className="space-y-1">
                                                    {dayBookings.slice(0, 2).map((booking) => (
                                                        <button
                                                            key={booking.id}
                                                            onClick={() => handleViewDetails(booking)}
                                                            className={`w-full text-left text-xs p-1.5 rounded text-white truncate ${
                                                                booking.status === 'upcoming' ? 'bg-accents-info' :
                                                                booking.status === 'confirmed' ? 'bg-accents-discount' :
                                                                booking.status === 'in_progress' ? 'bg-accents-pending' :
                                                                'bg-neutrals-05'
                                                            }`}
                                                        >
                                                            {booking.eventType}
                                                        </button>
                                                    ))}
                                                    {dayBookings.length > 2 && (
                                                        <div className="text-xs text-neutrals-06">
                                                            +{dayBookings.length - 2} more
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                    {/* List View */}
                    {viewMode === 'list' && (
                        <>
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
                        </>
                    )}
                </div>

                {/* Sidebar */}
                <div className="w-80 bg-white border-l border-neutrals-03 p-6">
                    {/* Upcoming Section */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-shades-black">Upcoming</h3>
                            <span className="text-sm text-neutrals-06">Past</span>
                            <span className="text-sm text-neutrals-06">All</span>
                        </div>
                    </div>

                    {/* Upcoming Bookings List */}
                    <div className="space-y-4">
                        {mockBookings.filter(b => b.status === 'upcoming').map((booking) => (
                            <div key={booking.id} className="group cursor-pointer">
                                <div className="flex items-center gap-1 text-xs text-neutrals-06 mb-1">
                                    <span className="w-2 h-2 bg-accents-discount rounded-full"></span>
                                    <span>Confirmed</span>
                                    <span className="ml-auto">{booking.eventDate}</span>
                                </div>
                                
                                <div className="bg-white border border-neutrals-03 rounded-lg p-3 group-hover:border-primary-01 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-neutrals-02 flex items-center justify-center text-xs font-semibold">
                                            {booking.initials || booking.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm text-shades-black truncate">
                                                {booking.eventType}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-neutrals-06">
                                                <span>{booking.guests} Guests</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right mt-2">
                                        <div className="font-semibold text-shades-black">UGX {booking.totalAmount}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sync Calendar Button */}
                    <button className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-neutrals-02 text-shades-black rounded-lg hover:bg-neutrals-03 transition-colors">
                        <Calendar size={16} />
                        Sync Google Calendar
                    </button>

                    {/* Block Dates Button */}
                    <button
                        onClick={() => setShowBlockDatesModal(true)}
                        className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 bg-errors-bg text-errors-main border border-errors-main/20 rounded-lg hover:bg-errors-main hover:text-white transition-colors"
                    >
                        <Ban size={16} />
                        Block Dates
                    </button>
                </div>
            </div>

            {/* Modals */}
            <BookingModal
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
            />

            <BookingDetailsModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                booking={selectedBooking ? {
                    id: selectedBooking.id,
                    status: 'confirmed' as const,
                    bookingNumber: '#BK-9281-2023',
                    eventName: selectedBooking.eventType,
                    client: {
                        name: selectedBooking.name,
                        avatar: selectedBooking.avatar,
                        rating: 5.0,
                        reviewCount: 2,
                    },
                    dateRange: {
                        startDate: new Date(selectedBooking.eventDate),
                        endDate: new Date(selectedBooking.eventDate),
                        timeRange: selectedBooking.eventTime || '10:00 AM - 6:00 PM',
                    },
                    guests: selectedBooking.guests,
                    location: selectedBooking.location || 'Event Location',
                    totalAmount: parseInt(selectedBooking.totalAmount.replace(/,/g, '')),
                    paymentDetails: {
                        status: 'deposit_paid' as const,
                        items: [
                            { name: 'Service Package', amount: parseInt(selectedBooking.totalAmount.replace(/,/g, '')) * 0.7 },
                            { name: 'Additional Services', amount: parseInt(selectedBooking.totalAmount.replace(/,/g, '')) * 0.2 },
                            { name: 'Service Fee', amount: parseInt(selectedBooking.totalAmount.replace(/,/g, '')) * 0.1 },
                        ],
                        paidAmount: selectedBooking.paidAmount ? parseInt(selectedBooking.paidAmount.replace(/,/g, '')) : 0,
                        balanceAmount: parseInt(selectedBooking.totalAmount.replace(/,/g, '')) - (selectedBooking.paidAmount ? parseInt(selectedBooking.paidAmount.replace(/,/g, '')) : 0),
                        paidDate: 'Sep 12',
                        balanceDate: 'Oct 24',
                    },
                } : undefined}
                onMessageClient={() => console.log('Message client')}
                onSendReceipt={() => console.log('Send receipt')}
            />

            <BlockDatesModal
                isOpen={showBlockDatesModal}
                onClose={() => setShowBlockDatesModal(false)}
            />
        </div>
    );
}   