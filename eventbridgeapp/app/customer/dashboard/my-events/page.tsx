'use client';

import { useState } from 'react';
import { ArrowLeft, Search, MapPin, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Event {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    image: string;
    budgetUsed: number;
    totalBudget: number;
    currency: string;
    timeRemaining?: string;
    status: 'upcoming' | 'completed';
    completionMessage?: string;
}

// Mock data - Replace with actual API call
const mockEvents: Event[] = [
    {
        id: '1',
        title: 'Wedding Reception',
        date: 'Sat 14 Mar 2026',
        time: '5:00PM',
        location: 'Serena Hotel, Kampala',
        image: '/images/wedding-reception.jpg',
        budgetUsed: 3.2,
        totalBudget: 12,
        currency: 'M UGX',
        timeRemaining: '11 weeks to go',
        status: 'upcoming',
    },
    {
        id: '2',
        title: "Noahs's 5th Birthday Party",
        date: 'Sat 14 Mar 2026',
        time: '5:00PM',
        location: 'Kampala, Uganda',
        image: '/images/birthday-party.jpg',
        budgetUsed: 5,
        totalBudget: 5,
        currency: 'M UGX',
        status: 'completed',
        completionMessage: 'This Event was celebrated',
    },
];

export default function MyEventsPage() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past'>('all');
    const [events] = useState<Event[]>(mockEvents);

    const filteredEvents = events.filter((event) => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'upcoming') return event.status === 'upcoming';
        if (activeFilter === 'past') return event.status === 'completed';
        return true;
    });

    const getProgressPercentage = (used: number, total: number) => {
        return (used / total) * 100;
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 shadow-sm">
                <div className="px-4 pt-4 pb-3">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => router.back()} className="p-1">
                            <ArrowLeft className="w-6 h-6 text-foreground" />
                        </button>
                        <h1 className="text-xl font-bold text-foreground flex-1 ml-3">My Events</h1>
                        <button className="p-1">
                            <Search className="w-6 h-6 text-foreground" />
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === 'all'
                                    ? 'bg-primary-01 text-white'
                                    : 'bg-white text-foreground border border-neutrals-03'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveFilter('upcoming')}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === 'upcoming'
                                    ? 'bg-primary-01 text-white'
                                    : 'bg-white text-foreground border border-neutrals-03'
                                }`}
                        >
                            Upcoming
                        </button>
                        <button
                            onClick={() => setActiveFilter('past')}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === 'past'
                                    ? 'bg-primary-01 text-white'
                                    : 'bg-white text-foreground border border-neutrals-03'
                                }`}
                        >
                            Past
                        </button>
                    </div>
                </div>
            </div>

            {/* Events List */}
            <div className="px-4 py-4 space-y-4">
                {filteredEvents.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-neutrals-06">No events found</p>
                    </div>
                ) : (
                    filteredEvents.map((event) => (
                        <Link
                            key={event.id}
                            href={`/customer/dashboard/my-events/${event.id}`}
                            className="block"
                        >
                            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                                {/* Event Image */}
                                <div className="relative h-48 bg-neutrals-02">
                                    {event.image ? (
                                        <img
                                            src={event.image}
                                            alt={event.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/api/placeholder/400/200';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary-01/20 to-primary-02/20 flex items-center justify-center">
                                            <span className="text-neutrals-05 text-sm">No image</span>
                                        </div>
                                    )}

                                    {/* Event Title Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                        <h3 className="text-white font-bold text-xl mb-1">{event.title}</h3>
                                        <p className="text-white text-sm">
                                            {event.date} . {event.time}
                                        </p>
                                    </div>

                                    {/* Status Badge */}
                                    {event.status === 'completed' && (
                                        <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                                            Completed
                                        </div>
                                    )}
                                </div>

                                {/* Event Details */}
                                <div className="p-4 space-y-3">
                                    {/* Location */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-2 flex-1">
                                            <MapPin className="w-5 h-5 text-primary-01 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-foreground">{event.location}</span>
                                        </div>
                                        {event.timeRemaining && (
                                            <span className="text-primary-01 text-sm font-medium bg-primary-01/10 px-3 py-1 rounded-full whitespace-nowrap">
                                                {event.timeRemaining}
                                            </span>
                                        )}
                                    </div>

                                    {/* Budget Progress */}
                                    {event.status === 'upcoming' && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold text-foreground">
                                                    EXPENSE SUMMARY
                                                </span>
                                                <span className="text-sm font-bold text-primary-01">
                                                    {event.budgetUsed}
                                                    {event.currency}/{event.totalBudget}
                                                    {event.currency}
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-neutrals-02 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary-01 rounded-full transition-all"
                                                    style={{
                                                        width: `${getProgressPercentage(event.budgetUsed, event.totalBudget)}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Completion Message */}
                                    {event.status === 'completed' && event.completionMessage && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                                                <svg
                                                    className="w-4 h-4 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-medium text-green-700">
                                                {event.completionMessage}
                                            </span>
                                            <div className="flex-1 h-1 bg-green-600 rounded-full ml-2" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Floating Add Button */}
            <button className="fixed bottom-24 right-6 w-14 h-14 bg-primary-01 hover:bg-primary-02 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-20">
                <Plus className="w-6 h-6" strokeWidth={2.5} />
            </button>
        </div>
    );
}
