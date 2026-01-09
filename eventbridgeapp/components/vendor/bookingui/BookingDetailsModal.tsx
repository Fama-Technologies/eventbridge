"use client";
import { X, Calendar, Clock, Users, MapPin, Star, MessageSquare, FileText } from "lucide-react";

interface PaymentItem {
    label: string;
    amount: number;
    type?: 'normal' | 'paid' | 'due';
}

interface Message {
    sender: string;
    avatar?: string;
    time: string;
    content: string;
    attachment?: string;
}

interface BookingDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    booking: {
        id: string;
        status: 'confirmed' | 'pending';
        title: string;
        client: {
            name: string;
            avatar?: string;
            rating: number;
            reviews: number;
        };
        dateRange: string;
        timeRange: string;
        guests: number;
        venue: string;
        totalAmount: number;
        paymentStatus: string;
        payments: PaymentItem[];
        latestMessage?: Message;
    };
}

export default function BookingDetailsModal({ isOpen, onClose, booking }: BookingDetailsProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            
            {/* Modal */}
            <div className="relative bg-shades-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 shadow-xl">
                {/* Header */}
                <div className="sticky top-0 bg-shades-white p-6 pb-4 border-b border-neutrals-03">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-[#D1FAE520] text-accents-discount text-xs font-semibold px-3 py-1 rounded-full uppercase">
                                    {booking.status}
                                </span>
                                <span className="text-neutrals-06 text-sm">#{booking.id}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-shades-black">{booking.title}</h2>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-neutrals-02 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-neutrals-06" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Client Info + Event Details */}
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Client Card */}
                        <div className="flex items-center gap-3 p-4 bg-neutrals-01 rounded-xl">
                            <div className="w-14 h-14 rounded-full overflow-hidden bg-neutrals-03">
                                {booking.client.avatar ? (
                                    <img src={booking.client.avatar} alt={booking.client.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutrals-06 font-medium">
                                        {booking.client.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-shades-black">{booking.client.name}</h3>
                                <p className="text-sm text-neutrals-06">Client</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <Star size={14} className="text-primary-01 fill-primary-01" />
                                    <span className="text-sm text-shades-black font-medium">{booking.client.rating}</span>
                                    <span className="text-sm text-shades-black">({booking.client.reviews} reviews)</span>
                                </div>
                            </div>
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 text-shades-black">
                                <Calendar size={18} className="text-neutrals-05" />
                                <span>{booking.dateRange}</span>
                            </div>
                            <div className="flex items-center gap-3 text-shades-black">
                                <Clock size={18} className="text-neutrals-05" />
                                <span>{booking.timeRange}</span>
                            </div>
                            <div className="flex items-center gap-3 text-shades-black">
                                <Users size={18} className="text-neutrals-05" />
                                <span>{booking.guests} Guests</span>
                            </div>
                            <div className="flex items-center gap-3 text-shades-black">
                                <MapPin size={18} className="text-neutrals-05" />
                                <span>{booking.venue}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-shades-black">Payment Details</h3>
                            <div className="text-right">
                                <p className="text-sm text-neutrals-06">Total Amount</p>
                                <p className="text-2xl font-bold text-shades-black">UGX {booking.totalAmount.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="border border-neutrals-0    3 rounded-xl overflow-hidden">
                            {/* Status Row */}
                            <div className="flex items-center justify-between px-4 py-3 bg-neutrals-01 border-b border-neutrals-03">
                                <span className="text-neutrals-07">Status</span>
                                <span className="flex items-center gap-1.5 text-accents-discount font-medium">
                                    <span className="w-2 h-2 rounded-full bg-accents-discount"></span>
                                    {booking.paymentStatus}
                                </span>
                            </div>

                            {/* Payment Items */}
                            <div className="divide-y divide-neutrals-03">
                                {booking.payments.map((item, index) => (
                                    <div 
                                        key={index} 
                                        className={`flex items-center justify-between px-4 py-3 ${
                                            item.type === 'paid' ? 'text-accents-discount' : 
                                            item.type === 'due' ? 'text-primary-01' : 
                                            'text-shades-black'
                                        }`}
                                    >
                                        <span className={item.type ? 'font-medium' : ''}>{item.label}</span>
                                        <span className="font-medium">
                                            {item.type === 'paid' ? '- ' : ''}UGX {item.amount.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* View Receipt */}
                            <div className="px-4 py-3 bg-neutrals-01 border-t border-neutrals-03 text-right">
                                <button className="text-shades-black font-medium underline hover:no-underline">
                                    View Receipt
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Latest Message */}
                    {booking.latestMessage && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-shades-black">Latest Message</h3>
                                <button className="text-shades-black font-medium underline hover:no-underline">
                                    Open Full Chat
                                </button>
                            </div>

                            <div className="border border-neutrals-03 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-neutrals-03 flex-shrink-0">
                                        {booking.latestMessage.avatar ? (
                                            <img src={booking.latestMessage.avatar} alt={booking.latestMessage.sender} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutrals-06 text-sm font-medium">
                                                {booking.latestMessage.sender[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-shades-black">{booking.latestMessage.sender}</span>
                                            <span className="text-xs text-neutrals-06">{booking.latestMessage.time}</span>
                                        </div>
                                        <p className="text-neutrals-07 text-sm">{booking.latestMessage.content}</p>
                                        
                                        {booking.latestMessage.attachment && (
                                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-neutrals-01 rounded-lg border border-neutrals-03">
                                                <FileText size={16} className="text-primary-01" />
                                                <span className="text-sm text-shades-black">{booking.latestMessage.attachment}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-shades-white  border-t border-neutrals-03 p-4 flex items-center gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 bg-primary-01 hover:bg-primary-02 text-white font-medium py-3 px-6 rounded-xl transition-colors">
                        <MessageSquare size={18} />
                        Message {booking.client.name.split(' ')[0]}
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 border border-neutrals-03 hover:bg-neutrals-02 text-shades-black font-medium py-3 px-6 rounded-xl transition-colors">
                        Send Receipt
                    </button>
                    <button className="p-3 border border-neutrals-03 hover:bg-neutrals-02 rounded-xl transition-colors">
                        <span className="text-neutrals-06">•••</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
