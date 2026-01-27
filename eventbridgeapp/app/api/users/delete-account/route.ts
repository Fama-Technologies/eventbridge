// app/api/users/delete-account/route.ts - DEBUG VERSION
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, deletedAccounts } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  console.log('=== DELETE ACCOUNT API CALLED ===');
  
  try {
    // Get the current session to verify user
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session || !session.user?.email) {
      console.log('ERROR: No session or email');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Looking for user with email:', session.user.email);

    // Get the user from the database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    console.log('User found:', user);

    if (!user) {
      console.log('ERROR: User not found in database');
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Get feedback from request body (optional)
    const body = await req.json().catch(() => ({}));
    const { reason, details } = body;

    console.log('Deletion feedback:', { reason, details });

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
    try {
      console.log('Creating audit record...');
      const auditRecord = await db.insert(deletedAccounts).values({
        userId: user.id,
        email: user.email,
        accountType: user.accountType,
        reason: reason || null,
        details: details || null,
        deletedAt: new Date(),
      }).returning();

      console.log('Audit record created:', auditRecord);
    } catch (auditError) {
      console.error('Failed to create audit record:', auditError);
    }

    // HARD DELETE - This will cascade and delete all related data
    console.log('Attempting to delete user with ID:', user.id);
    
    const deleteResult = await db
      .delete(users)
      .where(eq(users.id, user.id))
      .returning();

    console.log('Delete result:', deleteResult);

    // Verify deletion
    const [stillExists] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    console.log('User still exists after delete?', !!stillExists);

    if (stillExists) {
      console.error('ERROR: User was not deleted!');
      return NextResponse.json(
        { success: false, message: 'Failed to delete account' },
        { status: 500 }
      );
    }

    console.log('SUCCESS: Account permanently deleted:', user.email);

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
    console.error('DELETE ACCOUNT ERROR:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete account. Please try again or contact support.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 