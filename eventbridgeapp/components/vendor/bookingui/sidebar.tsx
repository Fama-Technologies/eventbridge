"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Ban } from "lucide-react";
import BookingCard from "./bookingcard";
import BookingDetailsModal from "./BookingDetailsModal";
import BlockDatesModal from "./BlockDatesModal";

export default function BookingSidebar() {
    const [selectedBooking, setSelectedBooking] = useState<typeof bookings[0] | null>(null);
    const [showBlockModal, setShowBlockModal] = useState(false);

    const bookings = [
        { 
            id: 1, 
            title: "Sarah's Wedding", 
            initials: "SJ",
            avatarUrl: "/avatars/sarah.png",
            date: 'Oct 24-26', 
            guestCount: 150, 
            budget: 4500000, 
            status: 'confirmed' as const,
            // Extended data for modal
            bookingId: "BK-9281-2023",
            client: {
                name: "Sarah Jenkins",
                avatar: "/avatars/sarah.png",
                rating: 5.0,
                reviews: 2
            },
            dateRange: "Oct 24 - Oct 26, 2023",
            timeRange: "10:00 AM - 11:00 PM",
            venue: "The Grand Hall, downtown",
            paymentStatus: "Deposit Paid",
            payments: [
                { label: "Full Wedding Package", amount: 3000000 },
                { label: "Photography Add-on (Premium)", amount: 1200000 },
                { label: "Service Fee", amount: 300000 },
                { label: "Paid on Sep 12", amount: 2250000, type: 'paid' as const },
                { label: "Balance Due (Oct 24)", amount: 2250000, type: 'due' as const }
            ],
            latestMessage: {
                sender: "Sarah",
                avatar: "/avatars/sarah.png",
                time: "Yesterday, 4:20 PM",
                content: "Hi! We are really excited. Quick question about the lighting setup - can we do a walkthrough next Tuesday around 2pm?",
                attachment: "moodboard_v2.pdf"
            }
        },
        { 
            id: 2, 
            title: "Tech Corp Mixer", 
            initials: "TC",
            date: 'Nov 02', 
            guestCount: 50, 
            budget: 10000000, 
            status: 'pending' as const,
            bookingId: "BK-9282-2023",
            client: {
                name: "Tech Corp",
                rating: 4.5,
                reviews: 8
            },
            dateRange: "Nov 02, 2023",
            timeRange: "6:00 PM - 10:00 PM",
            venue: "Innovation Hub",
            paymentStatus: "Pending",
            payments: [
                { label: "Corporate Event Package", amount: 8000000 },
                { label: "Catering Add-on", amount: 1500000 },
                { label: "Service Fee", amount: 500000 }
            ]
        },
        { 
            id: 3, 
            title: "Liam's 30th", 
            initials: "LW",
            avatarUrl: "/avatars/men.png",
            date: 'Nov 15', 
            guestCount: 40, 
            budget: 2800000, 
            status: 'confirmed' as const,
            bookingId: "BK-9283-2023",
            client: {
                name: "Liam Williams",
                avatar: "/avatars/men.png",
                rating: 4.8,
                reviews: 3
            },
            dateRange: "Nov 15, 2023",
            timeRange: "7:00 PM - 12:00 AM",
            venue: "Skyline Rooftop",
            paymentStatus: "Fully Paid",
            payments: [
                { label: "Birthday Party Package", amount: 2500000 },
                { label: "Service Fee", amount: 300000 },
                { label: "Paid on Nov 01", amount: 2800000, type: 'paid' as const }
            ]
        }
    ];

    const bookedDates = [
        new Date(2023, 9, 5),   // Oct 5
        new Date(2023, 9, 24),  // Oct 24
        new Date(2023, 9, 25),  // Oct 25
        new Date(2023, 9, 26),  // Oct 26
        new Date(2023, 10, 1),  // Nov 1
        new Date(2023, 10, 15), // Nov 15
    ];

    const handleBlockDates = (dates: Date[], reason: string, note: string, recurring: boolean) => {
        console.log('Blocking dates:', { dates, reason, note, recurring });
        // TODO: Implement API call to block dates
    };

    return (
        <div className="flex flex-col h-full">
         <Tabs defaultValue="upcoming" className="w-full flex flex-col h-full">
            <TabsList className="flex w-full mb-4 bg-neutrals-02 rounded-lg p-1">
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
            <div className="flex-1 overflow-y-auto">
                <TabsContent value="upcoming" className="mt-0">
                    {bookings.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            title={booking.title}
                            initials={booking.initials}
                            avatarUrl={booking.avatarUrl}
                            date={booking.date}
                            guestCount={booking.guestCount}
                            budget={booking.budget}
                            status={booking.status}
                            onMessageClick={() => setSelectedBooking(booking)}
                            onReceiptClick={() => setSelectedBooking(booking)}
                        />
                    ))}
                </TabsContent>
                <TabsContent value="past" className="mt-0">
                    <div className="text-center text-neutrals-06 py-8">
                        No past bookings
                    </div>
                </TabsContent>
                <TabsContent value="all" className="mt-0">
                    {bookings.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            title={booking.title}
                            initials={booking.initials}
                            avatarUrl={booking.avatarUrl}
                            date={booking.date}
                            guestCount={booking.guestCount}
                            budget={booking.budget}
                            status={booking.status}
                            onMessageClick={() => setSelectedBooking(booking)}
                            onReceiptClick={() => setSelectedBooking(booking)}
                        />
                    ))}
                </TabsContent>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-neutrals-03 pt-4 mt-4 space-y-3">
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

        {/* Booking Details Modal */}
        {selectedBooking && (
            <BookingDetailsModal
                isOpen={!!selectedBooking}
                onClose={() => setSelectedBooking(null)}
                booking={{
                    id: selectedBooking.bookingId,
                    status: selectedBooking.status,
                    title: selectedBooking.title,
                    client: selectedBooking.client,
                    dateRange: selectedBooking.dateRange,
                    timeRange: selectedBooking.timeRange,
                    guests: selectedBooking.guestCount,
                    venue: selectedBooking.venue,
                    totalAmount: selectedBooking.budget,
                    paymentStatus: selectedBooking.paymentStatus,
                    payments: selectedBooking.payments,
                    latestMessage: selectedBooking.latestMessage
                }}
            />
        )}

        {/* Block Dates Modal */}
        <BlockDatesModal
            isOpen={showBlockModal}
            onClose={() => setShowBlockModal(false)}
            bookedDates={bookedDates}
            onBlockDates={handleBlockDates}
        />
        </div>
    )
}