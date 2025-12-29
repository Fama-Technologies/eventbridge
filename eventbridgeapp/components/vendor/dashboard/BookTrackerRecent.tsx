import Link from "next/link";
import React from "react";

interface TimelineEvent {
    id: number;
    title: string;
    description: React.ReactNode;
    time: string;
    status: "confirmed" | "processed" | "updated" | "review";
}

const events: TimelineEvent[] = [
    {
        id: 1,
        title: "Booking Confirmed",
        description: (
            <>
                Summer Garden Party for <span className="text-white font-medium">Alice Smith</span> has been confirmed.
            </>
        ),
        time: "2 HOURS AGO",
        status: "confirmed",
    },
    {
        id: 2,
        title: "Payout Processed",
        description: (
            <>
                Funds of <span className="text-white font-medium">$1,200</span> have been sent to your account.
            </>
        ),
        time: "YESTERDAY",
        status: "processed",
    },
    {
        id: 3,
        title: "Profile Updated",
        description: 'You added 3 new photos to "Grand Ballroom".',
        time: "OCT 20",
        status: "updated",
    },
    {
        id: 4,
        title: "Review Received",
        description: 'Jane D. left a 5-star review: "Amazing venue!"',
        time: "OCT 18",
        status: "review",
    },
];

export default function BookTrackerRecent() {
    const getDotColor = (status: TimelineEvent["status"]) => {
        switch (status) {
            case "confirmed":
                return "bg-[#00E64D]"; // Green
            case "processed":
                return "bg-[#FF7043]"; // Orange
            case "updated":
            case "review":
                return "bg-[#666666]"; // Gray
            default:
                return "bg-[#666666]";
        }
    };

    return (
        <div className="w-full bg-[#262626] p-6 rounded-xl border border-[#4D4D4D]">
            <h2 className="font-font1 font-semibold text-[18px] leading-6 text-white mb-6">Recent Activity</h2>
            <div className="relative flex flex-col gap-0">
                {events.map((event, index) => (
                    <div key={event.id} className="relative pl-6 pb-8 last:pb-0">
                        {/* Connecting Line */}
                        {index !== events.length - 1 && (
                            <div
                                className={`absolute left-[4px] top-2 bottom-0 w-[1px] ${event.status === "confirmed" ? "bg-[#00E64D]" : "bg-[#4D4D4D]"
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
                            <h3 className="font-font1 font-semibold text-[14px] leading-5 text-white">
                                {event.title}
                            </h3>
                            <p className="font-font1 font-normal text-[14px] leading-5 text-[#A3A3A3]">
                                {event.description}
                            </p>
                            <span className="font-font1 font-normal text-[10px] leading-4 text-[#737373] uppercase mt-1">
                                {event.time}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#4D4D4D] flex justify-center">
                <Link
                    href="#"
                    className="font-font1 font-medium text-[14px] leading-5 text-[#FF7043] hover:text-[#FF5A2B] transition-colors"
                >
                    View full history
                </Link>
            </div>
        </div>
    );
}
