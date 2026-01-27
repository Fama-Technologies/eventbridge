// app/api/users/delete-account/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, deletedAccounts } from '@/drizzle/schema';
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

    // Get feedback from request body (optional)
    const body = await req.json().catch(() => ({}));
    const { reason, details } = body;

    // Log deletion details for monitoring
    console.log('Account deletion initiated:', { 
      userId: user.id, 
      email: user.email,
      accountType: user.accountType,
      reason: reason || 'Not provided', 
      details: details || 'Not provided',
      timestamp: new Date().toISOString()
    });

    // Create audit record BEFORE deleting the user
    // This preserves the deletion history even after the user is gone
    try {
      await db.insert(deletedAccounts).values({
        userId: user.id,
        email: user.email,
        accountType: user.accountType,
        reason: reason || null,
        details: details || null,
        deletedAt: new Date(),
      });

      console.log(`Audit record created for user: ${user.email}`);
    } catch (auditError) {
      // Log error but don't fail the deletion
      console.error('Failed to create audit record:', auditError);
    }

    // ✅ HARD DELETE - This will cascade and delete all related data
    // The database will automatically delete:
    // - accounts, sessions, events, passwordResetTokens
    // - vendorProfile and all vendor-related data
    // - userUploads, onboardingProgress, bookings, reviews, invoices
    await db
      .delete(users)
      .where(eq(users.id, user.id));

    console.log(`✅ Account permanently deleted: ${user.email} (ID: ${user.id})`);
    console.log(`All related data cascaded successfully`);

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
    console.error('❌ Delete account error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete account. Please try again or contact support.' 
      },
      { status: 500 }
    );
  }
}