import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';

export async function GET() {
  try {
    const allUsers = await db.select().from(users).limit(5);
    
    return NextResponse.json({
      success: true,
      userCount: allUsers.length,
      users: allUsers.map(u => ({ id: u.id, email: u.email, provider: u.provider })),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}