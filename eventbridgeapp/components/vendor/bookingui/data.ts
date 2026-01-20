import { format } from "date-fns";
export interface Booking {
    id: string; // Internal ID
    bookingId: string; // Display ID e.g. BK-9281-2023
    title: string;
    status: 'confirmed' | 'pending' | 'blocked';

    // Calendar fields
    date: Date;
    startDate: Date;
    endDate: Date;

    // Card Display fields
    initials: string;
    avatarUrl?: string; // For card display
    dateDisplay: string; // e.g. "Oct 24-26"

    // Details Modal fields
    client: {
        name: string;
        avatar?: string;
        rating: number;
        reviews: number;
    };
    guestCount: number;
    totalAmount: number; // standardized name
    venue: string;
    dateRange: string;
    timeRange: string;
    paymentStatus: string;
    payments: {
        label: string;
        amount: number;
        type?: 'normal' | 'paid' | 'due';
    }[];
    latestMessage?: {
        sender: string;
        avatar?: string;
        time: string;
        content: string;
        attachment?: string;
    };
}

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

export const bookingsData: Booking[] = [
    {
        id: "1",
        bookingId: `BK-9281-${currentYear}`,
        title: "Sarah's Wedding",
        status: 'confirmed',
        date: new Date(currentYear, currentMonth, 24),
        startDate: new Date(currentYear, currentMonth, 24),
        endDate: new Date(currentYear, currentMonth, 26),
        initials: "SJ",
        avatarUrl: "/avatars/sarah.png",
        dateDisplay: format(new Date(currentYear, currentMonth, 24), "MMM d") + "-" + format(new Date(currentYear, currentMonth, 26), "d"),
        client: {
            name: "Sarah Jenkins",
            avatar: "/avatars/sarah.png",
            rating: 5.0,
            reviews: 2
        },
        guestCount: 150,
        totalAmount: 4500000,
        venue: "The Grand Hall, downtown",
        dateRange: format(new Date(currentYear, currentMonth, 24), "MMM d, yyyy") + " - " + format(new Date(currentYear, currentMonth, 26), "MMM d, yyyy"),
        timeRange: "10:00 AM - 11:00 PM",
        paymentStatus: "Deposit Paid",
        payments: [
            { label: "Full Wedding Package", amount: 3000000 },
            { label: "Photography Add-on (Premium)", amount: 1200000 },
            { label: "Service Fee", amount: 300000 },
            { label: "Paid on Sep 12", amount: 2250000, type: 'paid' },
            { label: "Balance Due", amount: 2250000, type: 'due' }
        ],
        latestMessage: {
            sender: "Sarah",
            avatar: "/avatars/sarah.png",
            time: "Yesterday, 4:20 PM",
            content: "Hi! We are really excited. Quick question about the lighting setup - can we do a walkthrough next Tuesday around 2pm?",
            attachment: "moodboard_v2.pdf"
        }
    },
    {
        id: "2",
        bookingId: `BK-9282-${currentYear}`,
        title: "Tech Corp Mixer",
        status: 'pending',
        date: new Date(currentYear, currentMonth + 1, 2),
        startDate: new Date(currentYear, currentMonth + 1, 2),
        endDate: new Date(currentYear, currentMonth + 1, 2),
        initials: "TC",
        dateDisplay: format(new Date(currentYear, currentMonth + 1, 2), "MMM d"),
        client: {
            name: "Tech Corp",
            rating: 4.5,
            reviews: 8
        },
        guestCount: 50,
        totalAmount: 10000000,
        venue: "Innovation Hub",
        dateRange: format(new Date(currentYear, currentMonth + 1, 2), "MMM d, yyyy"),
        timeRange: "6:00 PM - 10:00 PM",
        paymentStatus: "Pending",
        payments: [
            { label: "Corporate Event Package", amount: 8000000 },
            { label: "Catering Add-on", amount: 1500000 },
            { label: "Service Fee", amount: 500000 }
        ]
    },
    {
        id: "3",
        bookingId: `BK-9283-${currentYear}`,
        title: "Liam's 30th",
        status: 'confirmed',
        date: new Date(currentYear, currentMonth, 15),
        startDate: new Date(currentYear, currentMonth, 15),
        endDate: new Date(currentYear, currentMonth, 15),
        initials: "LW",
        avatarUrl: "/avatars/men.png",
        dateDisplay: format(new Date(currentYear, currentMonth, 15), "MMM d"),
        client: {
            name: "Liam Williams",
            avatar: "/avatars/men.png",
            rating: 4.8,
            reviews: 3
        },
        guestCount: 40,
        totalAmount: 2800000,
        venue: "Skyline Rooftop",
        dateRange: format(new Date(currentYear, currentMonth, 15), "MMM d, yyyy"),
        timeRange: "7:00 PM - 12:00 AM",
        paymentStatus: "Fully Paid",
        payments: [
            { label: "Birthday Party Package", amount: 2500000 },
            { label: "Service Fee", amount: 300000 },
            { label: "Paid on Nov 01", amount: 2800000, type: 'paid' }
        ]
    }
];

export const blockedDatesData: Date[] = [
    new Date(new Date().setDate(new Date().getDate() + 5)), // 5 days from now
];

export interface Transaction {
    id: string;
    title: string;
    clientName: string;
    clientInitials: string;
    date: Date;
    amount: number;
    status: 'paid' | 'pending' | 'cancelled';
}

export const transactionsData: Transaction[] = [
    {
        id: '1',
        title: "Sarah's Wedding Reception",
        clientName: "Sarah Williams",
        clientInitials: "SW",
        date: new Date(2023, 9, 24), // Oct 24, 2023
        amount: 150000000,
        status: 'paid'
    },
    {
        id: '2',
        title: "Tech Corp End-Year Mixer",
        clientName: "Thomas Chen",
        clientInitials: "TC",
        date: new Date(2023, 10, 2), // Nov 02, 2023
        amount: 10000000,
        status: 'paid'
    },
    {
        id: '3',
        title: "Liam's 30th Birthday Bash",
        clientName: "Linda Brown",
        clientInitials: "LB",
        date: new Date(2023, 10, 15), // Nov 15, 2023
        amount: 8500000,
        status: 'pending'
    },
    {
        id: '4',
        title: "Gala Event 2023",
        clientName: "George Enock",
        clientInitials: "GE",
        date: new Date(2023, 11, 12), // Dec 12, 2023
        amount: 25000000,
        status: 'cancelled'
    },
    {
        id: '5',
        title: "Anniversary Moonlight Dinner",
        clientName: "Arthur Morgan",
        clientInitials: "AM",
        date: new Date(2023, 11, 20), // Dec 20, 2023
        amount: 1200000,
        status: 'paid'
    }
];
