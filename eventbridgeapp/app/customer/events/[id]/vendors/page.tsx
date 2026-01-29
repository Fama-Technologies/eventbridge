"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowLeft, PenSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Mock Data for vendors
const EVENT_INFO = {
    title: "Sarah's Wedding Reception",
};

const VENDORS = [
    {
        id: "v1",
        name: "Royal Touch Décor",
        role: "Decoration",
        status: "Booked",
        image: "/categories/dec.jpg",
    },
    {
        id: "v2",
        name: "Elegant Events",
        role: "Event Planning",
        status: "Booked",
        image: "/categories/event planner.jpg",
    },
    {
        id: "v3",
        name: "Chic Ceremonies",
        role: "Wedding Services",
        status: "Pending",
        image: "/categories/weddings.jpg",
    },
    {
        id: "v4",
        name: "Savory Delights Catering",
        role: "Catering",
        status: "Pending",
        image: "/categories/catering.jpg",
    },
];

const FILTERS = ["All", "Pending", "Booked"];

export default function VendorsListPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState("All");

    const filteredVendors = VENDORS.filter((vendor) => {
        if (activeFilter === "All") return true;
        return vendor.status === activeFilter;
    });

    return (
        <div className="min-h-screen bg-neutrals-01 pb-24">
            {/* Header */}
            <div className="bg-shades-white px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
                <button onClick={() => router.back()} className="p-1">
                    <ArrowLeft size={24} className="text-shades-black" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-shades-black leading-tight">
                        Vendors
                    </h1>
                    <p className="text-xs text-neutrals-06 font-medium">
                        {EVENT_INFO.title}
                    </p>
                </div>
                <button className="w-10 h-10 rounded-full bg-primary-01/10 flex items-center justify-center">
                    <PenSquare size={20} className="text-primary-01" />
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={cn(
                                "px-5 py-2.5 rounded-full text-sm font-medium transition-colors",
                                activeFilter === filter
                                    ? "bg-primary-01/10 text-primary-01"
                                    : "bg-transparent text-neutrals-05 hover:bg-neutrals-02"
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Vendors List */}
                <div className="flex flex-col gap-4">
                    {filteredVendors.map((vendor) => (
                        <div
                            key={vendor.id}
                            className="bg-shades-white rounded-2xl p-4 shadow-sm flex items-center gap-4"
                        >
                            {/* Avatar */}
                            <div className="w-14 h-14 rounded-full bg-neutrals-02 overflow-hidden relative shrink-0">
                                <Image
                                    src={vendor.image}
                                    alt={vendor.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-shades-black leading-tight truncate">
                                    {vendor.name}
                                </h3>
                                <p className="text-sm text-neutrals-06 font-medium">
                                    {vendor.role}
                                </p>
                            </div>

                            {/* Status Badge */}
                            <span
                                className={cn(
                                    "text-xs font-bold px-3 py-1.5 rounded-full shrink-0",
                                    vendor.status === "Booked"
                                        ? "bg-accents-discount/10 text-accents-discount"
                                        : "bg-primary-01/10 text-primary-01"
                                )}
                            >
                                {vendor.status}
                            </span>
                        </div>
                    ))}
                </div>

                {filteredVendors.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-neutrals-05 text-sm">No vendors found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
