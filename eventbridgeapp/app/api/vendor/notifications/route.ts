import { NextResponse } from 'next/server';

export async function GET() {
    // No real notifications table yet
    return NextResponse.json({ notifications: [] });
}

export async function POST(request: Request) {
    return NextResponse.json({ success: true });
}
