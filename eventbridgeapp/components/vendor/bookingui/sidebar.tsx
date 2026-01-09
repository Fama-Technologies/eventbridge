"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Ban } from "lucide-react";
import BookingCard from "./bookingcard";
import BookingDetailsModal from "./BookingDetailsModal";
import BlockDatesModal from "./BlockDatesModal";
import type { Booking } from "./data";

interface BookingSidebarProps {
    bookings: Booking[];
    blockedDates: Date[];
    onBlockDates: (dates: Date[]) => void;
    onSelectBooking: (booking: Booking) => void;
}

export default function BookingSidebar({
    bookings,
    blockedDates,
    onBlockDates,
    onSelectBooking
}: BookingSidebarProps) {
    const [showBlockModal, setShowBlockModal] = useState(false);

    const upcomingBookings = bookings.filter(b => new Date(b.date) >= new Date());
    const pastBookings = bookings.filter(b => new Date(b.date) < new Date());

    const handleBlockDates = (dates: Date[], reason: string, note: string, recurring: boolean) => {
        console.log('Blocking dates:', { dates, reason, note, recurring });
        onBlockDates(dates);
        setShowBlockModal(false);
    };

    return (
        <div className="flex flex-col h-full">
            <Tabs defaultValue="upcoming" className="w-full flex flex-col h-full">
                <TabsList className="flex w-full mb-3 bg-neutrals-02 rounded-lg p-1">
                    <TabsTrigger value="upcoming" className="flex-1 text-center data-[state=active]:bg-shades-white data-[state=active]:shadow-sm data-[state=active]:text-primary-01 text-sm font-medium text-neutrals-08">
                        Upcoming
                    </TabsTrigger>
                    <TabsTrigger value="past" className="flex-1 text-center data-[state=active]:bg-shades-white data-[state=active]:shadow-sm data-[state=active]:text-primary-01 text-sm font-medium text-neutrals-08">
                        Past
                    </TabsTrigger>
                    <TabsTrigger value="all" className="flex-1 text-center data-[state=active]:bg-shades-white data-[state=active]:shadow-sm data-[state=active]:text-primary-01 text-sm font-medium text-neutrals-08">
                        All
                    </TabsTrigger>
                </TabsList>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto space-y-3">
                    <TabsContent value="upcoming" className="mt-0 space-y-3">
                        {upcomingBookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                title={booking.title}
                                initials={booking.initials}
                                avatarUrl={booking.avatarUrl}
                                date={booking.dateDisplay}
                                guestCount={booking.guestCount}
                                totalAmount={booking.totalAmount}
                                status={booking.status as 'confirmed' | 'pending'}
                                onMessageClick={() => onSelectBooking(booking)}
                                onReceiptClick={() => onSelectBooking(booking)}
                            />
                        ))}
                        {upcomingBookings.length === 0 && (
                            <div className="text-center text-neutrals-06 py-8">
                                No upcoming bookings
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="past" className="mt-0 space-y-3">
                        {pastBookings.length > 0 ? (
                            pastBookings.map((booking) => (
                                <BookingCard
                                    key={booking.id}
                                    title={booking.title}
                                    initials={booking.initials}
                                    avatarUrl={booking.avatarUrl}
                                    date={booking.dateDisplay}
                                    guestCount={booking.guestCount}
                                    totalAmount={booking.totalAmount}
                                    status={booking.status as 'confirmed' | 'pending'}
                                    onMessageClick={() => onSelectBooking(booking)}
                                    onReceiptClick={() => onSelectBooking(booking)}
                                />
                            ))
                        ) : (
                            <div className="text-center text-neutrals-06 py-8">
                                No past bookings
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="all" className="mt-0 space-y-3">
                        {bookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                title={booking.title}
                                initials={booking.initials}
                                avatarUrl={booking.avatarUrl}
                                date={booking.dateDisplay}
                                guestCount={booking.guestCount}
                                totalAmount={booking.totalAmount}
                                status={booking.status as 'confirmed' | 'pending'}
                                onMessageClick={() => onSelectBooking(booking)}
                                onReceiptClick={() => onSelectBooking(booking)}
                            />
                        ))}
                    </TabsContent>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-neutrals-03 pt-4 mt-2 space-y-3">
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutrals-02 text-neutrals-08 rounded-lg hover:bg-neutrals-03 transition-colors font-medium">
                        <RefreshCw size={16} />
                        Sync Google Calendar
                    </button>

                    <button
                        onClick={() => setShowBlockModal(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium"
                    >
                        <Ban size={16} />
                        Block Dates
                    </button>
                </div>
            </Tabs>

            {/* Block Dates Modal - triggered from sidebar action */}
            <BlockDatesModal
                isOpen={showBlockModal}
                onClose={() => setShowBlockModal(false)}
                bookings={bookings}
                onBlockDates={handleBlockDates}
            />
        </div>
    )
}