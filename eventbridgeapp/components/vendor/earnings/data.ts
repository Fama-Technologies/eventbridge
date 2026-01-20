export interface Transaction {
    id: string;
    title: string;
    clientName: string;
    clientInitials: string;
    date: string; // ISO string or similar
    amount: number;
    status: 'paid' | 'pending' | 'cancelled';
    paymentDate?: string;
    lineItems?: {
        description: string;
        amount: number;
    }[];
}

export const transactionsData: Transaction[] = [
    {
        id: "TX-1001",
        title: "Sarah's Garden Wedding",
        clientName: "Sarah Williams",
        clientInitials: "SW",
        date: "2023-10-24",
        amount: 150000000,
        status: "paid",
        paymentDate: "Oct 24, 2023",
        lineItems: [
            { description: "Professional Sound System (Tier 1)", amount: 150000000 * 0.4 },
            { description: "Intelligent Stage Lighting Package", amount: 150000000 * 0.5 },
            { description: "Service Tax (8%)", amount: 150000000 * 0.1 }
        ]
    },
    {
        id: "TX-1002",
        title: "Tech Corp End-Year Mixer",
        clientName: "Thomas Chen",
        clientInitials: "TC",
        date: "2023-11-02",
        amount: 10000000,
        status: "paid",
        paymentDate: "Nov 02, 2023",
        lineItems: [
            { description: "Event Coordination", amount: 10000000 * 0.8 },
            { description: "Service Fee", amount: 10000000 * 0.2 }
        ]
    },
    {
        id: "TX-1003",
        title: "Liam's 30th Birthday Bash",
        clientName: "Linda Brown",
        clientInitials: "LB",
        date: "2023-11-15",
        amount: 8500000,
        status: "pending",
        lineItems: [
            { description: "Venue Rental", amount: 8500000 }
        ]
    },
    {
        id: "TX-1004",
        title: "Gala Event 2023",
        clientName: "George Enock",
        clientInitials: "GE",
        date: "2023-12-12",
        amount: 25000000,
        status: "cancelled",
        lineItems: []
    },
    {
        id: "TX-1005",
        title: "Anniversary Moonlight Dinner",
        clientName: "Arthur Morgan",
        clientInitials: "AM",
        date: "2023-12-20",
        amount: 1200000,
        status: "paid",
        paymentDate: "Dec 20, 2023",
        lineItems: [
            { description: "Catering Service", amount: 1200000 }
        ]
    },
    {
        id: "TX-1006",
        title: "Product Launch 2024",
        clientName: "Innovate Inc.",
        clientInitials: "II",
        date: "2024-01-15",
        amount: 50000000,
        status: "pending",
        lineItems: [
            { description: "Venue Rental", amount: 8500000 }
        ]
    },
    {
        id: "TX-1007",
        title: "Community Charity Run",
        clientName: "Local Hero NGO",
        clientInitials: "LH",
        date: "2024-02-01",
        amount: 500000,
        status: "paid",
        paymentDate: "Feb 01, 2024",
        lineItems: [
            { description: "Donation", amount: 500000 }
        ]
    },
    {
        id: "TX-1008",
        title: "Spring Festival",
        clientName: "City Council",
        clientInitials: "CC",
        date: "2024-03-10",
        amount: 12000000,
        status: "paid",
        paymentDate: "Mar 10, 2024",
        lineItems: [
            { description: "Festival Setup", amount: 12000000 }
        ]
    },
    {
        id: "TX-1009",
        title: "Private Yacht Party",
        clientName: "James Bond",
        clientInitials: "JB",
        date: "2024-04-05",
        amount: 80000000,
        status: "cancelled",
        lineItems: []
    }
];

export const earningsStats = {
    totalBookingsValue: 12450000,
    thisMonthValue: 3450000,
    completedPaidCount: 24,
    pendingPaymentsCount: 7
};
