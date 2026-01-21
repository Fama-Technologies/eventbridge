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

    const handleSendInvoice = () => {
        // Navigate to create invoice page
        router.push(`/vendor/invoices/create?leadId=${lead.id}`);
        onClose();
    };

    const handleChatClick = () => {
        // Navigate to messages page with conversation ID
        if (lead.conversationId) {
            router.push(`/vendor/messages?conversation=${lead.conversationId}`);
        } else {
            // If no conversation exists, navigate to messages with lead info
            router.push(`/vendor/messages?newChat=${lead.id}&name=${encodeURIComponent(lead.name)}`);
        }
        onClose();
    };

    const tabs = [
        { id: 'details', label: 'Details' },
        { id: 'messages', label: 'Messages', count: lead.messageCount || 1 },
        { id: 'attachments', label: 'Attachments' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-shades-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden mx-4 animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-neutrals-06 hover:text-shades-black hover:bg-neutrals-02 rounded-full transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="p-8 pb-0 border-b border-neutrals-02">
                    <div className="flex items-start gap-5">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-shades-white shadow-sm">
                                {lead.avatar ? (
                                    <img src={lead.avatar} alt={lead.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-neutrals-02 flex items-center justify-center text-xl font-semibold text-shades-black">
                                        {lead.initials || lead.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-shades-white" />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-shades-black">{lead.name}</h2>
                            </div>
                            <p className="text-primary-01 text-sm font-medium mt-0.5">
                                {lead.eventType} – {lead.eventDate}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-3 mt-3">
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-neutrals-01 rounded-full text-sm font-medium text-shades-black">
                                    <Users size={16} className="text-neutrals-06" />
                                    {lead.guests} Guests
                                </span>
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-neutrals-01 rounded-full text-sm font-medium text-shades-black">
                                    <DollarSign size={16} className="text-neutrals-06" />
                                    {lead.budget} Est. Budget
                                </span>
                                {lead.location && (
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-neutrals-01 rounded-full text-sm font-medium text-shades-black">
                                        <MapPin size={16} className="text-neutrals-06" />
                                        {lead.location}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-8 mt-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as 'details' | 'messages' | 'attachments')}
                                className={`pb-4 text-sm font-medium transition-all relative ${activeTab === tab.id
                                    ? 'text-primary-01 font-bold'
                                    : 'text-neutrals-06 hover:text-shades-black'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    {tab.label}
                                    {tab.count && (
                                        <span className="w-5 h-5 rounded-full bg-neutrals-03 text-neutrals-07 text-xs flex items-center justify-center">
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

                {/* Content Area */}
                <div className="flex flex-col lg:flex-row h-[550px]"> {/* Fixed height for consistency */}

                    {/* Main Content */}
                    <div className="flex-1 p-8 overflow-y-auto border-r border-neutrals-02">
                        {activeTab === 'details' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                {/* Inquiry Note */}
                                {lead.inquiryNote && (
                                    <div className="relative">
                                        <span className="absolute -top-2.5 left-4 px-2 bg-shades-white text-[10px] uppercase tracking-wider font-bold text-neutrals-04 border border-neutrals-02 rounded-md">
                                            Inquiry Note
                                        </span>
                                        <div className="p-6 bg-neutrals-01 rounded-2xl border border-neutrals-02">
                                            <p className="text-shades-black text-sm leading-relaxed">
                                                "{lead.inquiryNote}"
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Event Requirements */}
                                <div>
                                    <h3 className="text-lg font-bold text-shades-black mb-6">Event Requirements</h3>
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-neutrals-05 font-semibold mb-1 transform rotate-180 scale-x-[-1] inline-block">Event Type</p>
                                            <p className="text-sm uppercase tracking-wider text-neutrals-05 font-semibold mb-1">EVENT TYPE</p>
                                            <p className="font-semibold text-shades-black transform rotate-180 scale-x-[-1] inline-block">{lead.eventType}</p>
                                            <p className="font-semibold text-shades-black">{lead.eventType}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-neutrals-05 font-semibold mb-1">DURATION</p>
                                            <p className="font-semibold text-shades-black">{lead.duration || '1 Day'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-neutrals-05 font-semibold mb-1">PREFERRED TIME</p>
                                            <p className="font-semibold text-shades-black">{lead.preferredTime || 'Morning Start (9:00 AM)'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-neutrals-05 font-semibold mb-1">FLEXIBILITY</p>
                                            <p className="font-semibold text-shades-black">{lead.flexibility || '+/- 2 Days'}</p>
                                        </div>
                                    </div>

                                    {/* Special Requirements */}
                                    <div className="mt-8">
                                        <p className="text-xs uppercase tracking-wider text-neutrals-05 font-semibold mb-3">SPECIAL REQUIREMENTS</p>
                                        <div className="flex flex-wrap gap-2">
                                            {lead.specialRequirements ? (
                                                lead.specialRequirements.map((req) => (
                                                    <span key={req} className="px-4 py-1.5 bg-errors-bg text-primary-01 rounded-full text-sm font-medium">
                                                        {req}
                                                    </span>
                                                ))
                                            ) : (
                                                <>
                                                    <span className="px-4 py-1.5 bg-errors-bg text-primary-01 rounded-full text-sm font-medium">Decor</span>
                                                    <span className="px-4 py-1.5 bg-errors-bg text-primary-01 rounded-full text-sm font-medium">Catering</span>
                                                    <span className="px-4 py-1.5 bg-errors-bg text-primary-01 rounded-full text-sm font-medium">DJ</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'messages' && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <MessageSquare size={48} className="text-neutrals-04 mb-4" />
                                <h3 className="text-lg font-semibold text-shades-black">No messages yet</h3>
                                <p className="text-neutrals-06 max-w-xs mt-2">Start a conversation to discuss details with {lead.name.split(' ')[0]}.</p>
                            </div>
                        )}

                        {activeTab === 'attachments' && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <FileText size={48} className="text-neutrals-04 mb-4" />
                                <h3 className="text-lg font-semibold text-shades-black">No attachments</h3>
                                <p className="text-neutrals-06 max-w-xs mt-2">Files shared between you and the client will appear here.</p>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar - Actions */}
                    <div className="w-full lg:w-[320px] bg-neutrals-01 p-6 lg:p-8 flex flex-col gap-6">

                        {/* Response Timer */}
                        {lead.status === 'new' && (
                            <div className="flex items-center gap-3 p-4 bg-errors-bg rounded-xl border border-errors-main/20">
                                <div className="p-2 bg-white rounded-full text-errors-main">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-errors-main uppercase tracking-wide">RESPONSE NEEDED</p>
                                    <p className="text-errors-main font-bold text-sm">{lead.responseTime || '1h 42m remaining'}</p>
                                </div>
                            </div>
                        )}

                        {/* Primary Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={handleSendInvoice}
                                className="w-full py-3.5 bg-primary-01 hover:bg-primary-02 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all transform hover:scale-[1.02]"
                            >
                                <Receipt size={18} />
                                Send Invoice
                            </button>

                            <button
                                onClick={handleChatClick}
                                className="w-full py-3.5 bg-shades-white border border-neutrals-03 hover:border-text-shades-black text-shades-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                            >
                                <MessageSquare size={18} />
                                Chat with {lead.name.split(' ')[0]}
                            </button>
                        </div>

                        <div className="h-px bg-neutrals-03 w-full my-1"></div>

                        {/* Secondary Actions List */}
                        <div className="space-y-1">
                            <button
                                onClick={() => onBlockDate?.(lead)}
                                className="w-full py-3 px-2 flex items-center gap-3 text-neutrals-06 hover:text-shades-black hover:bg-black/5 rounded-lg transition-colors text-sm font-medium"
                            >
                                <Calendar size={18} />
                                Block Date Tentatively
                            </button>
                            <button
                                onClick={() => onForward?.(lead)}
                                className="w-full py-3 px-2 flex items-center gap-3 text-neutrals-06 hover:text-shades-black hover:bg-black/5 rounded-lg transition-colors text-sm font-medium"
                            >
                                <ArrowRight size={18} />
                                Forward to Team
                            </button>
                            <button
                                onClick={() => onDecline?.(lead)}
                                className="w-full py-3 px-2 flex items-center gap-3 text-errors-main hover:bg-errors-bg rounded-lg transition-colors text-sm font-medium"
                            >
                                <Ban size={18} />
                                Decline Lead
                            </button>
                        </div>

                        {/* Pro Tip */}
                        <div className="mt-auto p-4 bg-neutrals-01 border border-accents-link/20 rounded-xl">
                            <div className="flex gap-2">
                                <Info size={16} className="text-accents-link shrink-0 mt-0.5" />
                                <p className="text-xs text-accents-link leading-relaxed">
                                    <span className="font-bold">Pro Tip:</span> Responding within 2 hours increases booking probability by 40%.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
