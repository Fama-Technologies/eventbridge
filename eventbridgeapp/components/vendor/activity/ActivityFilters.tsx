'use client';

import { Search, X } from 'lucide-react';

type ActivityType = 'all' | 'bookings' | 'payments' | 'reviews' | 'updates';

interface ActivityFiltersProps {
    activeFilter: ActivityType;
    onFilterChange: (filter: ActivityType) => void;
    searchQuery: string;
    onSearch: (query: string) => void;
}

const FILTER_TABS = [
    { id: 'all' as const, label: 'All Activity' },
    { id: 'bookings' as const, label: 'Bookings' },
    { id: 'payments' as const, label: 'Payments' },
    { id: 'reviews' as const, label: 'Reviews' },
    { id: 'updates' as const, label: 'Profile Updates' },
];

export default function ActivityFilters({
    activeFilter,
    onFilterChange,
    searchQuery,
    onSearch,
}: ActivityFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search Bar */}
            <div className="relative w-full md:w-[320px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutrals-06" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Search activity history..."
                    className="w-full pl-10 pr-10 py-2.5 bg-neutrals-02 border border-neutrals-04 rounded-full text-sm text-shades-black placeholder:text-neutrals-06 focus:outline-none focus:border-primary-01 transition-colors"
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutrals-06 hover:text-shades-black transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 md:ml-auto">
                {FILTER_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onFilterChange(tab.id)}
                        className={`px-4 py-2 rounded-full font-medium text-xs transition-colors border ${activeFilter === tab.id
                            ? 'bg-primary-01 text-shades-white border-primary-01'
                            : 'bg-transparent text-neutrals-06 border-neutrals-04 hover:border-neutrals-05 hover:text-neutrals-05'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
