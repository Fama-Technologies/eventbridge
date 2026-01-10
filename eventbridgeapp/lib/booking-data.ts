/**
 * ===========================================
 * BOOKING & LEADS DATA SERVICE
 * ===========================================
 * 
 * This file contains all static data and API functions for the
 * vendor booking system. Toggle USE_MOCK_DATA to switch between
 * mock data and real API calls.
 * 
 * BUSINESS FLOW:
 * 1. INQUIRY/LEAD - Customer shows interest in a service
 * 2. QUOTE/PACKAGES - Vendor's listed packages serve as quotation
 * 3. INVOICE SENT - Vendor generates invoice → Calendar shows "Payment Pending"
 * 4. RECEIPT ISSUED - Customer pays, vendor issues receipt → Calendar shows "Booked"
 * 5. BOOKING CONFIRMED - Date is blocked, details saved, earnings recorded
 * 
 * This flow works for both deposits and full payments.
 */

// ===========================================
// CONFIGURATION
// ===========================================

export const USE_MOCK_DATA = true;
export const API_BASE_URL = '/api/vendor';

// ===========================================
// TYPE DEFINITIONS
// ===========================================

export type LeadStatus = 'new' | 'responded' | 'quote_sent' | 'invoice_sent' | 'booked' | 'declined';

export type BookingStatus = 'pending_payment' | 'confirmed' | 'completed' | 'cancelled';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

export interface Lead {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
    initials?: string;
    eventType: string;
    eventDate: string;
    eventEndDate?: string;
    guests: number;
    budget: string;
    inquiredAt: string;
    status: LeadStatus;
    responseTime?: string;
    location?: string;
    venue?: string;
    duration?: string;
    preferredTime?: string;
    flexibility?: string;
    specialRequirements?: string[];
    inquiryNote?: string;
    messageCount?: number;
    // Links to other entities
    conversationId?: string;
    bookingId?: string;
    invoiceId?: string;
}

export interface PaymentItem {
    label: string;
    amount: number;
    type?: 'normal' | 'paid' | 'due' | 'discount';
    date?: string;
}

export interface Invoice {
    id: string;
    leadId: string;
    bookingId?: string;
    invoiceNumber: string;
    clientName: string;
    clientEmail?: string;
    eventName: string;
    eventDate: string;
    issuedDate: string;
    dueDate: string;
    items: PaymentItem[];
    subtotal: number;
    tax?: number;
    discount?: number;
    totalAmount: number;
    amountPaid: number;
    amountDue: number;
    status: 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'cancelled';
    notes?: string;
}

export interface Receipt {
    id: string;
    invoiceId: string;
    bookingId: string;
    receiptNumber: string;
    clientName: string;
    eventName: string;
    issuedDate: string;
    paymentMethod: string;
    amountPaid: number;
    paymentType: 'deposit' | 'partial' | 'full' | 'balance';
    notes?: string;
}

export interface Message {
    sender: string;
    avatar?: string;
    time: string;
    content: string;
    attachment?: string;
}

export interface SharedFile {
    name: string;
    size: string;
    date: string;
    type: 'pdf' | 'image' | 'doc';
    url?: string;
}

