'use client';

import { Calendar, Users, PartyPopper, Clock, Banknote, CircleCheckBig } from 'lucide-react';
import Image from 'next/image';

export type LeadStatus = 'new' | 'responded' | 'quote_sent' | 'booked';

export interface Lead {
    id: string;
    name: string;
    avatar?: string;
    initials?: string;
    eventType: string;
    eventDate: string;
    guests: number;
    budget: string;
    inquiredAt: string;
    status: LeadStatus;
    responseTime?: string;
    location?: string;
    duration?: string;
    preferredTime?: string;
    flexibility?: string;
    specialRequirements?: string[];
    inquiryNote?: string;
    messageCount?: number;
}

interface LeadCardProps {
    lead: Lead;
    onViewDetails: (lead: Lead) => void;
    onRespond?: (lead: Lead) => void;
    onDecline?: (lead: Lead) => void;
    onUpdateQuote?: (lead: Lead) => void;
    onMessage?: (lead: Lead) => void;
}

const statusConfig = {
    new: {
        label: 'NEW INQUIRY',
        bgColor: 'bg-[#2563EB]',
        textColor: 'text-white',
        cardBorder: 'border-l-4 border-l-accents-discount',
    },
    responded: {
        label: 'RESPONDED',
        bgColor: 'bg-[#F1F5F9]',
        textColor: 'text-[#475569]',
        cardBorder: 'border-l-4 border-l-neutrals-04',
    },
    quote_sent: {
        label: 'QUOTE SENT',
        bgColor: 'bg-[#F1F5F9]',
        textColor: 'text-[#475569]',
        cardBorder: 'border-l-4 border-l-neutrals-06',
        border:'border-2 border-[#E2E8F0]'
    },
    booked: {
        label: 'BOOKED',
        bgColor: 'bg-[#D1FAE5]',
        textColor: 'text-[#047857]',
        cardBorder: 'bg-[#A7F3D0] border-1',
    },
};

export default function LeadCard({
    lead,
    onViewDetails,
    onRespond,
    onDecline,
    onUpdateQuote,
    onMessage,
}: LeadCardProps) {
    const config = statusConfig[lead.status];
    const isBooked = lead.status === 'booked';

    return (
        <div className={`relative rounded-xl ${isBooked ? 'bg-neutrals-05 text-white' : 'bg-shades-white border border-neutrals-03'} ${!isBooked ? config.cardBorder : ''}`} style={{ boxShadow: '0px 1px 2px 0px #0000000D' }}>
            {/* Status Badge */}
            <div className="absolute -top-3 left-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor}`}>
                    {lead.status === 'quote_sent' && (
                        <CircleCheckBig size="20" />
                         
                    )}
                    {lead.status === 'booked' && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    )}
                    {config.label}
                </span>
            </div>

            <div className="p-5 pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3 min-w-[200px]">
                        <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center ${isBooked ? 'bg-primary-01' : 'bg-neutrals-02'}`}>
                            {lead.avatar ? (
                                <Image src={lead.avatar} alt={lead.name} width={48} height={48} className="object-cover" />
                            ) : (
                                <span className={`text-sm font-semibold ${isBooked ? 'text-white' : 'text-shades-black'}`}>
                                    {lead.initials || lead.name.split(' ').map(n => n[0]).join('')}
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className={`font-semibold ${isBooked ? 'text-white' : 'text-shades-black'}`}>{lead.name}</h3>
                            <p className={`text-sm ${isBooked ? 'text-white/70' : 'text-neutrals-06'}`}>Inquired {lead.inquiredAt}</p>
                        </div>
                    </div>

                    {/* Event Details */}
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="flex items-start gap-2">
                            <PartyPopper size={16} className={`mt-0.5 ${isBooked ? 'text-primary-01' : 'text-primary-01'}`} />
                            <div>
                                <p className={`text-sm font-medium ${isBooked ? 'text-white' : 'text-shades-black'}`}>{lead.eventType}</p>
                                <p className={`text-sm flex items-center gap-1 ${isBooked ? 'text-white/70' : 'text-neutrals-06'}`}>
                                    <Users size={14} />
                                    {lead.guests} Guests
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <Calendar size={16} className={`mt-0.5 ${isBooked ? 'text-white/70' : 'text-neutrals-06'}`} />
                            <div>
                                <p className={`text-sm ${isBooked ? 'text-white' : 'text-shades-black'}`}>{lead.eventDate}</p>
                                <p className={`text-sm font-semibold flex items-center gap-1 ${isBooked ? 'text-primary-01' : 'text-accents-discount'}`}>
                                    <span className="w-4 h-4 rounded  flex items-center justify-center text-[10px]">
                                    <Banknote />
                                    
                                    </span>
                                    UGX {lead.budget}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2 min-w-[150px]">
                        {lead.status === 'new' && (
                            <>
                                {lead.responseTime && (
                                    <span className="text-xs text-errors-main flex items-center gap-1 px-2 py-1 bg-primary-01/10 rounded-full">
                                        <Clock size={12} />
                                        Response in {lead.responseTime}
                                    </span>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onDecline?.(lead)}
                                        className="px-4 py-2 text-sm border border-neutrals-04 rounded-lg hover:bg-neutrals-02 transition-colors text-shades-black"
                                    >
                                        Decline
                                    </button>
                                    <button
                                        onClick={() => onRespond?.(lead)}
                                        className="px-4 py-2 text-sm bg-primary-01 text-white rounded-lg hover:bg-primary-02 transition-colors"
                                    >
                                        Respond
                                    </button>
                                </div>
                            </>
                        )}

                        {lead.status === 'responded' && (
                            <>
                                {lead.responseTime && (
                                    <span className="text-xs text-neutrals-06">Response in {lead.responseTime}</span>
                                )}
                                <button
                                    onClick={() => onViewDetails(lead)}
                                    className="px-4 py-2 text-sm border border-neutrals-04 rounded-lg hover:bg-neutrals-02 transition-colors text-shades-black"
                                >
                                    View Details
                                </button>
                            </>
                        )}

                        {lead.status === 'quote_sent' && (
                            <>
                                <span className="text-xs text-neutrals-06">Awaiting Reply</span>
                                <button
                                    onClick={() => onUpdateQuote?.(lead)}
                                    className="px-4 py-2    text-sm border border-neutrals-04 rounded-lg hover:bg-neutrals-02 transition-colors text-shades-black"
                                >
                                    Update Quote
                                </button>
                            </>
                        )}

                        {lead.status === 'booked' && (
                            <button
                                onClick={() => onMessage?.(lead)}
                                className="text-sm text-primary-01 flex items-center gap-1 hover:underline"
                            >
                                Message
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
