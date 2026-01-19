'use client';

import {
    CalendarCheck,
    CalendarClock,
    XOctagon,
    Wallet,
    Star,
    Edit3,
    Image as ImageIcon,
    Package,
    ArrowUpRight,
    MessageSquare,
    FileText
} from 'lucide-react';
import { format } from 'date-fns';

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

interface ActivityCardProps {
    activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
    const getIcon = () => {
        switch (activity.type) {
            case 'booking_confirmed':
                return <CalendarCheck className="w-6 h-6 text-shades-white" />;
            case 'booking_pending':
                return <CalendarClock className="w-6 h-6 text-shades-white" />;
            case 'booking_declined':
                return <XOctagon className="w-6 h-6 text-shades-white" />;
            case 'payout_processed':
            case 'payment_received':
                return <Wallet className="w-6 h-6 text-shades-white" />;
            case 'review_received':
                return <Star className="w-6 h-6 text-shades-white" />;
            case 'profile_updated':
                return <Edit3 className="w-6 h-6 text-shades-white" />;
            case 'photos_added':
                return <ImageIcon className="w-6 h-6 text-shades-white" />;
            case 'package_updated':
                return <Package className="w-6 h-6 text-shades-white" />;
            default:
                return <FileText className="w-6 h-6 text-shades-white" />;
        }
    };

    const getBadgeColor = () => {
        switch (activity.type) {
            case 'booking_confirmed':
                return 'bg-accents-discount';
            case 'booking_pending':
                return 'bg-primary-01';
            case 'booking_declined':
                return 'bg-red-500';
            case 'payout_processed':
            case 'payment_received':
                return 'bg-accents-orange'; // Distinct from review
            case 'review_received':
                return 'bg-primary-02'; // Primary-02 for reviews
            case 'profile_updated':
            case 'photos_added':
            case 'package_updated':
                return 'bg-neutrals-05';
            default:
                return 'bg-neutrals-05';
        }
    };

    const getBadgeLabel = () => {
        switch (activity.type) {
            case 'booking_confirmed':
            case 'booking_pending':
            case 'booking_declined':
                return 'BOOKING';
            case 'payout_processed':
            case 'payment_received':
                return 'PAYMENTS';
            case 'review_received':
                return 'REVIEWS';
            case 'profile_updated':
            case 'photos_added':
            case 'package_updated':
                return 'UPDATES';
            default:
                return 'ACTIVITY';
        }
    };

    const getAction = () => {
        switch (activity.type) {
            case 'booking_confirmed':
                return (
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-neutrals-02 text-shades-black font-semibold text-sm rounded-lg hover:bg-neutrals-03 transition-colors">
                            View Details
                        </button>
                        <button className="px-4 py-2 bg-neutrals-02/50 text-primary-01 font-semibold text-sm rounded-lg hover:bg-neutrals-03 transition-colors">
                            Contact Guest
                        </button>
                    </div>
                );
            case 'payout_processed':
                return (
                    <button className="px-4 py-2 bg-neutrals-02 text-shades-black font-semibold text-sm rounded-lg hover:bg-neutrals-03 transition-colors">
                        View Receipt
                    </button>
                );
            case 'review_received':
                return (
                    <button className="px-4 py-2 bg-primary-01 text-shades-white font-semibold text-sm rounded-lg hover:bg-primary-02 transition-colors">
                        Respond to Review
                    </button>
                );
            case 'profile_updated':
                return (
                    <button className="px-4 py-2 bg-neutrals-02 text-shades-black font-semibold text-sm rounded-lg hover:bg-neutrals-03 transition-colors">
                        View Profile
                    </button>
                );
            default:
                return null; // No default action
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            // If today, show generic "Today" or specific time
            // For now, using standard format as per user request/mock
            return format(date, 'MMM d, yyyy');
        } catch {
            return dateString;
        }
    };

    return (
        <div className="bg-shades-white rounded-xl border border-neutrals-03 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-full ${getBadgeColor()} flex items-center justify-center flex-shrink-0`}>
                    {getIcon()}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg text-shades-black">{activity.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase text-shades-white ${getBadgeColor()}`}>
                            {getBadgeLabel()}
                        </span>
                    </div>

                    <p className="text-neutrals-06 text-sm mb-2">{activity.description}</p>

                    {activity.type === 'review_received' && activity.metadata?.rating && (
                        <div className="flex gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < (activity.metadata?.rating || 0) ? 'fill-primary-01 text-primary-01' : 'text-neutrals-04'}`}
                                />
                            ))}
                        </div>
                    )}

                    <p className="text-xs text-neutrals-05 mt-2 md:mt-1">{activity.timestamp}</p>
                </div>

                {/* Actions */}
                <div className="flex items-start md:items-center justify-end md:self-center">
                    {getAction()}
                </div>
            </div>
        </div>
    );
}
