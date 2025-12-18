// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eventCategories } from '@/drizzle/schema';
import { asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const categories = await db
      .select()
      .from(eventCategories)
      .orderBy(asc(eventCategories.name));

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}