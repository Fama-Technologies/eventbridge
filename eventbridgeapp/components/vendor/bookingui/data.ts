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

export const bookingsData: Booking[] = [
    {
        id: "1",
        bookingId: "BK-9281-2023",
        title: "Sarah's Wedding",
        status: 'confirmed',
        date: new Date(2023, 9, 24), // Oct 24
        startDate: new Date(2023, 9, 24),
        endDate: new Date(2023, 9, 26),
        initials: "SJ",
        avatarUrl: "/avatars/sarah.png",
        dateDisplay: "Oct 24-26",
        client: {
            name: "Sarah Jenkins",
            avatar: "/avatars/sarah.png",
            rating: 5.0,
            reviews: 2
        },
        guestCount: 150,
        totalAmount: 4500000,
        venue: "The Grand Hall, downtown",
        dateRange: "Oct 24 - Oct 26, 2023",
        timeRange: "10:00 AM - 11:00 PM",
        paymentStatus: "Deposit Paid",
        payments: [
            { label: "Full Wedding Package", amount: 3000000 },
            { label: "Photography Add-on (Premium)", amount: 1200000 },
            { label: "Service Fee", amount: 300000 },
            { label: "Paid on Sep 12", amount: 2250000, type: 'paid' },
            { label: "Balance Due (Oct 24)", amount: 2250000, type: 'due' }
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
        bookingId: "BK-9282-2023",
        title: "Tech Corp Mixer",
        status: 'pending',
        date: new Date(2023, 10, 2), // Nov 2
        startDate: new Date(2023, 10, 2),
        endDate: new Date(2023, 10, 2),
        initials: "TC",
        dateDisplay: "Nov 02",
        client: {
            name: "Tech Corp",
            rating: 4.5,
            reviews: 8
        },
        guestCount: 50,
        totalAmount: 10000000,
        venue: "Innovation Hub",
        dateRange: "Nov 02, 2023",
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
        bookingId: "BK-9283-2023",
        title: "Liam's 30th",
        status: 'confirmed',
        date: new Date(2023, 10, 15), // Nov 15
        startDate: new Date(2023, 10, 15),
        endDate: new Date(2023, 10, 15),
        initials: "LW",
        avatarUrl: "/avatars/men.png",
        dateDisplay: "Nov 15",
        client: {
            name: "Liam Williams",
            avatar: "/avatars/men.png",
            rating: 4.8,
            reviews: 3
        },
        guestCount: 40,
        totalAmount: 2800000,
        venue: "Skyline Rooftop",
        dateRange: "Nov 15, 2023",
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
    new Date(2023, 9, 5), // Oct 5
];
