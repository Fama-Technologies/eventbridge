'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Search, Loader2 } from 'lucide-react';
import LeadCard from '@/components/vendor/leads/LeadCard';
import LeadDetailModal from '@/components/vendor/leads/LeadDetailModal';
import type { Lead, LeadStatus } from '@/components/vendor/leads/LeadCard';
import {
    LEAD_STATUS_OPTIONS,
    DATE_RANGE_OPTIONS,
    BUDGET_OPTIONS,
    SORT_OPTIONS,
    filterLeadsByStatus,
    filterLeadsBySearch,
    sortLeads,
} from '@/lib/booking-data';

const statusOptions = LEAD_STATUS_OPTIONS;
const dateRangeOptions = DATE_RANGE_OPTIONS;
const budgetOptions = BUDGET_OPTIONS;
const sortOptions = SORT_OPTIONS;

interface DropdownProps {
    label: string;
    icon?: React.ReactNode;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
}

function FilterDropdown({ label, icon, options, value, onChange }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-6 py-3 bg-shades-white border border-neutrals-03 rounded-full hover:border-neutrals-04 transition-colors"
            >
                {icon}
                <span className="text-sm font-medium text-shades-black">{selectedOption?.label || label}</span>
                <ChevronDown size={16} className={`text-neutrals-06 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-shades-white border border-neutrals-03 rounded-xl shadow-lg z-20 py-2">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-2.5 text-sm text-left hover:bg-neutrals-02 transition-colors ${value === option.value ? 'text-primary-01 font-semibold bg-primary-01/5' : 'text-shades-black'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function LeadsPage() {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [budgetFilter, setBudgetFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // API State
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchLeads() {
            setIsLoading(true);
            try {
                const response = await fetch('/api/vendor/leads');
                if (response.ok) {
                    const data = await response.json();
                    setLeads(data.leads || (Array.isArray(data) ? data : []));
                } else {
                    console.error('Failed to fetch leads');
                    // Fallback to empty or error state
                }
            } catch (error) {
                console.error('Error fetching leads:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchLeads();
    }, []);

    const newInquiriesCount = leads.filter(lead => lead.status === 'new').length;

    // Filter and sort leads using helper functions
    const filteredLeads = sortLeads(
        filterLeadsBySearch(
            filterLeadsByStatus(leads, statusFilter),
            searchQuery
        ),
        sortBy
    );

    const handleViewDetails = (lead: Lead) => {
        setSelectedLead(lead);
        setIsModalOpen(true);
    };

    const handleRespond = (lead: Lead) => {
        // Implement respond logic (could be API call to update status)
        console.log('Respond to lead:', lead.id);
        handleViewDetails(lead);
    };

    const handleDecline = (lead: Lead) => {
        // Implement decline logic
        console.log('Decline lead:', lead.id);
    };

    const handleUpdateQuote = (lead: Lead) => {
        console.log('Update quote for lead:', lead.id);
    };

    const handleMessage = (lead: Lead) => {
        // Navigate to messages page with conversation ID
        if (lead.conversationId) {
            router.push(`/vendor/messages?conversation=${lead.conversationId}`);
        } else {
            // If no conversation exists, navigate to messages and create new
            router.push(`/vendor/messages?newChat=${lead.id}&name=${encodeURIComponent(lead.name)}`);
        }
    };

    const handleSendQuote = (lead: Lead) => {
        console.log('Send quote to:', lead.id);
    };

    const handleChat = (lead: Lead) => {
        // Navigate to messages page with conversation ID
        if (lead.conversationId) {
            router.push(`/vendor/messages?conversation=${lead.conversationId}`);
        } else {
            // If no conversation exists, navigate to messages and create new
            router.push(`/vendor/messages?newChat=${lead.id}&name=${encodeURIComponent(lead.name)}`);
        }
    };

    const handleBlockDate = (lead: Lead) => {
        console.log('Block date for:', lead.id);
    };

    const handleForward = (lead: Lead) => {
        console.log('Forward lead:', lead.id);
    };

    const handleSendInvoice = (lead: Lead) => {
        console.log('Send invoice to:', lead.id);
        // TODO: Open invoice creation modal
        // After invoice is sent, update lead status to 'invoice_sent'
        // This will trigger calendar to show "Payment Pending"
    };

    return (
        <div className="min-h-screen bg-neutrals-01">
            {/* Header */}
            <div className="p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-shades-black">Leads</h1>
                        <p className="text-sm text-neutrals-06 mt-1">
                            {newInquiriesCount} new {newInquiriesCount === 1 ? 'inquiry' : 'inquiries'} waiting for your response
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutrals-05" />
                        <input
                            type="text"
                            placeholder="Search by name, event type, or date..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-shades-white border border-neutrals-03 rounded-lg text-sm focus:outline-none focus:border-primary-01 w-full sm:w-80"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <FilterDropdown
                        label="Status"
                        options={statusOptions}
                        value={statusFilter}
                        onChange={setStatusFilter}
                    />
                    <FilterDropdown
                        label="Date Range"
                        options={dateRangeOptions}
                        value={dateFilter}
                        onChange={setDateFilter}
                    />
                    <FilterDropdown
                        label="Budget"
                        options={budgetOptions}
                        value={budgetFilter}
                        onChange={setBudgetFilter}
                    />
                </div>

                {/* Leads List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-01" />
                        </div>
                    ) : (
                        filteredLeads.map((lead) => (
                            <LeadCard
                                key={lead.id}
                                lead={lead}
                                onViewDetails={handleViewDetails}
                                onRespond={handleRespond}
                                onDecline={handleDecline}
                                onUpdateQuote={handleUpdateQuote}
                                onMessage={handleMessage}
                            />
                        ))
                    )}
                </div>

                {/* Load More */}
                {filteredLeads.length > 0 && (
                    <div className="mt-6 text-center">
                        <button className="px-6 py-2.5 text-sm font-medium text-primary-01 hover:bg-primary-01/10 rounded-lg transition-colors">
                            Load more inquiries
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {filteredLeads.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-neutrals-02 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={24} className="text-neutrals-05" />
                        </div>
                        <h3 className="text-lg font-semibold text-shades-black mb-2">No leads found</h3>
                        <p className="text-sm text-neutrals-06">
                            Try adjusting your filters to find more leads.
                        </p>
                    </div>
                )}
            </div>

            {/* Lead Detail Modal */}
            <LeadDetailModal
                lead={selectedLead}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSendQuote={handleSendQuote}
                onSendInvoice={handleSendInvoice}
                onChat={handleChat}
                onBlockDate={handleBlockDate}
                onForward={handleForward}
                onDecline={handleDecline}
            />
        </div>
    );
}