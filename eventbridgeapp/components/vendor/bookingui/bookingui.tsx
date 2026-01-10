"use client"
import { useState } from "react"
import { format } from "date-fns";
import { useToast } from "@/components/ui/toast";
import CalendarHeader from "./calendarheader";
import Calendar from "./calendar";
import BookingSidebar from "./sidebar";
import BookingModal from "../BookingModal";
import BlockDatesModal from "./BlockDatesModal";
import BookingDetailsModal from "./BookingDetailsModal";
import { bookingsData, blockedDatesData } from "./data";
import type { Booking } from "./data";

export default function BookingUI() {
    const { addToast } = useToast();
    const [bookings, setBookings] = useState<Booking[]>(bookingsData);
    const [blockedDates, setBlockedDates] = useState<Date[]>(blockedDatesData);
    const [confirmedBookings, setConfirmedBookings] = useState(3);
    const [currentDate, setCurrentDate] = useState(new Date()); // Defaults to today
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isBlockDatesModalOpen, setIsBlockDatesModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    // Removed sidebarOpen state as requested to always show sidebar

    const handleAddBooking = () => {
        setIsBookingModalOpen(true);
    };

    const handleBlockDates = () => {
        setIsBlockDatesModalOpen(true);
    };

    const handleBookingSubmit = (bookingData: any) => {
        // Create new booking object
        const startDate = bookingData.selectedDates[0];
        const endDate = bookingData.selectedDates[bookingData.selectedDates.length - 1];

        const newBooking: Booking = {
            id: Date.now().toString(),
            bookingId: `BK-${Math.floor(Math.random() * 10000)}`,
            title: bookingData.eventName,
            status: 'confirmed',
            date: startDate,
            startDate: startDate,
            endDate: endDate,
            initials: bookingData.hostContact ? bookingData.hostContact.substring(0, 2).toUpperCase() : "NA",
            dateDisplay: format(startDate, "MMM d"),
            client: {
                name: bookingData.hostContact || "Unknown Client",
                avatar: undefined,
                rating: 5.0,
                reviews: 0
            },
            guestCount: bookingData.guestCount,
            totalAmount: bookingData.totalAmount,
            venue: "Venue TBD",
            dateRange: `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`,
            timeRange: "09:00 AM - 05:00 PM", // Default
            paymentStatus: "Pending",
            payments: [
                { label: "Total Estimate", amount: bookingData.totalAmount, type: 'due' }
            ],
            latestMessage: undefined
        };

        setBookings([...bookings, newBooking]);
        setConfirmedBookings(prev => prev + 1);
        setIsBookingModalOpen(false);
        addToast("Booking successfully created", "success");
    };

    const handleBlockDatesSubmit = (dates: Date[], reason: string, note: string, recurring: boolean) => {
        if (dates.length === 0) return;

        // Add to blocked dates array (for logic)
        setBlockedDates([...blockedDates, ...dates]);

        // Add visual representation as a "blocked" booking
        const startDate = dates[0];
        const endDate = dates[dates.length - 1];

        const blockedBooking: Booking = {
            id: Date.now().toString(),
            bookingId: `BLK-${Math.floor(Math.random() * 10000)}`,
            title: `Blocked: ${reason}`,
            status: 'blocked',
            date: startDate,
            startDate: startDate,
            endDate: endDate,
            initials: "BL",
            dateDisplay: format(startDate, "MMM d"),
            client: { name: "System Block", rating: 0, reviews: 0 },
            guestCount: 0,
            totalAmount: 0,
            venue: "N/A",
            dateRange: `${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}`,
            timeRange: "All Day",
            paymentStatus: "N/A",
            payments: []
        };

        setBookings([...bookings, blockedBooking]);
        setIsBlockDatesModalOpen(false);
        addToast("Dates blocked successfully", "success");
    };

    const handleSelectBooking = (booking: Booking) => {
        setSelectedBooking(booking);
    };

    return (
        <div className="min-h-screen bg-neutrals-01">
            {/* Header Section */}
            <div className="mb-6">
                <h1 className="text-shades-black font-bold text-2xl md:text-3xl mb-2">
                    Bookings
                </h1>
                <p className="text-base md:text-lg text-neutrals-07">
                    You have <span className="text-primary-01 font-semibold">{confirmedBookings} confirmed bookings</span> in your calendar.
                </p>
            </div>

            {/* Calendar Header */}
            <CalendarHeader
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                onAddBooking={handleAddBooking}
                onBlockDates={handleBlockDates}
            />

            {/* Responsive Calendar Layout */}
            <div className="mt-6 flex flex-col lg:flex-row gap-6">
                {/* Main Calendar */}
                <div className="flex-1 min-w-0">
                    <Calendar
                        currentDate={currentDate}
                        bookings={bookings}
                        onSelectBooking={handleSelectBooking}
                    />
                </div>

                {/* Sidebar - Always visible (below calendar on mobile, right side on desktop) */}
                <div className="w-full lg:w-80 flex-shrink-0">
                    <BookingSidebar
                        bookings={bookings}
                        blockedDates={blockedDates}
                        onBlockDates={(dates) => handleBlockDatesSubmit(dates, "Manual", "", false)}
                        onSelectBooking={handleSelectBooking}
                    />
                </div>
            </div>

            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                onSubmit={handleBookingSubmit}
                bookings={bookings}
            />

            {/* Block Dates Modal */}
            <BlockDatesModal
                isOpen={isBlockDatesModalOpen}
                onClose={() => setIsBlockDatesModalOpen(false)}
                onBlockDates={handleBlockDatesSubmit}
                bookings={bookings}
            />

            {/* Booking Details Modal */}
            {selectedBooking && (
                <BookingDetailsModal
                    isOpen={!!selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    booking={selectedBooking as any}
                />
            )}
        </div>
    )
}