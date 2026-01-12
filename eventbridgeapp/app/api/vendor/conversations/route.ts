import { NextResponse } from 'next/server';

export async function GET() {
    // No real conversations table yet
    return NextResponse.json({ conversations: [] });
}
