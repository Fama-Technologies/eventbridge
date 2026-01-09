"use client"
import { useState } from "react"
import CalendarHeader from "./calenderheader";
import Calender from "./calender";
import BookingSidebar from "./sidebar";
import BookingModal from "../BookingModal";

export default function BookingUI() {
    const [confirmedBookings, setConfirmedBookings] = useState(3);
    const [currentDate, setCurrentDate] = useState(new Date(2023, 9, 1)); // October 2023 to match image
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    const handleAddBooking = () => {
        setIsBookingModalOpen(true);
    };

    const handleBookingSubmit = (bookingData: any) => {
        console.log('Booking created:', bookingData);
        // TODO: Send booking data to API
        setIsBookingModalOpen(false);
        // Optionally update confirmed bookings count
        setConfirmedBookings(prev => prev + 1);
    };

    return (
        <div className=" min-h-screen bg-neutrals-01">
            {/* Header Section */}
            <div className="mb-6">
                <h1 className="text-shades-black font-bold text-3xl mb-2">
                    Bookings
                </h1>
                <p className="text-lg text-neutrals-07">
                    You have <span className="text-primary-01 font-semibold">{confirmedBookings} confirmed bookings</span> in your calendar.
                </p>
            </div>

            {/* Calendar Header */}
            <CalendarHeader 
                currentDate={currentDate} 
                setCurrentDate={setCurrentDate}
                onAddBooking={handleAddBooking}
            />
            
            {/* Calendar Layout */}
            <div className="mt-6 flex gap-6">
                {/* Main Calendar */}
                <div className="flex-1">
                    <Calender currentDate={currentDate} />
                </div>

                {/* Sidebar */}
                <div className="w-80">
                    <BookingSidebar />
                </div>
            </div>

            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                onSubmit={handleBookingSubmit}
            />
        </div>
    )
}