export interface Booking {
    id: string;
    leadId: string;
    status: BookingStatus;
    title: string;
    eventType: string;
    client: {
        name: string;
        email?: string;
        phone?: string;
        avatar?: string;
        rating: number;
        reviews: number;
    };
    dateRange: string;
    startDate: string;
    endDate?: string;
    timeRange: string;
    guests: number;
    venue: string;
    // Financial
    totalAmount: number;
    paymentStatus: PaymentStatus;
    payments: PaymentItem[];
    depositAmount?: number;
    depositPaid?: boolean;
    balanceAmount?: number;
    balanceDue?: string;
    // Related entities
    invoiceId?: string;
    receiptIds?: string[];
    conversationId?: string;
    // Extras
    latestMessage?: Message;
    sharedFiles?: SharedFile[];
    checklist?: { item: string; completed: boolean }[];
    notes?: string;
    specialRequests?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CalendarEvent {
    id: string;
    bookingId?: string;
    title: string;
    date: string;
    endDate?: string;
    time?: string;
    type: 'booking' | 'pending' | 'blocked' | 'reminder';
    status: 'pending_payment' | 'confirmed' | 'completed' | 'cancelled';
    client?: string;
    amount?: number;
    color?: string;
}

// ===========================================
// FILTER OPTIONS
// ===========================================

export const LEAD_STATUS_OPTIONS = [
    { value: 'all', label: 'All Inquiries' },
    { value: 'new', label: 'New Inquiries' },
    { value: 'responded', label: 'Responded' },
    { value: 'quote_sent', label: 'Quote Sent' },
    { value: 'invoice_sent', label: 'Invoice Sent' },
    { value: 'booked', label: 'Booked' },
];

export const DATE_RANGE_OPTIONS = [
    { value: 'all', label: 'All Time' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
];

export const BUDGET_OPTIONS = [
    { value: 'all', label: 'All Budgets' },
    { value: '0-1000000', label: 'Under 1,000,000' },
    { value: '1000000-5000000', label: '1M - 5M' },
    { value: '5000000-10000000', label: '5M - 10M' },
    { value: '10000000+', label: '10M+' },
];

export const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'budget_high', label: 'Budget: High to Low' },
    { value: 'budget_low', label: 'Budget: Low to High' },
    { value: 'guests_high', label: 'Guests: High to Low' },
];

