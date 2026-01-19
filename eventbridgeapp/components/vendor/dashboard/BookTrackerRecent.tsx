'use client';

import Link from 'next/link';
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useDashboardData } from './DashboardDataProvider';

interface TimelineEvent {
  id: string | number;
  title: string;
  description: React.ReactNode;
  time: string;
  status: 'confirmed' | 'processed' | 'updated' | 'review';
}

function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'RECENTLY';
  return new Intl.DateTimeFormat('en-UG', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export default function BookTrackerRecent() {
  const { data, loading } = useDashboardData();

  const recentActivity = data?.recentActivity ?? [];
  const recentBookings = data?.recentBookings ?? [];

  const events: TimelineEvent[] = recentActivity.length
    ? recentActivity.map((activity) => ({
      id: activity.id,
      title:
        activity.type === 'booking_confirmed'
          ? 'Booking Confirmed'
          : 'New Booking Request',
      description: activity.message,
      time: formatRelativeDate(activity.timestamp),
      status: activity.type === 'booking_confirmed' ? 'confirmed' : 'processed',
    }))
    : recentBookings.map((booking) => ({
      id: booking.id,
      title: 'Booking Update',
      description: (
        <>
          {booking.eventName} for{' '}
          <span className="text-shades-black font-medium">
            {booking.clientName}
          </span>{' '}
          is now {booking.status}.
        </>
      ),
      time: formatRelativeDate(booking.createdAt),
      status: booking.status === 'confirmed' ? 'confirmed' : 'review',
    }));

  const getDotColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-accents-discount';
      case 'processed':
        return 'bg-primary-01';
      case 'updated':
      case 'review':
        return 'bg-neutrals-05';
      default:
        return 'bg-neutrals-05';
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-10">
        <Loader2 className="animate-spin text-primary-01" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="font-font1 font-semibold text-[18px] leading-6 text-shades-black mb-6">
        Recent Activity
      </h2>
      <div className="relative flex flex-col gap-0 bg-shades-white p-6 rounded-xl border border-neutrals-03 shadow-sm transition-colors duration-300">
        {events.length === 0 ? (
          <p className="text-neutrals-06 text-sm text-center py-4">
            No recent activity.
          </p>
        ) : (
          events.map((event, index) => (
            <div key={event.id} className="relative pl-6 pb-8 last:pb-0">
              {index !== events.length - 1 && (
                <div
                  className={`absolute left-[4px] top-2 bottom-0 w-[1px] ${event.status === 'confirmed'
                    ? 'bg-accents-discount'
                    : 'bg-neutrals-03'
                    }`}
                />
              )}

              <div
                className={`absolute left-0 top-1.5 w-[9px] h-[9px] rounded-full ${getDotColor(
                  event.status
                )} z-10`}
              />

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
            href="/vendor/activity"
            className="font-font1 font-medium text-[14px] leading-5 text-primary-01 hover:text-primary-02 transition-colors"
          >
            View full history
          </Link>
        </div>
      </div>
    </div>
  );
}
