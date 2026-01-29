"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MoreHorizontal, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Mock Data for specific event
const EVENT_DETAILS = {
    id: "1",
    title: "Sarah's Wedding Reception",
    date: "12 Mar 2026",
    daysLeft: 14,
    status: "Active",
    imageUrl: "/categories/weddings.jpg", // Using existing category image
    stats: {
        progress: 35,
        vendors: { booked: 5, total: 15 },
        tasks: { done: 8, total: 12 },
        budget: { spent: 3.2, total: 12 }, // in M
    },
    nextActions: [
        {
            id: "a1",
            title: "Pay DJ balance – UGX 300k",
            subtitle: "Due in 2 days",
            status: "urgent", // red dot
            actionLabel: "Pay",
        },
        {
            id: "a2",
            title: "Photographer hasn't replied",
            subtitle: "Sent 3 days ago",
            status: "pending", // yellow dot
            actionLabel: "Ping",
        },
    ],
    vendors: [
        {
            id: "v1",
            name: "Royal Touch Décor",
            role: "Decoration",
            status: "Booked",
            image: "/categories/dec.jpg",
        },
        {
            id: "v2",
            name: "Echo Beats Entertainment",
            role: "Entertainment",
            status: "PENDING",
            image: "/categories/djs.jpg",
        },
        {
            id: "v3",
            name: "Snap Moments Photography",
            role: "Photography",
            status: "PENDING",
            image: "/categories/photograher.jpg",
        },
    ],
};

export default function EventDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-neutrals-01 pb-24">
            {/* Header */}
            <div className="bg-shades-white px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
                <button onClick={() => router.back()} className="p-1">
                    <ArrowLeft size={24} className="text-shades-black" />
                </button>
                <div className="flex-1">
                    <h1 className="text-base font-bold text-shades-black leading-tight">
                        {EVENT_DETAILS.title}
                    </h1>
                    <p className="text-xs text-neutrals-06 font-medium">
                        {EVENT_DETAILS.date} <span className="mx-1">.</span> {EVENT_DETAILS.daysLeft} days left
                    </p>
                </div>
                <div className="bg-accents-peach/40 text-primary-02 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                    {EVENT_DETAILS.status}
                </div>
            </div>

            {/* Hero Image */}
            <div className="relative h-48 w-full bg-neutrals-03">
                {/* Placeholder color */}
                <div className="absolute inset-0 bg-stone-300 animate-pulse">
                    {/* Real image would act as cover */}
                </div>
                <Image
                    src={EVENT_DETAILS.imageUrl}
                    alt={EVENT_DETAILS.title}
                    fill
                    className="object-cover"
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">

                {/* Main Stats Card */}
                <div className="bg-shades-white rounded-t-3xl rounded-b-3xl shadow-sm p-5 mb-5">
                    {/* Overall Progress */}
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-shades-black uppercase tracking-wide">OVERALL PROGRESS</h3>
                        <span className="text-2xl font-bold text-primary-01">{EVENT_DETAILS.stats.progress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-neutrals-02 rounded-full overflow-hidden mb-6">
                        <div
                            className="h-full bg-primary-01 rounded-full"
                            style={{ width: `${EVENT_DETAILS.stats.progress}%` }}
                        ></div>
                    </div>

                    {/* Three Columns Stats */}
                    <div className="grid grid-cols-3 divide-x divide-neutrals-03">
                        <div className="text-center px-1">
                            <span className="text-[10px] font-bold text-neutrals-05 uppercase block mb-1">VENDORS</span>
                            <span className="text-sm font-bold text-shades-black block">{EVENT_DETAILS.stats.vendors.booked}/{EVENT_DETAILS.stats.vendors.total} Booked</span>
                        </div>
                        <div className="text-center px-1">
                            <span className="text-[10px] font-bold text-neutrals-05 uppercase block mb-1">TASKS</span>
                            <span className="text-sm font-bold text-shades-black block">{EVENT_DETAILS.stats.tasks.done}/{EVENT_DETAILS.stats.tasks.total}</span>
                        </div>
                        <div className="text-center px-1">
                            <span className="text-[10px] font-bold text-neutrals-05 uppercase block mb-1">BUDGET</span>
                            <span className="text-sm font-bold text-shades-black block">{EVENT_DETAILS.stats.budget.spent}M/{EVENT_DETAILS.stats.budget.total}M</span>
                        </div>
                    </div>
                </div>

                {/* Next Actions */}
                <div className="bg-shades-white rounded-3xl shadow-sm p-5 mb-6 border border-neutrals-02">
                    <h3 className="text-lg font-bold text-shades-black mb-4">Next Actions</h3>
                    <div className="space-y-4">
                        {EVENT_DETAILS.nextActions.map((action) => (
                            <div key={action.id} className="flex items-start justify-between">
                                <div className="flex gap-3">
                                    <div className={cn(
                                        "w-2.5 h-2.5 rounded-full mt-1.5 shrink-0",
                                        action.status === 'urgent' ? "bg-primary-01" : "bg-yellow-400"
                                    )} />
                                    <div>
                                        <p className="text-sm font-medium text-shades-black leading-snug">{action.title}</p>
                                        <p className={cn(
                                            "text-xs",
                                            action.status === 'urgent' ? "text-primary-01" : "text-neutrals-06"
                                        )}>{action.subtitle}</p>
                                    </div>
                                </div>
                                <button className="text-sm font-bold text-primary-01 hover:text-primary-02 shrink-0">
                                    {action.actionLabel}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Vendors List */}
                <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="text-lg font-bold text-shades-black">Vendors</h3>
                        <Link href={`/customer/events/${params.id}/vendors`} className="flex items-center gap-1 text-primary-01 text-sm font-bold">
                            View all <ChevronRight size={16} />
                        </Link>
                    </div>

                    <div className="overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide -mx-4 px-4">
                        <div className="flex gap-3 w-max">
                            {EVENT_DETAILS.vendors.map((vendor) => (
                                <div key={vendor.id} className="w-36 bg-shades-white rounded-2xl p-3 border border-neutrals-03 shadow-sm flex flex-col items-center flex-shrink-0 snap-start">
                                    <div className="w-14 h-14 rounded-full bg-neutrals-02 mb-2 overflow-hidden relative">
                                        {/* Placeholder */}
                                        <div className="absolute inset-0 bg-stone-800 flex items-center justify-center text-white font-bold text-lg">
                                            {vendor.name[0]}
                                        </div>
                                        <Image
                                            src={vendor.image}
                                            alt={vendor.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <h4 className="text-xs font-bold text-center text-shades-black leading-tight mb-0.5 line-clamp-2 min-h-[2.5em]">
                                        {vendor.name}
                                    </h4>
                                    <span className="text-[10px] text-neutrals-06 font-medium mb-3">
                                        {vendor.role}
                                    </span>
                                    <span className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                                        vendor.status === 'Booked'
                                            ? "bg-accents-discount/10 text-accents-discount"
                                            : "bg-yellow-400/20 text-yellow-600"
                                    )}>
                                        {vendor.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