export const BOOKING_STATUS_OPTIONS = [
    { value: 'all', label: 'All Bookings' },
    { value: 'pending_payment', label: 'Pending Payment' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

// ===========================================
// MOCK DATA - LEADS
// ===========================================

export const MOCK_LEADS: Lead[] = [
    {
        id: 'lead-1',
        name: 'Sarah Chen',
        email: 'sarah.chen@email.com',
        phone: '+256 700 123 456',
        initials: 'SC',
        avatar: '/avatars/men.png',
        eventType: 'Corporate Retreat',
        eventDate: 'Mar 15-17, 2025',
        guests: 45,
        budget: '1,200,000',
        inquiredAt: '2 hours ago',
        status: 'new',
        responseTime: '1h 42m remaining',
        location: 'Kampala',
        venue: 'Serena Hotel',
        duration: '3 days',
        preferredTime: 'Morning sessions',
        flexibility: 'Fixed dates',
        specialRequirements: ['Vegetarian options', 'AV Equipment', 'Team building activities'],
        inquiryNote: 'Looking for a venue that can accommodate breakout sessions and team activities.',
        messageCount: 0,
        conversationId: 'conv-1',
    },
    {
        id: 'lead-2',
        name: 'Michael Rodriguez',
        email: 'michael.r@email.com',
        phone: '+256 700 234 567',
        initials: 'MR',
        avatar: '/avatars/woman.png',
        eventType: 'Wedding Reception',
        eventDate: 'Apr 22, 2025',
        guests: 120,
        budget: '18,000,000',
        inquiredAt: '5 hours ago',
        status: 'responded',
        location: 'Entebbe',
        venue: 'Lake Victoria Serena Golf Resort',
        duration: '1 day',
        preferredTime: '4:00 PM - 11:00 PM',
        flexibility: 'Flexible by 1 week',
        specialRequirements: ['Halal food', 'Live band space', 'Outdoor ceremony'],
        inquiryNote: 'Planning a beautiful lakeside wedding reception with garden ceremony.',
        messageCount: 3,
        conversationId: 'conv-2',
    },
    {
        id: 'lead-3',
        name: 'Emily Thompson',
        email: 'emily.t@email.com',
        initials: 'ET',
        avatar: '/avatars/men.png',
        eventType: 'Birthday Celebration',
        eventDate: 'Mar 28, 2025',
        guests: 35,
        budget: '5,500,000',
        inquiredAt: 'Yesterday',
        status: 'quote_sent',
        location: 'Kampala',
        duration: '1 evening',
        preferredTime: '6:00 PM onwards',
        flexibility: 'Very flexible',
        inquiryNote: 'Surprise 50th birthday party for my husband.',
        messageCount: 5,
        conversationId: 'conv-3',
        invoiceId: 'inv-1',
    },
    {
        id: 'lead-4',
        name: 'David Park',
        email: 'david.p@company.com',
        phone: '+256 700 456 789',
        initials: 'DP',
        avatar: '/avatars/woman.png',
        eventType: 'Product Launch',
        eventDate: 'Apr 5, 2025',
        guests: 80,
        budget: '15,000,000',
        inquiredAt: '3 days ago',
        status: 'booked',
        location: 'Kampala',
        venue: 'Kampala Serena Hotel',
        duration: '1 day',
        preferredTime: '10:00 AM - 4:00 PM',
        specialRequirements: ['Media setup', 'Press area', 'Catering for VIPs'],
        inquiryNote: 'Launching our new tech product line to media and partners.',
        messageCount: 12,
        conversationId: 'conv-4',
        bookingId: 'booking-1',
        invoiceId: 'inv-2',
    },
    {
        id: 'lead-5',
        name: 'Jennifer Wilson',
        email: 'jenny.w@email.com',
        initials: 'JW',
        eventType: 'Anniversary Party',
        eventDate: 'May 10, 2025',
        guests: 60,
        budget: '8,000,000',
        inquiredAt: '3 hours ago',
        status: 'new',
        responseTime: '4h 18m remaining',
        location: 'Jinja',
        duration: '1 evening',
        preferredTime: 'Evening',
        flexibility: 'Weekend only',
        inquiryNote: 'Celebrating our 25th wedding anniversary!',
        messageCount: 0,
    },
    {
        id: 'lead-6',
        name: 'Tech Solutions Ltd',
        email: 'events@techsolutions.com',
        initials: 'TS',
        eventType: 'Annual Conference',
        eventDate: 'Jun 20-22, 2025',
        guests: 200,
        budget: '45,000,000',
        inquiredAt: '1 day ago',
        status: 'invoice_sent',
        location: 'Kampala',
        venue: 'Speke Resort Munyonyo',
        duration: '3 days',
        preferredTime: '8:00 AM - 6:00 PM daily',
        specialRequirements: ['Multiple conference rooms', 'Exhibition space', 'Gala dinner'],
        inquiryNote: 'Annual tech conference with international speakers.',
        messageCount: 8,
        conversationId: 'conv-5',
        invoiceId: 'inv-3',
        bookingId: 'booking-2',
    },
];

// ===========================================
// MOCK DATA - INVOICES
// ===========================================

export const MOCK_INVOICES: Invoice[] = [
    {
        id: 'inv-1',
        leadId: 'lead-3',
        invoiceNumber: 'INV-2025-001',
        clientName: 'Emily Thompson',
        clientEmail: 'emily.t@email.com',
        eventName: 'Birthday Celebration',
        eventDate: 'Mar 28, 2025',
        issuedDate: 'Jan 8, 2025',
        dueDate: 'Jan 22, 2025',
        items: [
            { label: 'Venue Rental (Evening)', amount: 2000000 },
            { label: 'Catering (35 guests)', amount: 2500000 },
            { label: 'Decoration Package', amount: 800000 },
            { label: 'DJ & Sound System', amount: 500000 },
        ],
        subtotal: 5800000,
        discount: 300000,
        totalAmount: 5500000,
        amountPaid: 0,
        amountDue: 5500000,
        status: 'sent',
        notes: 'Deposit of 50% required to confirm booking.',
    },
    {
        id: 'inv-2',
        leadId: 'lead-4',
        bookingId: 'booking-1',
        invoiceNumber: 'INV-2025-002',
        clientName: 'David Park',
        clientEmail: 'david.p@company.com',
        eventName: 'Product Launch',
        eventDate: 'Apr 5, 2025',
        issuedDate: 'Jan 5, 2025',
        dueDate: 'Jan 19, 2025',
        items: [
            { label: 'Conference Hall Rental', amount: 5000000 },
            { label: 'Catering (80 guests)', amount: 6000000 },
            { label: 'AV Equipment & Setup', amount: 2000000 },
            { label: 'Press Area Setup', amount: 1500000 },
            { label: 'VIP Lounge', amount: 1000000 },
        ],
        subtotal: 15500000,
        discount: 500000,
        totalAmount: 15000000,
        amountPaid: 15000000,
        amountDue: 0,
        status: 'paid',
        notes: 'Full payment received. Booking confirmed.',
    },
    {
        id: 'inv-3',
        leadId: 'lead-6',
        bookingId: 'booking-2',
        invoiceNumber: 'INV-2025-003',
        clientName: 'Tech Solutions Ltd',
        clientEmail: 'events@techsolutions.com',
        eventName: 'Annual Conference',
        eventDate: 'Jun 20-22, 2025',
        issuedDate: 'Jan 9, 2025',
        dueDate: 'Jan 23, 2025',
        items: [
            { label: 'Main Conference Hall (3 days)', amount: 15000000 },
            { label: 'Breakout Rooms x 4', amount: 8000000 },
            { label: 'Exhibition Space', amount: 5000000 },
            { label: 'Catering (200 guests x 3 days)', amount: 12000000 },
            { label: 'Gala Dinner', amount: 6000000 },
        ],
        subtotal: 46000000,
        discount: 1000000,
        totalAmount: 45000000,
        amountPaid: 22500000,
        amountDue: 22500000,
        status: 'partial',
        notes: '50% deposit received. Balance due 2 weeks before event.',
    },
];

// ===========================================
// MOCK DATA - RECEIPTS
// ===========================================

export const MOCK_RECEIPTS: Receipt[] = [
    {
        id: 'receipt-1',
        invoiceId: 'inv-2',
        bookingId: 'booking-1',
        receiptNumber: 'REC-2025-001',
        clientName: 'David Park',
        eventName: 'Product Launch',
        issuedDate: 'Jan 10, 2025',
        paymentMethod: 'Bank Transfer',
        amountPaid: 15000000,
        paymentType: 'full',
        notes: 'Full payment for Product Launch event.',
    },
    {
        id: 'receipt-2',
        invoiceId: 'inv-3',
        bookingId: 'booking-2',
        receiptNumber: 'REC-2025-002',
        clientName: 'Tech Solutions Ltd',
        eventName: 'Annual Conference',
        issuedDate: 'Jan 10, 2025',
        paymentMethod: 'Mobile Money',
        amountPaid: 22500000,
        paymentType: 'deposit',
        notes: '50% deposit for Annual Conference.',
    },
];

// ===========================================
// MOCK DATA - BOOKINGS
// ===========================================

export const MOCK_BOOKINGS: Booking[] = [
    {
        id: 'booking-1',
        leadId: 'lead-4',
        status: 'confirmed',
        title: 'Product Launch - David Park',
        eventType: 'Product Launch',
        client: {
            name: 'David Park',
            email: 'david.p@company.com',
            phone: '+256 700 456 789',
            avatar: '/avatars/woman.png',
            rating: 4.8,
            reviews: 12,
        },
        dateRange: 'Apr 5, 2025',
        startDate: '2025-04-05',
        timeRange: '10:00 AM - 4:00 PM',
        guests: 80,
        venue: 'Kampala Serena Hotel, Grand Ballroom',
        totalAmount: 15000000,
        paymentStatus: 'paid',
        payments: [
            { label: 'Conference Hall Rental', amount: 5000000 },
            { label: 'Catering (80 guests)', amount: 6000000 },
            { label: 'AV Equipment & Setup', amount: 2000000 },
            { label: 'Press Area Setup', amount: 1500000 },
            { label: 'VIP Lounge', amount: 1000000 },
            { label: 'Discount', amount: 500000, type: 'discount' },
            { label: 'Amount Paid', amount: 15000000, type: 'paid', date: 'Jan 10, 2025' },
            { label: 'Balance Due', amount: 0, type: 'due' },
        ],
        depositAmount: 15000000,
        depositPaid: true,
        balanceAmount: 0,
        invoiceId: 'inv-2',
        receiptIds: ['receipt-1'],
        conversationId: 'conv-4',
        latestMessage: {
            sender: 'David Park',
            avatar: '/avatars/woman.png',
            time: '2 hours ago',
            content: 'Perfect! I\'ll send over the final guest list by end of this week.',
            attachment: 'Event_Rundown.pdf',
        },
        sharedFiles: [
            { name: 'Event_Rundown.pdf', size: '1.2 MB', date: 'Jan 8', type: 'pdf' },
            { name: 'Product_Photos.zip', size: '15.4 MB', date: 'Jan 7', type: 'doc' },
        ],
        checklist: [
            { item: 'Venue walkthrough completed', completed: true },
            { item: 'Catering menu finalized', completed: true },
            { item: 'AV requirements confirmed', completed: true },
            { item: 'Final guest list received', completed: false },
            { item: 'Press invitations sent', completed: false },
        ],
        notes: 'Client prefers modern, tech-focused decor. CEO will give keynote speech.',
        specialRequests: ['Branded backdrop', 'Live streaming setup', 'VIP parking'],
        createdAt: '2025-01-05T10:00:00Z',
        updatedAt: '2025-01-10T14:30:00Z',
    },
    {
        id: 'booking-2',
        leadId: 'lead-6',
        status: 'pending_payment',
        title: 'Annual Conference - Tech Solutions Ltd',
        eventType: 'Annual Conference',
        client: {
            name: 'Tech Solutions Ltd',
            email: 'events@techsolutions.com',
            avatar: '',
            rating: 4.9,
            reviews: 8,
        },
        dateRange: 'Jun 20-22, 2025',
        startDate: '2025-06-20',
        endDate: '2025-06-22',
        timeRange: '8:00 AM - 6:00 PM',
        guests: 200,
        venue: 'Speke Resort Munyonyo',
        totalAmount: 45000000,
        paymentStatus: 'partial',
        payments: [
            { label: 'Main Conference Hall (3 days)', amount: 15000000 },
            { label: 'Breakout Rooms x 4', amount: 8000000 },
            { label: 'Exhibition Space', amount: 5000000 },
            { label: 'Catering (200 guests x 3 days)', amount: 12000000 },
            { label: 'Gala Dinner', amount: 6000000 },
            { label: 'Discount', amount: 1000000, type: 'discount' },
            { label: 'Deposit Paid (50%)', amount: 22500000, type: 'paid', date: 'Jan 10, 2025' },
            { label: 'Balance Due', amount: 22500000, type: 'due' },
        ],
        depositAmount: 22500000,
        depositPaid: true,
        balanceAmount: 22500000,
        balanceDue: 'Jun 6, 2025',
        invoiceId: 'inv-3',
        receiptIds: ['receipt-2'],
        conversationId: 'conv-5',
        latestMessage: {
            sender: 'Events Team',
            time: '1 day ago',
            content: 'We have confirmed all international speakers. Sending updated agenda shortly.',
        },
        checklist: [
            { item: 'Deposit received', completed: true },
            { item: 'Venue contract signed', completed: true },
            { item: 'Speaker lineup confirmed', completed: true },
            { item: 'Accommodation booked', completed: false },
            { item: 'Exhibition booth assignments', completed: false },
            { item: 'Final payment received', completed: false },
        ],
        notes: 'Large-scale tech conference with international speakers. Need multilingual support.',
        specialRequests: ['Simultaneous translation', 'Recording for streaming', 'Exhibition booths'],
        createdAt: '2025-01-09T09:00:00Z',
        updatedAt: '2025-01-10T11:00:00Z',
    },
];

// ===========================================
// MOCK DATA - CALENDAR EVENTS
// ===========================================

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
    {
        id: 'cal-1',
        bookingId: 'booking-1',
        title: 'Product Launch - David Park',
        date: '2025-04-05',
        time: '10:00 AM - 4:00 PM',
        type: 'booking',
        status: 'confirmed',
        client: 'David Park',
        amount: 15000000,
        color: '#22C55E', // Green for confirmed
    },
    {
        id: 'cal-2',
        bookingId: 'booking-2',
        title: 'Annual Conference - Tech Solutions',
        date: '2025-06-20',
        endDate: '2025-06-22',
        time: '8:00 AM - 6:00 PM',
        type: 'pending',
        status: 'pending_payment',
        client: 'Tech Solutions Ltd',
        amount: 45000000,
        color: '#F59E0B', // Amber for pending payment
    },
];

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Filter leads by status
 */
export function filterLeadsByStatus(leads: Lead[], status: string): Lead[] {
    if (status === 'all') return leads;
    return leads.filter(lead => lead.status === status);
}

/**
 * Filter leads by search query
 */
export function filterLeadsBySearch(leads: Lead[], query: string): Lead[] {
    if (!query) return leads;
    const q = query.toLowerCase();
    return leads.filter(lead =>
        lead.name.toLowerCase().includes(q) ||
        lead.eventType.toLowerCase().includes(q) ||
        lead.eventDate.toLowerCase().includes(q) ||
        lead.location?.toLowerCase().includes(q)
    );
}

/**
 * Sort leads
 */
export function sortLeads(leads: Lead[], sortBy: string): Lead[] {
    const sorted = [...leads];
    switch (sortBy) {
        case 'oldest':
            return sorted.reverse();
        case 'budget_high':
            return sorted.sort((a, b) => parseFloat(b.budget.replace(/,/g, '')) - parseFloat(a.budget.replace(/,/g, '')));
        case 'budget_low':
            return sorted.sort((a, b) => parseFloat(a.budget.replace(/,/g, '')) - parseFloat(b.budget.replace(/,/g, '')));
        case 'guests_high':
            return sorted.sort((a, b) => b.guests - a.guests);
        default: // newest
            return sorted;
    }
}

/**
 * Get booking by lead ID
 */
export function getBookingByLeadId(leadId: string): Booking | undefined {
    return MOCK_BOOKINGS.find(b => b.leadId === leadId);
}

/**
 * Get invoice by lead ID
 */
export function getInvoiceByLeadId(leadId: string): Invoice | undefined {
    return MOCK_INVOICES.find(inv => inv.leadId === leadId);
}

/**
 * Get lead by booking ID
 */
export function getLeadByBookingId(bookingId: string): Lead | undefined {
    const booking = MOCK_BOOKINGS.find(b => b.id === bookingId);
    if (!booking) return undefined;
    return MOCK_LEADS.find(l => l.id === booking.leadId);
}

/**
 * Format currency in UGX
 */
export function formatCurrency(amount: number): string {
    return `UGX ${amount.toLocaleString()}`;
}

/**
 * Get status badge config
 */
export function getLeadStatusConfig(status: LeadStatus) {
    const configs = {
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
        },
        invoice_sent: {
            label: 'INVOICE SENT',
            bgColor: 'bg-[#FEF3C7]',
            textColor: 'text-[#D97706]',
            cardBorder: 'border-l-4 border-l-[#F59E0B]',
        },
        booked: {
            label: 'BOOKED',
            bgColor: 'bg-[#D1FAE5]',
            textColor: 'text-[#047857]',
            cardBorder: 'bg-[#A7F3D0]',
        },
        declined: {
            label: 'DECLINED',
            bgColor: 'bg-[#FEE2E2]',
            textColor: 'text-[#DC2626]',
            cardBorder: 'border-l-4 border-l-[#DC2626]',
        },
    };
    return configs[status];
}

