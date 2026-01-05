import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, accounts } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    // Get all users with proper ordering
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

    // Get all accounts
    const allAccounts = await db.select().from(accounts).orderBy(desc(accounts.createdAt));

    // Get users with their accounts using proper join
    const usersWithAccounts = await db
      .select({
        userId: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        provider: users.provider,
        accountType: users.accountType,
        emailVerified: users.emailVerified,
        isActive: users.isActive,
        image: users.image,
        userCreatedAt: users.createdAt,
        accountId: accounts.id,
        accountProvider: accounts.provider,
        accountProviderAccountId: accounts.providerAccountId,
        accountCreatedAt: accounts.createdAt,
      })
      .from(users)
      .leftJoin(accounts, eq(users.id, accounts.userId))
      .orderBy(desc(users.createdAt));

    // Count by provider
    const providerCounts = allUsers.reduce((acc, user) => {
      const provider = user.provider || 'null';
      acc[provider] = (acc[provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count by account type
    const accountTypeCounts = allUsers.reduce((acc, user) => {
      const type = user.accountType || 'null';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      summary: {
        totalUsers: allUsers.length,
        totalAccounts: allAccounts.length,
        providerBreakdown: providerCounts,
        accountTypeBreakdown: accountTypeCounts,
      },
      recentUsers: allUsers.slice(0, 10).map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        provider: user.provider,
        accountType: user.accountType,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
      })),
      usersWithAccounts: usersWithAccounts.slice(0, 10),
      allAccounts: allAccounts.slice(0, 10).map(acc => ({
        id: acc.id,
        userId: acc.userId,
        provider: acc.provider,
        providerAccountId: acc.providerAccountId,
        createdAt: acc.createdAt,
      })),
    }, { status: 200 });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch users', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Optional: DELETE method to clear test data (use carefully!)
export async function DELETE() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  try {
    // Delete all accounts first (due to foreign key constraints)
    await db.delete(accounts);
    
    // Then delete all users
    await db.delete(users);

    return NextResponse.json({ 
      message: 'All users and accounts deleted successfully' 
    }, { status: 200 });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete users', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}