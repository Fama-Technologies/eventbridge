import { NextResponse } from 'next/server';

export async function GET() {
    // No real leads table yet
    return NextResponse.json({ leads: [] });
}