export function getBookingStatusConfig(status: BookingStatus) {
    const configs = {
        pending_payment: {
            label: 'PENDING PAYMENT',
            bgColor: 'bg-[#FEF3C7]',
            textColor: 'text-[#D97706]',
            dotColor: 'bg-[#F59E0B]',
        },
        confirmed: {
            label: 'CONFIRMED',
            bgColor: 'bg-[#D1FAE5]',
            textColor: 'text-[#047857]',
            dotColor: 'bg-[#22C55E]',
        },
        completed: {
            label: 'COMPLETED',
            bgColor: 'bg-[#E0E7FF]',
            textColor: 'text-[#4F46E5]',
            dotColor: 'bg-[#6366F1]',
        },
        cancelled: {
            label: 'CANCELLED',
            bgColor: 'bg-[#FEE2E2]',
            textColor: 'text-[#DC2626]',
            dotColor: 'bg-[#DC2626]',
        },
    };
    return configs[status];
}

// ===========================================
// API FUNCTIONS
// ===========================================

/**
 * Fetch all leads
 */
export async function getLeads(): Promise<Lead[]> {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_LEADS;
    }

    const response = await fetch(`${API_BASE_URL}/leads`);
    if (!response.ok) throw new Error('Failed to fetch leads');
    const data = await response.json();
    return data.leads;
}

