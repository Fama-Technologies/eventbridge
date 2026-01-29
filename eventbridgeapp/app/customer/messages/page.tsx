"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Mock Data
const MESSAGES = [
    {
        id: "1",
        vendorName: "Royal Touch Décor",
        avatar: "/images/vendor1.jpg", // Placeholder - will handle if image missing
        lastMessage: "Deposit receipt attached...",
        time: "2m ago",
        unreadCount: 1,
        online: true,
    },
    {
        id: "2",
        vendorName: "Snap Moments Photography",
        avatar: "/images/vendor2.jpg",
        lastMessage: "Quote accepted, contract sent",
        time: "1h ago",
        unreadCount: 0,
        online: false,
    },
    {
        id: "3",
        vendorName: "Echo Beats",
        avatar: "/images/vendor3.jpg",
        lastMessage: "Balance due in 2 days",
        time: "Yesterday",
        unreadCount: 0,
        online: false,
        urgent: true,
    },
];

const FILTERS = ["All", "Unread", "Past"];

export default function MessagesPage() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState("All");

    return (
        <div className="min-h-screen bg-neutrals-01 pb-20">
            {/* Header */}
            <div className="bg-shades-white sticky top-0 z-20 px-4 py-3 flex items-center justify-between shadow-sm">
                <button onClick={() => router.back()} className="p-1">
                    <ArrowLeft size={24} className="text-shades-black" />
                </button>
                <h1 className="text-lg font-bold text-shades-black">Messages</h1>
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

                {/* Message List */}
                <div className="flex flex-col gap-3">
                    {MESSAGES.map((msg) => (
                        <Link
                            key={msg.id}
                            href={`/customer/messages/${msg.id}`}
                            className="bg-shades-white rounded-2xl p-4 flex items-center gap-4 shadow-sm active:scale-[0.99] transition-transform"
                        >
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-neutrals-03 overflow-hidden">
                                    {/* Using a colored div fallback if image fails or for placeholder */}
                                    <div className="w-full h-full bg-stone-800 flex items-center justify-center text-white font-bold text-lg">
                                        {msg.vendorName[0]}
                                    </div>
                                </div>
                                {msg.online && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-accents-discount rounded-full border-2 border-shades-white"></div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-base font-bold text-shades-black truncate">
                                        {msg.vendorName}
                                    </h3>
                                    <span className="text-xs text-neutrals-06 flex-shrink-0">
                                        {msg.time}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-neutrals-06 truncate pr-2">
                                        {msg.lastMessage}
                                    </p>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {msg.urgent && (
                                            <span className="bg-errors-bg text-errors-main text-[10px] font-bold px-2 py-0.5 rounded">
                                                URGENT
                                            </span>
                                        )}
                                        {msg.unreadCount > 0 && (
                                            <div className="w-5 h-5 bg-primary-01 text-shades-white text-xs font-bold flex items-center justify-center rounded-full">
                                                {msg.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
