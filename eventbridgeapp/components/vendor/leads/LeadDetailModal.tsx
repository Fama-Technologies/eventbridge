'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Users, DollarSign, MapPin, Clock, Send, MessageSquare, Calendar, ArrowRight, Ban, Info, FileText, Receipt } from 'lucide-react';
import Image from 'next/image';
import type { Lead } from './LeadCard';

interface LeadDetailModalProps {
    lead: Lead | null;
    isOpen: boolean;
    onClose: () => void;
    onSendQuote?: (lead: Lead) => void;
    onSendInvoice?: (lead: Lead) => void;
    onChat?: (lead: Lead) => void;
    onBlockDate?: (lead: Lead) => void;
    onForward?: (lead: Lead) => void;
    onDecline?: (lead: Lead) => void;
}

export default function LeadDetailModal({
    lead,
    isOpen,
    onClose,
    onSendQuote,
    onSendInvoice,
    onChat,
    onBlockDate,
    onForward,
    onDecline,
}: LeadDetailModalProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'details' | 'messages' | 'attachments'>('details');

    if (!isOpen || !lead) return null;

    const handleChatClick = () => {
        // Navigate to messages page with conversation ID
        if (lead.conversationId) {
            router.push(`/vendor/messages?conversation=${lead.conversationId}`);
        } else {
            // If no conversation exists, navigate to messages with lead info
            router.push(`/vendor/messages?newChat=${lead.id}&name=${encodeURIComponent(lead.name)}`);
        }
        onClose(); // Close the modal after navigation
    };

    const tabs = [
        { id: 'details', label: 'Details' },
        { id: 'messages', label: 'Messages', count: lead.messageCount || 0 },
        { id: 'attachments', label: 'Attachments' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-shades-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-neutrals-06 hover:text-shades-black hover:bg-neutrals-02 rounded-lg transition-colors z-10"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="p-6 pb-4">
                    <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-neutrals-02">
                                {lead.avatar ? (
                                    <Image src={lead.avatar} alt={lead.name} width={64} height={64} className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-shades-black">
                                        {lead.initials || lead.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accents-discount rounded-full border-2 border-shades-white" />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-shades-black">{lead.name}</h2>
                            <p className="text-primary-01 text-sm">{lead.eventType} – {lead.eventDate}</p>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-shades-white border border-neutrals-03 rounded-full text-sm text-shades-black">
                                    <Users size={14} />
                                    {lead.guests} Guests
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-shades-white border border-neutrals-03 rounded-full text-sm text-shades-black">
                                    <DollarSign size={14} />
                                    ${lead.budget} Est. Budget
                                </span>
                                {lead.location && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-shades-white border border-neutrals-03 rounded-full text-sm text-shades-black">
                                        <MapPin size={14} />
                                        {lead.location}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-6 mt-6 border-b border-neutrals-03">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as 'details' | 'messages' | 'attachments')}
                                className={`pb-3 text-sm font-medium transition-colors relative ${
                                    activeTab === tab.id
                                        ? 'text-primary-01'
                                        : 'text-neutrals-06 hover:text-shades-black'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    {tab.label}
                                    {tab.count && (
                                        <span className="w-5 h-5 rounded-full bg-neutrals-06 text-white text-xs flex items-center justify-center">
                                            {tab.count}
                                        </span>
                                    )}
                                </span>
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-01" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col lg:flex-row max-h-[60vh] overflow-hidden">
                    {/* Left Content */}
                    <div className="flex-1 p-6 pt-0 overflow-y-auto">
                        {activeTab === 'details' && (
                            <div className="space-y-6">
                                {/* Inquiry Note */}
                                {lead.inquiryNote && (
                                    <div>
                                        <span className="text-xs font-medium text-primary-01 uppercase tracking-wider">Inquiry Note</span>
                                        <div className="mt-2 p-4 bg-neutrals-01 rounded-lg border-l-4 border-primary-01">
                                            <p className="text-sm text-shades-black italic leading-relaxed">
                                                {lead.inquiryNote}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Event Requirements */}
                                <div>
                                    <h3 className="text-lg font-semibold text-shades-black mb-4">Event Requirements</h3>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                        <div>
                                            <span className="text-xs font-medium text-neutrals-06 uppercase tracking-wider">Event Type</span>
                                            <p className="text-sm font-medium text-shades-black mt-1">{lead.eventType}</p>
                                        </div>
                                        {lead.duration && (
                                            <div>
                                                <span className="text-xs font-medium text-neutrals-06 uppercase tracking-wider">Duration</span>
                                                <p className="text-sm font-medium text-shades-black mt-1">{lead.duration}</p>
                                            </div>
                                        )}
                                        {lead.preferredTime && (
                                            <div>
                                                <span className="text-xs font-medium text-neutrals-06 uppercase tracking-wider">Preferred Time</span>
                                                <p className="text-sm font-medium text-shades-black mt-1">{lead.preferredTime}</p>
                                            </div>
                                        )}
                                        {lead.flexibility && (
                                            <div>
                                                <span className="text-xs font-medium text-neutrals-06 uppercase tracking-wider">Flexibility</span>
                                                <p className="text-sm font-medium text-shades-black mt-1">{lead.flexibility}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Special Requirements */}
                                    {lead.specialRequirements && lead.specialRequirements.length > 0 && (
                                        <div className="mt-4">
                                            <span className="text-xs font-medium text-neutrals-06 uppercase tracking-wider">Special Requirements</span>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {lead.specialRequirements.map((req) => (
                                                    <span
                                                        key={req}
                                                        className="px-3 py-1.5 bg-primary-01/10 text-primary-01 rounded-full text-sm font-medium"
                                                    >
                                                        {req}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'messages' && (
                            <div className="text-center py-12 text-neutrals-06">
                                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Messages will appear here</p>
                            </div>
                        )}

                        {activeTab === 'attachments' && (
                            <div className="text-center py-12 text-neutrals-06">
                                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No attachments yet</p>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-full lg:w-72 p-6 bg-neutrals-01 border-t lg:border-t-0 lg:border-l border-neutrals-03">
                        {/* Response Timer - only for new leads */}
                        {lead.status === 'new' && lead.responseTime && (
                            <div className="text-center mb-6">
                                <span className="text-xs font-medium text-primary-01 uppercase tracking-wider">Response Needed</span>
                                <div className="flex items-center justify-center gap-2 mt-1">
                                    <Clock size={16} className="text-primary-01" />
                                    <span className="text-primary-01 font-semibold">{lead.responseTime}</span>
                                </div>
                            </div>
                        )}

                        {/* Invoice Sent Status */}
                        {lead.status === 'invoice_sent' && (
                            <div className="text-center mb-6 p-3 bg-[#FEF3C7] rounded-lg">
                                <span className="text-xs font-medium text-[#D97706] uppercase tracking-wider">Payment Pending</span>
                                <p className="text-sm text-[#D97706] mt-1">Invoice sent, awaiting payment</p>
                            </div>
                        )}

                        {/* Booked Status */}
                        {lead.status === 'booked' && (
                            <div className="text-center mb-6 p-3 bg-[#D1FAE5] rounded-lg">
                                <span className="text-xs font-medium text-[#047857] uppercase tracking-wider">Booking Confirmed</span>
                                <p className="text-sm text-[#047857] mt-1">Payment received</p>
                            </div>
                        )}

                        {/* Action Buttons - Dynamic based on status */}
                        <div className="space-y-3">
                            {/* New Lead: Send Quote */}
                            {(lead.status === 'new' || lead.status === 'responded') && (
                                <button
                                    onClick={() => onSendQuote?.(lead)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-01 text-white rounded-lg hover:bg-primary-02 transition-colors font-medium"
                                >
                                    <Send size={18} />
                                    Send Quote
                                </button>
                            )}

                            {/* Quote Sent: Send Invoice */}
                            {lead.status === 'quote_sent' && (
                                <button
                                    onClick={() => onSendInvoice?.(lead)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-01 text-white rounded-lg hover:bg-primary-02 transition-colors font-medium"
                                >
                                    <FileText size={18} />
                                    Send Invoice
                                </button>
                            )}

                            {/* Invoice Sent: Send Reminder */}
                            {lead.status === 'invoice_sent' && (
                                <button
                                    onClick={handleChatClick}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#F59E0B] text-white rounded-lg hover:bg-[#D97706] transition-colors font-medium"
                                >
                                    <Send size={18} />
                                    Send Payment Reminder
                                </button>
                            )}

                            {/* Booked: View Booking */}
                            {lead.status === 'booked' && (
                                <button
                                    onClick={handleChatClick}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#047857] text-white rounded-lg hover:bg-[#065F46] transition-colors font-medium"
                                >
                                    <Receipt size={18} />
                                    View Booking Details
                                </button>
                            )}

                            <button
                                onClick={handleChatClick}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-shades-white border border-neutrals-04 text-shades-black rounded-lg hover:bg-neutrals-02 transition-colors font-medium"
                            >
                                <MessageSquare size={18} />
                                Chat with {lead.name.split(' ')[0]}
                            </button>
                        </div>

                        {/* Secondary Actions */}
                        <div className="mt-6 space-y-2">
                            {lead.status !== 'booked' && (
                                <button
                                    onClick={() => onBlockDate?.(lead)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutrals-07 hover:text-shades-black hover:bg-shades-white rounded-lg transition-colors"
                                >
                                    <Calendar size={18} />
                                    Block Date Tentatively
                                </button>
                            )}

                            <button
                                onClick={() => onForward?.(lead)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutrals-07 hover:text-shades-black hover:bg-shades-white rounded-lg transition-colors"
                            >
                                <ArrowRight size={18} />
                                Forward to Team
                            </button>

                            {lead.status !== 'booked' && lead.status !== 'declined' && (
                                <button
                                    onClick={() => onDecline?.(lead)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-errors-main hover:bg-errors-bg rounded-lg transition-colors"
                                >
                                    <Ban size={18} />
                                    Decline Lead
                                </button>
                            )}
                        </div>

                        {/* Pro Tip - Dynamic based on status */}
                        {lead.status === 'new' && (
                            <div className="mt-6 p-3 bg-primary-01/10 rounded-lg">
                                <div className="flex gap-2">
                                    <Info size={16} className="text-primary-01 shrink-0 mt-0.5" />
                                    <p className="text-xs text-primary-01">
                                        <span className="font-semibold">Pro Tip:</span> Responding within 2 hours increases booking probability by 40%.
                                    </p>
                                </div>
                            </div>
                        )}

                        {lead.status === 'invoice_sent' && (
                            <div className="mt-6 p-3 bg-[#FEF3C7]/50 rounded-lg">
                                <div className="flex gap-2">
                                    <Info size={16} className="text-[#D97706] shrink-0 mt-0.5" />
                                    <p className="text-xs text-[#D97706]">
                                        <span className="font-semibold">Tip:</span> Follow up within 48 hours if payment is not received.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