/**
 * Fetch a single lead by ID
 */
export async function getLeadById(leadId: string): Promise<Lead | null> {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return MOCK_LEADS.find(l => l.id === leadId) || null;
    }

    const response = await fetch(`${API_BASE_URL}/leads/${leadId}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.lead;
}

/**
 * Update lead status
 */
export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<Lead> {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const lead = MOCK_LEADS.find(l => l.id === leadId);
        if (!lead) throw new Error('Lead not found');
        lead.status = status;
        return lead;
    }

    const response = await fetch(`${API_BASE_URL}/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update lead status');
    const data = await response.json();
    return data.lead;
}

/**
 * Fetch all bookings
 */
export async function getBookings(): Promise<Booking[]> {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_BOOKINGS;
    }

    const response = await fetch(`${API_BASE_URL}/bookings`);
    if (!response.ok) throw new Error('Failed to fetch bookings');
    const data = await response.json();
    return data.bookings;
}

/**
 * Fetch a single booking by ID
 */
export async function getBookingById(bookingId: string): Promise<Booking | null> {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return MOCK_BOOKINGS.find(b => b.id === bookingId) || null;
    }

    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.booking;
}

/**
 * Create invoice from lead
 * When invoice is created, booking status becomes "pending_payment"
 */
export async function createInvoice(leadId: string, invoiceData: Partial<Invoice>): Promise<Invoice> {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const newInvoice: Invoice = {
            id: `inv-${Date.now()}`,
            leadId,
            invoiceNumber: `INV-${new Date().getFullYear()}-${String(MOCK_INVOICES.length + 1).padStart(3, '0')}`,
            clientName: invoiceData.clientName || '',
            eventName: invoiceData.eventName || '',
            eventDate: invoiceData.eventDate || '',
            issuedDate: new Date().toISOString().split('T')[0],
            dueDate: invoiceData.dueDate || '',
            items: invoiceData.items || [],
            subtotal: invoiceData.subtotal || 0,
            totalAmount: invoiceData.totalAmount || 0,
            amountPaid: 0,
            amountDue: invoiceData.totalAmount || 0,
            status: 'sent',
            notes: invoiceData.notes,
        };
        MOCK_INVOICES.push(newInvoice);
        
        // Update lead status
        const lead = MOCK_LEADS.find(l => l.id === leadId);
        if (lead) {
            lead.status = 'invoice_sent';
            lead.invoiceId = newInvoice.id;
        }
        
        return newInvoice;
    }

    const response = await fetch(`${API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, ...invoiceData }),
    });
    if (!response.ok) throw new Error('Failed to create invoice');
    const data = await response.json();
    return data.invoice;
}

/**
 * Create receipt (payment received)
 * When receipt is created, booking becomes "confirmed"
 */
export async function createReceipt(invoiceId: string, receiptData: Partial<Receipt>): Promise<Receipt> {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const invoice = MOCK_INVOICES.find(inv => inv.id === invoiceId);
        if (!invoice) throw new Error('Invoice not found');
        
        const newReceipt: Receipt = {
            id: `receipt-${Date.now()}`,
            invoiceId,
            bookingId: invoice.bookingId || '',
            receiptNumber: `REC-${new Date().getFullYear()}-${String(MOCK_RECEIPTS.length + 1).padStart(3, '0')}`,
            clientName: invoice.clientName,
            eventName: invoice.eventName,
            issuedDate: new Date().toISOString().split('T')[0],
            paymentMethod: receiptData.paymentMethod || 'Bank Transfer',
            amountPaid: receiptData.amountPaid || 0,
            paymentType: receiptData.paymentType || 'full',
            notes: receiptData.notes,
        };
        MOCK_RECEIPTS.push(newReceipt);
        
        // Update invoice
        invoice.amountPaid += newReceipt.amountPaid;
        invoice.amountDue = invoice.totalAmount - invoice.amountPaid;
        invoice.status = invoice.amountDue <= 0 ? 'paid' : 'partial';
        
        // Update booking status to confirmed when payment received
        if (invoice.bookingId) {
            const booking = MOCK_BOOKINGS.find(b => b.id === invoice.bookingId);
            if (booking) {
                booking.status = invoice.amountDue <= 0 ? 'confirmed' : 'pending_payment';
                booking.paymentStatus = invoice.amountDue <= 0 ? 'paid' : 'partial';
                booking.receiptIds = [...(booking.receiptIds || []), newReceipt.id];
            }
        }
        
        // Update lead status to booked
        const lead = MOCK_LEADS.find(l => l.id === invoice.leadId);
        if (lead && invoice.amountDue <= 0) {
            lead.status = 'booked';
        }
        
        return newReceipt;
    }

    const response = await fetch(`${API_BASE_URL}/receipts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, ...receiptData }),
    });
    if (!response.ok) throw new Error('Failed to create receipt');
    const data = await response.json();
    return data.receipt;
}

