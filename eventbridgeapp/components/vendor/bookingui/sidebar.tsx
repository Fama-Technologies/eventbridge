import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Ban } from "lucide-react";
import BookingCard from "./bookingcard";

export default function BookingSidebar() {

    const bookings = [
        { 
            id: 1, 
            title: "Sarah's Wedding", 
            initials: "SJ",
            avatarUrl: "/avatars/sarah.jpg",
            date: 'Oct 24-26', 
            guestCount: 150, 
            budget: 4500000, 
            status: 'confirmed' as const
        },
        { 
            id: 2, 
            title: "Tech Corp Mixer", 
            initials: "TC",
            date: 'Nov 02', 
            guestCount: 50, 
            budget: 10000000, 
            status: 'pending' as const
        },
        { 
            id: 3, 
            title: "Liam's 30th", 
            initials: "LW",
            avatarUrl: "/avatars/liam.jpg",
            date: 'Nov 15', 
            guestCount: 40, 
            budget: 2800000, 
            status: 'confirmed' as const
        }
    ];

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
                
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium">
                    <Ban size={16} />
                    Block Dates
                </button>
            </div>
        </Tabs>
        </div>
    )
}