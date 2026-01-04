'use client';

import { useState } from 'react';
import { ChevronDown, Search, Calendar, DollarSign } from 'lucide-react';
import LeadCard from '@/components/vendor/leads/LeadCard';
import LeadDetailModal from '@/components/vendor/leads/LeadDetailModal';
import type { Lead, LeadStatus } from '@/components/vendor/leads/LeadCard';

// Mock data for leads
const mockLeads: Lead[] = [
    {
        id: '1',
        name: 'Sarah Chen',
        initials: 'SC',
        avatar: '/avatars/men.png',
        eventType: 'Corporate Retreat',
        eventDate: 'Mar 15-17, 2025',
        guests: 45,
        budget: '1,200,000',
        inquiredAt: '2 hours ago',
        status: 'new',
        responseTime: '1h 42m remaining',
    },
    {
        id: '2',
        name: 'Michael Rodriguez',
        initials: 'MR',
        avatar: '/avatars/woman.png',
        eventType: 'Wedding Reception',
        eventDate: 'Apr 22, 2025',
        guests: 120,
        budget: '18,000,000',
        inquiredAt: '5 hours ago',
        status: 'responded',
    },
    {
        id: '3',
        name: 'Emily Thompson',
        initials: 'ET',
        avatar: '/avatars/men.png',
        eventType: 'Birthday Celebration',
        eventDate: 'Mar 28, 2025',
        guests: 35,
        budget: '5,500',
        inquiredAt: 'Yesterday',
        status: 'quote_sent',
    },
    {
        id: '4',
        name: 'David Park',
        initials: 'DP',
        avatar: '/avatars/woman.png',
        eventType: 'Product Launch',
        eventDate: 'Apr 5, 2025',
        guests: 80,
        budget: '15,000',
        inquiredAt: '3 days ago',
        status: 'booked',
    },
    {
        id: '5',
        name: 'Jennifer Wilson',
        initials: 'JW',
        eventType: 'Anniversary Party',
        eventDate: 'May 10, 2025',
        guests: 60,
        budget: '8,000',
        inquiredAt: '3 hours ago',
        status: 'new',
        responseTime: '4h 18m remaining',
    },
];

const statusOptions = [
    { value: 'all', label: 'All Inquiries' },
    { value: 'new', label: 'New Inquiries' },
    { value: 'responded', label: 'Responded' },
    { value: 'quote_sent', label: 'Quote Sent' },
    { value: 'booked', label: 'Booked' },
];

const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
];

const budgetOptions = [
    { value: 'all', label: 'All Budgets' },
    { value: '0-5000', label: 'Under $5,000' },
    { value: '5000-10000', label: '$5,000 - $10,000' },
    { value: '10000-20000', label: '$10,000 - $20,000' },
    { value: '20000+', label: '$20,000+' },
];

const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'budget_high', label: 'Budget: High to Low' },
    { value: 'budget_low', label: 'Budget: Low to High' },
    { value: 'guests_high', label: 'Guests: High to Low' },
];

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
                className="flex items-center gap-2 px-4 py-2.5 bg-shades-white border border-neutrals-03 rounded-lg hover:border-neutrals-04 transition-colors"
            >
                {icon}
                <span className="text-sm text-shades-black">{selectedOption?.label || label}</span>
                <ChevronDown size={16} className={`text-neutrals-06 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-48 bg-shades-white border border-neutrals-03 rounded-lg shadow-lg z-20 py-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-2 text-sm text-left hover:bg-neutrals-02 transition-colors ${
                                    value === option.value ? 'text-primary-01 font-medium' : 'text-shades-black'
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
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [budgetFilter, setBudgetFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const newInquiriesCount = mockLeads.filter(lead => lead.status === 'new').length;

    // Filter leads
    const filteredLeads = mockLeads.filter(lead => {
        if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
        return true;
    });

    const handleViewDetails = (lead: Lead) => {
        setSelectedLead(lead);
        setIsModalOpen(true);
    };

    const handleRespond = (lead: Lead) => {
        console.log('Respond to lead:', lead.id);
        handleViewDetails(lead);
    };

    const handleDecline = (lead: Lead) => {
        console.log('Decline lead:', lead.id);
    };

    const handleUpdateQuote = (lead: Lead) => {
        console.log('Update quote for lead:', lead.id);
    };

    const handleMessage = (lead: Lead) => {
        console.log('Message lead:', lead.id);
    };

    const handleSendQuote = (lead: Lead) => {
        console.log('Send quote to:', lead.id);
    };

    const handleChat = (lead: Lead) => {
        console.log('Chat with:', lead.id);
    };

    const handleBlockDate = (lead: Lead) => {
        console.log('Block date for:', lead.id);
    };

    const handleForward = (lead: Lead) => {
        console.log('Forward lead:', lead.id);
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
                            placeholder="Search leads..."
                            className="pl-10 pr-4 py-2.5 bg-shades-white border border-neutrals-03 rounded-lg text-sm focus:outline-none focus:border-primary-01 w-full sm:w-64"
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
                        icon={<Calendar size={16} className="text-neutrals-06" />}
                        options={dateRangeOptions}
                        value={dateFilter}
                        onChange={setDateFilter}
                    />
                    <FilterDropdown
                        label="Budget"
                        icon={<DollarSign size={16} className="text-neutrals-06" />}
                        options={budgetOptions}
                        value={budgetFilter}
                        onChange={setBudgetFilter}
                    />
                    <div className="ml-auto">
                        <FilterDropdown
                            label="Sort by"
                            options={sortOptions}
                            value={sortBy}
                            onChange={setSortBy}
                        />
                    </div>
                </div>

                {/* Leads List */}
                <div className="space-y-4">
                    {filteredLeads.map((lead) => (
                        <LeadCard
                            key={lead.id}
                            lead={lead}
                            onViewDetails={handleViewDetails}
                            onRespond={handleRespond}
                            onDecline={handleDecline}
                            onUpdateQuote={handleUpdateQuote}
                            onMessage={handleMessage}
                        />
                    ))}
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
                onChat={handleChat}
                onBlockDate={handleBlockDate}
                onForward={handleForward}
                onDecline={handleDecline}
            />
        </div>
    );
}