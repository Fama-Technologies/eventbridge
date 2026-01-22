"use client"
import { useState, useEffect } from "react"
import { format } from "date-fns";
import { useToast } from "@/components/ui/toast";
import CalendarHeader from "./calendarheader";
import Calendar from "./calendar";
import BookingSidebar from "./sidebar";
import BookingModal from "../BookingModal";
import BlockDatesModal from "./BlockDatesModal";
import BookingDetailsModal from "./BookingDetailsModal";
import type { Booking } from "./data";

export default function BookingUI() {
    const { addToast } = useToast();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [blockedDates, setBlockedDates] = useState<Date[]>([]); // This might need to be derived from bookings if API returns blocked dates as bookings
    const [confirmedBookings, setConfirmedBookings] = useState(0);
    const [currentDate, setCurrentDate] = useState(new Date()); // Defaults to today
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isBlockDatesModalOpen, setIsBlockDatesModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Bookings
    useEffect(() => {
        async function fetchBookings() {
            setIsLoading(true);
            try {
                const response = await fetch('/api/vendor/bookings');
                if (response.ok) {
                    const data = await response.json();
                    const bookingsList = data.bookings || [];
                    setBookings(bookingsList);
                    // Update confirmed count
                    setConfirmedBookings(bookingsList.filter((b: Booking) => b.status === 'confirmed').length);
                }
            } catch (error) {
                console.error("Failed to fetch bookings:", error);
                addToast("Failed to load bookings", "error");
            } finally {
                setIsLoading(false);
            }
        }
        fetchBookings();
    }, [addToast]);

    // Removed sidebarOpen state as requested to always show sidebar

    const handleAddBooking = () => {
        setIsBookingModalOpen(true);
    };

    const handleBlockDates = () => {
        setIsBlockDatesModalOpen(true);
    };

    const handleBookingSubmit = async (bookingData: any) => {
        try {
            console.log("Original booking data from modal:", bookingData);
            
            // Transform the data to match what the API expects
            // You need to add vendorId and clientId - these should come from your auth/session
            const transformedData = {
                clientName: bookingData.clientName,
                clientEmail: bookingData.clientEmail || '',
                clientPhone: bookingData.clientPhone || '',
                eventName: bookingData.eventName || `${bookingData.clientName}'s Event`,
                startDate: bookingData.startDate,
                endDate: bookingData.endDate,
                venue: bookingData.venue,
                guestCount: bookingData.guestCount || 0,
                totalAmount: bookingData.totalAmount || 0,
                status: bookingData.status || 'confirmed',
                paymentStatus: bookingData.paymentStatus || 'pending',
                notes: bookingData.notes || '',
                
                // TODO: Replace these with actual IDs from your auth/session
                // For now, using placeholder IDs. In production, get these from:
                // 1. vendorId: from your logged-in vendor's session
                // 2. clientId: either from existing client or create a new user
                vendorId: 1, // Replace with: await getCurrentVendorId()
                clientId: 2, // Replace with: await getOrCreateClientId(bookingData)
            };

            console.log("Transformed booking data for API:", transformedData);

            const response = await fetch('/api/vendor/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transformedData)
            });

            console.log("Response status:", response.status);
            
            if (response.ok) {
                const newBooking = await response.json();
                console.log("New booking created:", newBooking);
                
                setBookings([...bookings, newBooking]);
                if (newBooking.status === 'confirmed') {
                    setConfirmedBookings(prev => prev + 1);
                }
                setIsBookingModalOpen(false);
                addToast("Booking successfully created", "success");
            } else {
                const errorText = await response.text();
                console.error("Failed response:", errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    addToast(`Failed to create booking: ${errorData.error || 'Unknown error'}`, "error");
                } catch {
                    addToast(`Failed to create booking: ${errorText || 'Unknown error'}`, "error");
                }
            }
        } catch (error) {
            console.error("Error creating booking:", error);
            addToast("Error creating booking", "error");
        }
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