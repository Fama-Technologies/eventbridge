"use client"
import { useState } from "react"
import Calenderheader from "./calenderheader";

export default function BookingUI() {
    const [confirmedBookings, setConfirmedBookings] = useState(3);

    return (
    <div>
        {/* we are using a grid  */}
        <div>
            <div>
                <h1 className="text-shades-black font-bold text-[30px]">
                    Bookings
                </h1>
                <p className="text-[20px] text-neutrals-07">
                    You have  <span className="text-primary-01">{confirmedBookings} confirmed bookings</span>  in your calendar.
                </p>
            </div>
            <div>
                <Calenderheader/>
            </div>
        </div>
        <div></div>
    </div>
    )
}