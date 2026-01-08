'use client';

import { useState } from 'react';
import { X, Calendar, Clock, Users, MapPin, MessageSquare, Receipt, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';

interface BookingDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking?: DetailedBooking;
    onMessageClient?: () => void;
    onSendReceipt?: () => void;
}

export interface DetailedBooking {
    id: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    bookingNumber: string;
    eventName: string;
    client: {
        name: string;
        avatar?: string;
        rating: number;
        reviewCount: number;
    };
    dateRange: {
        startDate: Date;
        endDate: Date;
        timeRange: string;
    };
    guests: number;
    location: string;
    totalAmount: number;
    paymentDetails: {
        status: 'deposit_paid' | 'paid_full' | 'pending';
        items: Array<{
            name: string;
            amount: number;
        }>;
        paidAmount: number;
        balanceAmount: number;
        paidDate?: string;
        balanceDate?: string;
    };
    latestMessage?: {
        sender: string;
        message: string;
        timestamp: string;
        attachment?: string;
    };
}

const mockBooking: DetailedBooking = {
    id: 'bk-001',
    status: 'confirmed',
    bookingNumber: '#BK-9281-2023',
    eventName: "Sarah's Wedding",
    client: {
        name: 'Sarah Jenkins',
        avatar: '/avatars/sarah.jpg',
        rating: 5.0,
        reviewCount: 2,
    },
    dateRange: {
        startDate: new Date(2023, 9, 24),
        endDate: new Date(2023, 9, 26),
        timeRange: '10:00 AM - 11:00 PM',
    },
    guests: 150,
    location: 'The Grand Hall, downtown',
    totalAmount: 4500000,
    paymentDetails: {
        status: 'deposit_paid',
        items: [
            { name: 'Full Wedding Package', amount: 3000000 },
            { name: 'Photography Add-on (Premium)', amount: 1200000 },
            { name: 'Service Fee', amount: 300000 },
        ],
        paidAmount: 2250000,
        balanceAmount: 2250000,
        paidDate: 'Sep 12',
        balanceDate: 'Oct 24',
    },
    latestMessage: {
        sender: 'Sarah',
        message: 'Hi! We are really excited. Quick question about the lighting setup - can we do a walkthrough next Tuesday around 2pm?',
        timestamp: 'Yesterday, 4:20 PM',
        attachment: 'moodboard_v2.pdf',
    },
};

