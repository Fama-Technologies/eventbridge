import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Get the current session to verify user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user from the database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Optional: Get feedback from request body
    const body = await req.json().catch(() => ({}));
    const { reason, details } = body;

    // Store feedback before deletion (optional)
    if (reason || details) {
      console.log('Account deletion feedback:', { 
        userId: user.id, 
        email: user.email, 
        reason, 
        details 
      });
      // You could save this to a separate feedback/audit table
    }

    // Instead of hard deleting, we'll soft delete by marking as inactive
    await db
      .update(users)
      .set({
        isActive: false,
        email: `deleted_${Date.now()}_${user.email}`, // Anonymize email
        firstName: 'Deleted',
        lastName: 'User',
        phone: null,
        image: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    console.log(`Account soft-deleted for user: ${user.email}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Account deleted successfully',
        data: {
          userId: user.id,
          email: user.email,
          deletedAt: new Date().toISOString(),
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}