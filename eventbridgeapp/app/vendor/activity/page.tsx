'use client';

import { useState, useEffect } from 'react';
import { Download, Settings, Search, ChevronDown } from 'lucide-react';
import ActivityCard from '@/components/vendor/activity/ActivityCard';
import ActivityFilters from '@/components/vendor/activity/ActivityFilters';

type ActivityType = 'all' | 'bookings' | 'payments' | 'reviews' | 'updates';

interface Activity {
    id: string;
    type: 'booking_confirmed' | 'booking_pending' | 'booking_declined' | 'payout_processed' | 'payment_received' | 'review_received' | 'profile_updated' | 'photos_added' | 'package_updated';
    title: string;
    description: string;
    timestamp: string;
    status?: string;
    metadata?: {
        clientName?: string;
        amount?: number;
        eventName?: string;
        rating?: number;
        reviewText?: string;
    };
}

export default function ActivityHistoryPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<ActivityType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchActivities();
    }, [filter, searchQuery, page]);

    const fetchActivities = async () => {
        try {
            setLoading(true);

            // API Call: GET /api/vendor/activity
            // Expected query params:
            // - page: number (pagination)
            // - limit: number (items per page, default 20)
            // - filter: 'all' | 'bookings' | 'payments' | 'reviews' | 'updates'
            // - search: string (search query)
            //
            // Expected response format:
            // {
            //   success: boolean,
            //   activities: Activity[],
            //   pagination: {
            //     currentPage: number,
            //     totalPages: number,
            //     totalItems: number,
            //     hasMore: boolean
            //   }
            // }
            //
            // Activity types to return:
            // - booking_confirmed: New booking confirmed
            // - booking_pending: Booking request pending
            // - booking_declined: Booking declined
            // - payout_processed: Payout sent to bank account
            // - payment_received: Payment received from client
            // - review_received: New review from client
            // - profile_updated: Profile information updated
            // - photos_added: Portfolio photos added
            // - package_updated: Service package created/updated

            const response = await fetch(
                `/api/vendor/activity?page=${page}&limit=20&filter=${filter}&search=${encodeURIComponent(searchQuery)}`
            );

            const data = await response.json();

            if (data.success) {
                if (page === 1) {
                    setActivities(data.activities);
                } else {
                    setActivities(prev => [...prev, ...data.activities]);
                }
                setHasMore(data.pagination.hasMore);
            }
        } catch (error) {
            console.error('Failed to fetch activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilter: ActivityType) => {
        setFilter(newFilter);
        setPage(1);
        setActivities([]);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setPage(1);
        setActivities([]);
    };

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
    };

    const handleExport = () => {
        // Export activities to CSV/PDF
        console.log('Exporting activities...');
    };

    return (
        <div className="min-h-screen bg-neutrals-01 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-shades-black mb-2">Recent Activity</h1>
                            <p className="text-neutrals-06">Track all your bookings, payments, reviews, and updates</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2.5 bg-shades-white border border-neutrals-03 rounded-xl text-shades-black font-medium hover:bg-neutrals-02 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden md:inline">Export</span>
                            </button>
                            <button className="p-2.5 bg-shades-white border border-neutrals-03 rounded-xl text-neutrals-07 hover:bg-neutrals-02 transition-colors">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <ActivityFilters
                        activeFilter={filter}
                        onFilterChange={handleFilterChange}
                        searchQuery={searchQuery}
                        onSearch={handleSearch}
                    />
                </div>

                {/* Activity Timeline */}
                <div className="space-y-4">
                    {loading && page === 1 ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-01"></div>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="bg-shades-white rounded-xl border border-neutrals-03 p-12 text-center">
                            <div className="w-16 h-16 bg-neutrals-02 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-neutrals-05" />
                            </div>
                            <h3 className="text-lg font-semibold text-shades-black mb-2">No activities found</h3>
                            <p className="text-neutrals-06">
                                {searchQuery
                                    ? 'Try adjusting your search or filters'
                                    : 'Your activity history will appear here'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {activities.map((activity) => (
                                <ActivityCard key={activity.id} activity={activity} />
                            ))}

                            {/* Load More */}
                            {hasMore && (
                                <div className="flex justify-center pt-6">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-3 bg-shades-white border border-neutrals-03 rounded-xl text-shades-black font-medium hover:bg-neutrals-02 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-01"></div>
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                Load More
                                                <ChevronDown className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