export default function BookingDetailsModal({ 
    isOpen, 
    onClose, 
    booking = mockBooking,
    onMessageClient,
    onSendReceipt 
}: BookingDetailsModalProps) {
    const [showActions, setShowActions] = useState(false);

    if (!isOpen) return null;

    const formatDate = (startDate: Date, endDate: Date) => {
        const start = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const end = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        if (startDate.getTime() === endDate.getTime()) {
            return end;
        }
        return `${start} - ${end}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'text-accents-discount bg-accents-discount/10';
            case 'pending':
                return 'text-accents-pending bg-accents-pending/10';
            case 'cancelled':
                return 'text-errors-main bg-errors-main/10';
            default:
                return 'text-neutrals-06 bg-neutrals-02';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-neutrals-03">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full uppercase ${getStatusColor(booking.status)}`}>
                                {booking.status}
                            </span>
                            <span className="text-sm text-neutrals-06">{booking.bookingNumber}</span>
                        </div>
                        <h2 className="text-2xl font-semibold text-shades-black">{booking.eventName}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-neutrals-02 rounded-md transition-colors"
                    >
                        <X size={20} className="text-neutrals-06" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Client Info */}
                    <div className="bg-neutrals-01 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-neutrals-02 shrink-0">
                                {booking.client.avatar ? (
                                    <Image 
                                        src={booking.client.avatar} 
                                        alt={booking.client.name} 
                                        width={48} 
                                        height={48} 
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-shades-black">
                                        {booking.client.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-shades-black">{booking.client.name}</h3>
                                <div className="text-sm text-neutrals-06">Client</div>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-accents-pending">★</span>
                                    <span className="text-sm font-medium">{booking.client.rating}</span>
                                    <span className="text-sm text-neutrals-06">({booking.client.reviewCount} reviews)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-neutrals-06">
                            <Calendar size={16} />
                            <span>{formatDate(booking.dateRange.startDate, booking.dateRange.endDate)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-neutrals-06">
                            <Clock size={16} />
                            <span>{booking.dateRange.timeRange}</span>
                        </div>
                        <div className="flex items-center gap-3 text-neutrals-06">
                            <Users size={16} />
                            <span>{booking.guests} Guests</span>
                        </div>
                        <div className="flex items-center gap-3 text-neutrals-06">
                            <MapPin size={16} />
                            <span>{booking.location}</span>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-shades-black">Payment Details</h3>
                            <div className="text-right">
                                <div className="text-sm text-neutrals-06">Total Amount</div>
                                <div className="text-2xl font-bold text-shades-black">
                                    UGX {booking.totalAmount.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="bg-neutrals-01 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-neutrals-06">Status</span>
                                <span className="px-2 py-1 bg-accents-discount text-accents-discount bg-accents-discount/10 text-xs font-medium rounded-full">
                                    Deposit Paid
                                </span>
                            </div>

                            {/* Payment Breakdown */}
                            <div className="space-y-2 mb-4">
                                {booking.paymentDetails.items.map((item, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                        <span className="text-shades-black">{item.name}</span>
                                        <span className="text-shades-black">UGX {item.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Payment Status */}
                            <div className="space-y-2 pt-4 border-t border-neutrals-03">
                                <div className="flex justify-between text-sm">
                                    <span className="text-accents-discount">Paid on {booking.paymentDetails.paidDate}</span>
                                    <span className="text-accents-discount">- UGX {booking.paymentDetails.paidAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-accents-pending">Balance Due ({booking.paymentDetails.balanceDate})</span>
                                    <span className="text-accents-pending font-semibold">UGX {booking.paymentDetails.balanceAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-neutrals-03">
                                <button className="w-full text-center text-sm text-primary-01 hover:text-primary-01/80 transition-colors">
                                    View Receipt
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Latest Message */}
                    {booking.latestMessage && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-shades-black">Latest Message</h3>
                                <button className="text-sm text-primary-01 hover:text-primary-01/80 transition-colors">
                                    Open Full Chat
                                </button>
                            </div>

                            <div className="bg-neutrals-01 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary-01 text-white text-sm font-semibold flex items-center justify-center shrink-0">
                                        {booking.latestMessage.sender[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-shades-black">{booking.latestMessage.sender}</span>
                                            <span className="text-sm text-neutrals-06">{booking.latestMessage.timestamp}</span>
                                        </div>
                                        <p className="text-sm text-shades-black mb-3">
                                            {booking.latestMessage.message}
                                        </p>
                                        {booking.latestMessage.attachment && (
                                            <div className="flex items-center gap-2 text-sm text-primary-01">
                                                <Receipt size={16} />
                                                <span>{booking.latestMessage.attachment}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onMessageClient}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-01 text-white rounded-lg hover:bg-primary-01/90 transition-colors"
                        >
                            <MessageSquare size={16} />
                            Message Sarah
                        </button>
                        <button
                            onClick={onSendReceipt}
                            className="px-4 py-3 bg-shades-white border border-neutrals-04 text-shades-black rounded-lg hover:bg-neutrals-02 transition-colors"
                        >
                            Send Receipt
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowActions(!showActions)}
                                className="p-3 bg-shades-white border border-neutrals-04 text-shades-black rounded-lg hover:bg-neutrals-02 transition-colors"
                            >
                                <MoreHorizontal size={16} />
                            </button>
                            {showActions && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-neutrals-03 rounded-lg shadow-lg z-20 py-1">
                                        <button className="w-full px-4 py-2 text-sm text-left hover:bg-neutrals-02 transition-colors">
                                            Export Details
                                        </button>
                                        <button className="w-full px-4 py-2 text-sm text-left hover:bg-neutrals-02 transition-colors">
                                            Duplicate Booking
                                        </button>
                                        <button className="w-full px-4 py-2 text-sm text-left hover:bg-neutrals-02 transition-colors text-errors-main">
                                            Cancel Booking
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}