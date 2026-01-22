'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ActivityItemProps {
    title: string;
    description: string;
    time: string;
    dotColor: string; // Tailwind color class
    isLast?: boolean;
}

function ActivityItem({ title, description, time, dotColor, isLast }: ActivityItemProps) {
    return (
        <div className="flex gap-4 relative">
            {!isLast && (
                <div className="absolute left-[5px] top-6 bottom-[-16px] w-[2px] bg-neutrals-02" />
            )}
            <div className="relative z-10 pt-1.5 shrink-0">
                <div className={cn("w-3 h-3 rounded-full", dotColor)} />
            </div>
            <div className="pb-6">
                <div className="flex items-center justify-between gap-4 mb-1">
                    <h4 className="text-sm font-bold text-shades-black">{title}</h4>
                    <span className="text-[10px] font-bold text-neutrals-05 uppercase">{time}</span>
                </div>
                <p className="text-xs text-neutrals-06 leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
}

export default function RecentActivity() {
    return (
        <div className="bg-shades-white p-6 rounded-2xl border border-neutrals-03 shadow-sm h-full">
            <h2 className="text-lg font-bold text-shades-black mb-6">Recent Activity</h2>

            <div className="space-y-0">
                <ActivityItem
                    title="Booking Confirmed"
                    description="Summer Garden Party for Alice Smith confirmed."
                    time="2h ago"
                    dotColor="bg-green-500"
                />
                <ActivityItem
                    title="Payout Processed"
                    description="Funds of $1,200 sent to account."
                    time="Yesterday"
                    dotColor="bg-accents-orange"
                />
                <ActivityItem
                    title="Profile Updated"
                    description="Added 3 new professional photos to gallery."
                    time="Oct 20"
                    dotColor="bg-blue-600"
                />
                <ActivityItem
                    title="New Review"
                    description="&quot;Amazing venue and team, exceeded expectations!&quot;"
                    time="Oct 18"
                    dotColor="bg-blue-400"
                    isLast
                />
            </div>

            <div className="mt-4 pt-4 border-t border-neutrals-02">
                <Link href="/planner/activity" className="block text-center text-sm font-bold text-primary-01 hover:text-primary-02 transition-colors">
                    View Full History
                </Link>
            </div>
        </div>
    );
}
