import { NextResponse } from 'next/server';

export async function GET() {
    // No real invoices table yet
    return NextResponse.json({ invoices: [] });
}