/**
 * Create booking from lead/invoice
 */
export async function createBooking(leadId: string, bookingData: Partial<Booking>): Promise<Booking> {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const lead = MOCK_LEADS.find(l => l.id === leadId);
        if (!lead) throw new Error('Lead not found');
        
        const newBooking: Booking = {
            id: `booking-${Date.now()}`,
            leadId,
            status: 'pending_payment',
            title: `${lead.eventType} - ${lead.name}`,
            eventType: lead.eventType,
            client: {
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                avatar: lead.avatar,
                rating: 0,
                reviews: 0,
            },
            dateRange: lead.eventDate,
            startDate: bookingData.startDate || '',
            timeRange: lead.preferredTime || '',
            guests: lead.guests,
            venue: lead.venue || bookingData.venue || '',
            totalAmount: bookingData.totalAmount || 0,
            paymentStatus: 'unpaid',
            payments: bookingData.payments || [],
            invoiceId: lead.invoiceId,
            conversationId: lead.conversationId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        MOCK_BOOKINGS.push(newBooking);
        
        // Update lead
        lead.bookingId = newBooking.id;
        
        return newBooking;
    }

    const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, ...bookingData }),
    });
    if (!response.ok) throw new Error('Failed to create booking');
    const data = await response.json();
    return data.booking;
}

/**
 * Get calendar events
 */
export async function getCalendarEvents(): Promise<CalendarEvent[]> {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 200));
        return MOCK_CALENDAR_EVENTS;
    }

    const response = await fetch(`${API_BASE_URL}/calendar`);
    if (!response.ok) throw new Error('Failed to fetch calendar events');
    const data = await response.json();
    return data.events;
}

/**
 * Get dashboard stats
 */
export async function getDashboardStats() {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const newLeads = MOCK_LEADS.filter(l => l.status === 'new').length;
        const pendingPayments = MOCK_BOOKINGS.filter(b => b.status === 'pending_payment').length;
        const confirmedBookings = MOCK_BOOKINGS.filter(b => b.status === 'confirmed').length;
        const totalEarnings = MOCK_BOOKINGS
            .filter(b => b.paymentStatus === 'paid' || b.paymentStatus === 'partial')
            .reduce((sum, b) => sum + (b.depositAmount || 0), 0);
        
        return {
            newLeads,
            pendingPayments,
            confirmedBookings,
            totalEarnings,
        };
    }

    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    const data = await response.json();
    return data;
}
