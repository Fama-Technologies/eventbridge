"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Search, MapPin, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Mock Data
const EVENTS = [
    {
        id: "1",
        title: "Sarah's Wedding Reception",
        date: "Sat 14 Mar 2026",
        time: "5:00PM",
        location: "Serena Hotel, Kampala",
        image: "/categories/weddings.jpg", // Placeholder
        weeksToGo: 11,
        expenseCurrent: 3.2,
        expenseTotal: 12, // in M UGX
        status: "upcoming",
    },
    {
        id: "2",
        title: "Noah's 5th Birthday Party",
        date: "Sat 14 Mar 2026",
        time: "5:00PM",
        location: "Home",
        image: "/categories/Birthdays.jpg",
        status: "completed",
        weeksToGo: 0,
        expenseCurrent: 0.5,
        expenseTotal: 0.8,
    },
];

const FILTERS = ["All", "Upcoming", "Past"];

export default function MyEventsPage() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState("All");

    return (
        <div className="min-h-screen bg-neutrals-01 pb-24">
            {/* Header */}
            <div className="bg-shades-white sticky top-0 z-20 px-4 py-3 flex items-center justify-between shadow-sm">
                <button onClick={() => router.back()} className="p-1">
                    <ArrowLeft size={24} className="text-shades-black" />
                </button>
                <h1 className="text-lg font-bold text-shades-black">My Events</h1>
                <button className="p-1">
                    <Search size={24} className="text-shades-black" />
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
                {/* Filters */}
                <div className="flex gap-3 mb-6">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={cn(
                                "px-6 py-2 rounded-full text-sm font-medium transition-colors border",
                                activeFilter === filter
                                    ? "bg-primary-01 text-shades-white border-primary-01"
                                    : "bg-shades-white text-shades-black border-neutrals-03 hover:bg-neutrals-02"
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Events List */}
                <div className="flex flex-col gap-6">
                    {EVENTS.map((event) => (
                        <Link
                            href={`/customer/events/${event.id}`}
                            key={event.id}
                            className="bg-shades-white rounded-3xl overflow-hidden shadow-sm block transition-transform active:scale-[0.99]"
                        >
                            {/* Image Section */}
                            <div className="relative h-48 sm:h-56 w-full">
                                {/* Fallback color if image is missing, utilizing a semi-transparent overlay for text readability */}
                                <div className="absolute inset-0 bg-gray-300">
                                    {/* Placeholder for actual image if Next/Image fails or source missing */}
                                </div>
                                {/* Simulated Image - would use actual Image component with src */}
                                <div className="absolute inset-0 bg-stone-900/40 z-10" />
                                <Image
                                    src={event.image}
                                    alt={event.title}
                                    fill
                                    className="object-cover"
                                />

                                <div className="absolute inset-0 z-20 p-5 flex flex-col justify-end">
                                    {event.status === 'completed' && (
                                        <div className="absolute top-5 right-5">
                                            <span className="bg-accents-discount text-shades-white text-xs font-bold px-3 py-1.5 rounded-full">
                                                Completed
                                            </span>
                                        </div>
                                    )}
                                    <h2 className="text-2xl font-bold text-shades-white mb-1 leading-tight shadow-black/50 drop-shadow-md">
                                        {event.title}
                                    </h2>
                                    <p className="text-shades-white/90 text-sm font-medium drop-shadow-md">
                                        {event.date} . {event.time}
                                    </p>
                                </div>
                            </div>

                            {/* Details Section */}
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2 text-shades-black font-medium text-sm">
                                        <MapPin size={18} className="text-primary-01" fill="currentColor" />
                                        <span>{event.location}</span>
                                    </div>
                                    {event.status === 'upcoming' && (
                                        <span className="bg-primary-02/10 text-primary-02 text-xs font-bold px-3 py-1.5 rounded-full">
                                            {event.weeksToGo} weeks to go
                                        </span>
                                    )}
                                </div>

                                {/* Expense Summary - Only if active/upcoming usually, but showing for all based on design implies consistency */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-shades-black uppercase tracking-wide">EXPENSE SUMMARY</span>
                                        <span className="text-xs font-bold text-primary-01">
                                            {event.expenseCurrent}M/{event.expenseTotal}M UGX
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-neutrals-02 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-01 rounded-full"
                                            style={{ width: `${(event.expenseCurrent / event.expenseTotal) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* FAB */}
            <button
                className="fixed bottom-24 right-4 sm:right-6 lg:right-8 w-14 h-14 bg-primary-01 hover:bg-primary-02 text-shades-white rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-90 z-30"
                aria-label="Add Event"
            >
                <Plus size={28} />
            </button>

        </div>
    );
}
