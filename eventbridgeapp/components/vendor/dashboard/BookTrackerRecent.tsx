"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface TimelineEvent {
    id: number;
    title: string;
    description: React.ReactNode;
    time: string;
    status: "confirmed" | "processed" | "updated" | "review";
}

export default function BookTrackerRecent() {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const getDotColor = (status: TimelineEvent["status"]) => {
        switch (status) {
            case "confirmed":
                return "bg-accents-discount"; // Green
            case "processed":
                return "bg-primary-01"; // Orange
            case "updated":
            case "review":
                return "bg-neutrals-05"; // Gray
            default:
                return "bg-neutrals-05";
        }
    };

    useEffect(() => {
        async function fetchRecentActivity() {
            try {
                // Fetch from activity log endpoint (simulated via bookings/earnings APIs mostly)
                // For now, let's fetch recent bookings to populate this
                const response = await fetch('/api/vendor/bookings?limit=5');
                if (response.ok) {
                    const data = await response.json();

                    const bookingsData = data.bookings || [];

                    // Map bookings to timeline events
                    const mappedEvents: TimelineEvent[] = bookingsData.map((booking: any) => ({
                        id: booking.id,
                        title: "Booking Confirmed",
                        description: (
                            <>
                                {booking.title} for <span className="text-shades-black font-medium">{booking.client.name}</span> has been confirmed.
                            </>
                        ),
                        time: "RECENTLY", // In real app, calculate "X Hours Ago"
                        status: "confirmed" as const
                    }));

                    // Add a mock "Profile Updated" if list is short, to show variety
                    if (mappedEvents.length < 3) {
                        mappedEvents.push({
                            id: 999,
                            title: "System Update",
                            description: "Your dashboard is up to date.",
                            time: "JUST NOW",
                            status: "updated" as const
                        });
                    }

                    setEvents(mappedEvents);
                } else {
                    // Fallback mock if API fails/empty
                    setEvents([]);
                }
            } catch (error) {
                console.error("Error fetching activity:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchRecentActivity();
    }, []);

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center p-10">
                <Loader2 className="animate-spin text-primary-01" />
            </div>
        );
    }

    return (
        <div className="w-full  ">
            <h2 className="font-font1 font-semibold text-[18px] leading-6 text-shades-black mb-6">Recent Activity</h2>
            <div className="relative flex flex-col gap-0 bg-shades-white p-6 rounded-xl border border-neutrals-03 shadow-sm transition-colors duration-300">
                {events.length === 0 ? (
                    <p className="text-neutrals-06 text-sm text-center py-4">No recent activity.</p>
                ) : (
                    events.map((event, index) => (
                        <div key={event.id} className="relative pl-6 pb-8 last:pb-0">
                            {/* Connecting Line */}
                            {index !== events.length - 1 && (
                                <div
                                    className={`absolute left-[4px] top-2 bottom-0 w-[1px] ${event.status === "confirmed" ? "bg-accents-discount" : "bg-neutrals-03"
                                        }`}
                                />
                            )}

                            {/* Dot */}
                            <div
                                className={`absolute left-0 top-1.5 w-[9px] h-[9px] rounded-full ${getDotColor(
                                    event.status
                                )} z-10`}
                            />

                            {/* Content */}
                            <div className="flex flex-col gap-1">
                                <h3 className="font-font1 font-semibold text-[14px] leading-5 text-shades-black">
                                    {event.title}
                                </h3>
                                <p className="font-font1 font-normal text-[14px] leading-5 text-neutrals-06">
                                    {event.description}
                                </p>
                                <span className="font-font1 font-normal text-[10px] leading-4 text-neutrals-05 uppercase mt-1">
                                    {event.time}
                                </span>
                            </div>
                        </div>
                    ))
                )}

                <div className="mt-6 pt-4 border-t border-neutrals-03 flex justify-center">
                    <Link
                        href="/vendor/bookings"
                        className="font-font1 font-medium text-[14px] leading-5 text-primary-01 hover:text-primary-02 transition-colors"
                    >
                        View full history
                    </Link>
                </div>
            </div>

        </div>
    );
}
