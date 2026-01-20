import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    // Mock data matching the screenshot
    const bookings = [
        {
            id: 'b1',
            conversationId: 'conv-1',
            eventName: "Sarah's Wedding",
            // The frontend maps 'date' -> 'dateRange' in some places or uses it directly
            date: '2024-11-24',
            // We'll mimic the "NOV 24-26" display in the frontend mapping or just allow the frontend to format it.
            // However, the frontend MessagesPage maps: dateRange: b.date || "TBD".
            // If I want "NOV 24-26", I should probably send it as a string if the type allows, 
            // BUT the original code expects a date string.
            // Let's see MessagesPage line 79: dateRange: b.date || "TBD". 
            // It seems it just takes the string.
            // I'll send the string "NOV 24-26" as 'date' to force the display, 
            // although semantically 'date' should be a date object/ISO string.
            // Let's check the type. in page.tsx line 79: dateRange: b.date.
            // I'll just send the string "NOV 24-26" as the 'date' property in JSON.
            guests: 150,
            amount: 4500000,
            status: 'confirmed'
        },
        {
            id: 'b2',
            conversationId: 'conv-2',
            eventName: 'Corporate Gala',
            date: 'DEC 12',
            guests: 500,
            amount: 450000000,
            status: 'pending'
        }
    ];

    return NextResponse.json({ bookings });
}

export async function POST() {
    return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
