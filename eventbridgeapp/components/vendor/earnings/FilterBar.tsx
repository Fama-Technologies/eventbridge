"use client";

import { Search, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    currentTab: string;
    onTabChange: (tab: string) => void;
    dateRangeLabel: string;
    onDateRangeClick: () => void;
}

export default function FilterBar({
    searchQuery,
    onSearchChange,
    currentTab,
    onTabChange,
    dateRangeLabel,
    onDateRangeClick
}: FilterBarProps) {
    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'paid', label: 'Paid' },
        { id: 'pending', label: 'Pending' },
        { id: 'cancelled', label: 'Cancelled' },
    ];

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            {/* Left: Filter Tabs */}
            <div className="flex gap-2 items-center overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                            currentTab === tab.id
                                ? "bg-shades-black text-shades-white shadow-md"
                                : "bg-shades-white text-neutrals-06 border border-neutrals-03 hover:border-neutrals-05 hover:text-neutrals-08"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Right: Search & Date Range */}
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                {/* Search */}
                <div className="relative w-full md:w-[320px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutrals-05" size={18} />
                    <input
                        type="text"
                        placeholder="Search events or clients..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-full border border-neutrals-03 text-sm focus:outline-none focus:ring-2 focus:ring-primary-01/20 focus:border-primary-01 transition-all"
                    />
                </div>

                {/* Date Picker Button */}
                <button
                    onClick={onDateRangeClick}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-full border border-neutrals-03 bg-shades-white text-sm font-medium text-shades-black hover:bg-neutrals-01 transition-colors whitespace-nowrap"
                >
                    <Calendar size={18} className="text-neutrals-06" />
                    <span>{dateRangeLabel}</span>
                    <span className="text-neutrals-05 ml-1">▼</span>
                </button>
            </div>
        </div>
    );
}
