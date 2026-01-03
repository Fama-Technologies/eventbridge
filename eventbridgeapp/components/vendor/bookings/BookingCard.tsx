'use client';

import Image from 'next/image';
import { Calendar, Users, MapPin, Clock, MessageSquare, Eye, DollarSign, CheckCircle, XCircle } from 'lucide-react';

export type BookingStatus = 'upcoming' | 'in_progress' | 'completed' | 'cancelled';

export interface Booking {
    id: string;
    name: string;
    initials?: string;
    avatar?: string;
    eventType: string;
    eventDate: string;
    eventTime?: string;
    location?: string;
    guests: number;
    totalAmount: string;
    paidAmount?: string;
    status: BookingStatus;
    bookedAt: string;
    paymentStatus?: 'paid' | 'partial' | 'pending';
}

interface BookingCardProps {
    booking: Booking;
    onViewDetails?: (booking: Booking) => void;
    onMessage?: (booking: Booking) => void;
    onCancel?: (booking: Booking) => void;
    onMarkComplete?: (booking: Booking) => void;
}

const statusConfig: Record<BookingStatus, { label: string; bgColor: string; textColor: string; dotColor: string }> = {
    upcoming: {
        label: 'UPCOMING',
        bgColor: 'bg-accents-info/10',
        textColor: 'text-accents-info',
        dotColor: 'bg-accents-info',
    },
    in_progress: {
        label: 'IN PROGRESS',
        bgColor: 'bg-accents-pending/10',
        textColor: 'text-accents-pending',
        dotColor: 'bg-accents-pending',
    },
    completed: {
        label: 'COMPLETED',
        bgColor: 'bg-accents-discount/10',
        textColor: 'text-accents-discount',
        dotColor: 'bg-accents-discount',
    },
    cancelled: {
        label: 'CANCELLED',
        bgColor: 'bg-errors-main/10',
        textColor: 'text-errors-main',
        dotColor: 'bg-errors-main',
    },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
    paid: { label: 'Paid in Full', color: 'text-accents-discount' },
    partial: { label: 'Partial Payment', color: 'text-accents-pending' },
    pending: { label: 'Payment Pending', color: 'text-errors-main' },
};

export default function BookingCard({ booking, onViewDetails, onMessage, onCancel, onMarkComplete }: BookingCardProps) {
    const config = statusConfig[booking.status];
    const paymentConfig = booking.paymentStatus ? paymentStatusConfig[booking.paymentStatus] : null;
    const isCompleted = booking.status === 'completed';
    const isCancelled = booking.status === 'cancelled';

    return (
        <div className={`bg-shades-white rounded-xl border border-neutrals-03 p-5 transition-all hover:shadow-md ${
            isCancelled ? 'opacity-70' : ''
        }`}>
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Left: Avatar and Info */}
                <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-neutrals-02">
                            {booking.avatar ? (
                                <Image src={booking.avatar} alt={booking.name} width={48} height={48} className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-shades-black">
                                    {booking.initials || booking.name.split(' ').map(n => n[0]).join('')}
                                </div>
                            )}
                        </div>
                        {isCompleted && (
                            <div className="absolute -bottom-1 -right-1">
                                <CheckCircle size={16} className="text-accents-discount fill-white" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold text-shades-black">{booking.name}</h3>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
                                {config.label}
                            </span>
                        </div>
                        <p className="text-sm text-primary-01 mt-0.5">{booking.eventType}</p>

                        {/* Event Details */}
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-neutrals-06">
                            <span className="inline-flex items-center gap-1.5">
                                <Calendar size={14} />
                                {booking.eventDate}
                            </span>
                            {booking.eventTime && (
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock size={14} />
                                    {booking.eventTime}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1.5">
                                <Users size={14} />
                                {booking.guests} Guests
                            </span>
                            {booking.location && (
                                <span className="inline-flex items-center gap-1.5">
                                    <MapPin size={14} />
                                    {booking.location}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Amount and Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 lg:gap-2">
                    {/* Amount */}
                    <div className="text-right">
                        <div className="flex items-center gap-1.5">
                            <DollarSign size={16} className="text-shades-black" />
                            <span className="text-lg font-bold text-shades-black">{booking.totalAmount}</span>
                        </div>
                        {paymentConfig && (
                            <span className={`text-xs ${paymentConfig.color}`}>
                                {paymentConfig.label}
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onViewDetails?.(booking)}
                            className="px-3 py-2 text-sm font-medium text-shades-black bg-shades-white border border-neutrals-04 rounded-lg hover:bg-neutrals-02 transition-colors flex items-center gap-1.5"
                        >
                            <Eye size={16} />
                            Details
                        </button>

                        {!isCancelled && !isCompleted && (
                            <button
                                onClick={() => onMessage?.(booking)}
                                className="px-3 py-2 text-sm font-medium text-shades-black bg-shades-white border border-neutrals-04 rounded-lg hover:bg-neutrals-02 transition-colors flex items-center gap-1.5"
                            >
                                <MessageSquare size={16} />
                                Message
                            </button>
                        )}

                        {booking.status === 'in_progress' && (
                            <button
                                onClick={() => onMarkComplete?.(booking)}
                                className="px-3 py-2 text-sm font-medium text-white bg-accents-discount rounded-lg hover:bg-accents-discount/90 transition-colors flex items-center gap-1.5"
                            >
                                <CheckCircle size={16} />
                                Complete
                            </button>
                        )}

                        {booking.status === 'upcoming' && (
                            <button
                                onClick={() => onCancel?.(booking)}
                                className="px-3 py-2 text-sm font-medium text-errors-main bg-shades-white border border-errors-main/30 rounded-lg hover:bg-errors-bg transition-colors flex items-center gap-1.5"
                            >
                                <XCircle size={16} />
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
