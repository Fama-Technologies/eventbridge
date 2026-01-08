"use client"
import { useState } from "react"
import CalendarHeader from "./calenderheader";

export default function BookingUI() {
    const [confirmedBookings, setConfirmedBookings] = useState(3);
    const [currentDate, setCurrentDate] = useState(new Date());

    const handleAddBooking = () => {
        // TODO: Implement add booking functionality
        console.log('Add booking clicked');
    };

    return (
        <div className="p-6">
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
            
            {/* Calendar Content will go here */}
            <div className="mt-6">
                {/* TODO: Add calendar grid component */}
            </div>
        </div>
    )
}