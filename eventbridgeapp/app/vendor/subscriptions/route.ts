// app/api/vendor/subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { 
  vendorSubscriptions, 
  subscriptionPlans, 
  vendorProfiles, 
  users, 
  sessions 
} from '@/drizzle/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

// Helper function to get current user (same as in packages route)
async function getCurrentUser() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;
  const sessionToken = cookieStore.get('session')?.value;

  if (authToken) {
    try {
      const payload = await verifyToken(authToken);
      if (payload && payload.userId) {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, payload.userId as number))
          .limit(1);
        return user;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  }

  if (sessionToken) {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, sessionToken))
      .limit(1);

    if (session && new Date(session.expiresAt) >= new Date()) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);
      return user;
    }
  }

  return null;
}

// Helper function to get vendor's current active subscription
async function getActiveVendorSubscription(vendorId: number) {
  const now = new Date();
  
  const subscription = await db
    .select({
      subscription: vendorSubscriptions,
      plan: subscriptionPlans,
    })
    .from(vendorSubscriptions)
    .innerJoin(subscriptionPlans, eq(vendorSubscriptions.planId, subscriptionPlans.id))
    .where(
      and(
        eq(vendorSubscriptions.vendorId, vendorId),
        eq(vendorSubscriptions.status, 'active'),
        lte(vendorSubscriptions.currentPeriodStart, now),
        gte(vendorSubscriptions.currentPeriodEnd, now)
      )
    )
    .orderBy(desc(vendorSubscriptions.createdAt))
    .limit(1);

  return subscription[0] || null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (user.accountType !== 'VENDOR') {
      return NextResponse.json({ success: false, error: 'Vendor only' }, { status: 403 });
    }

    const [vendorProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    if (!vendorProfile) {
      return NextResponse.json({ success: false, error: 'Vendor profile not found' }, { status: 404 });
    }

    // Get current active subscription
    const activeSubscription = await getActiveVendorSubscription(vendorProfile.id);

    // Get all subscriptions (including expired/canceled)
    const allSubscriptions = await db
      .select({
        subscription: vendorSubscriptions,
        plan: subscriptionPlans,
      })
      .from(vendorSubscriptions)
      .innerJoin(subscriptionPlans, eq(vendorSubscriptions.planId, subscriptionPlans.id))
      .where(eq(vendorSubscriptions.vendorId, vendorProfile.id))
      .orderBy(desc(vendorSubscriptions.createdAt));

    // Get all available plans
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.priceMonthly);

    // If no active subscription, check if vendor is on free trial
    let isFreeTrial = false;
    let trialEndsAt = null;
    
    if (!activeSubscription) {
      // Check if vendor has a free trial (first 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (vendorProfile.createdAt && new Date(vendorProfile.createdAt) > thirtyDaysAgo) {
        isFreeTrial = true;
        trialEndsAt = new Date(vendorProfile.createdAt);
        trialEndsAt.setDate(trialEndsAt.getDate() + 30);
      }
    }

    return NextResponse.json({
      success: true,
      currentSubscription: activeSubscription,
      allSubscriptions,
      availablePlans: plans,
      vendorProfile: {
        id: vendorProfile.id,
        subscriptionStatus: vendorProfile.subscriptionStatus,
        trialEndsAt: vendorProfile.trialEndsAt,
      },
      isFreeTrial,
      trialEndsAt,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST: Create a new subscription (for upgrade)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (user.accountType !== 'VENDOR') {
      return NextResponse.json({ success: false, error: 'Vendor only' }, { status: 403 });
    }

    const [vendorProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    if (!vendorProfile) {
      return NextResponse.json({ success: false, error: 'Vendor profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { planId, billingCycle, paymentMethodId } = body;

    if (!planId || !billingCycle) {
      return NextResponse.json({ success: false, error: 'Plan ID and billing cycle are required' }, { status: 400 });
    }

    // Check if plan exists
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(
        and(
          eq(subscriptionPlans.id, planId),
          eq(subscriptionPlans.isActive, true)
        )
      )
      .limit(1);

    if (!plan) {
      return NextResponse.json({ success: false, error: 'Plan not found or inactive' }, { status: 404 });
    }

    // Check if vendor already has an active subscription
    const existingActiveSubscription = await getActiveVendorSubscription(vendorProfile.id);
    
    const now = new Date();
    const periodEnd = new Date();
    
    if (billingCycle === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // For demo purposes, we'll create the subscription without payment processing
    // In production, integrate with Stripe/PayPal here
    const [newSubscription] = await db
      .insert(vendorSubscriptions)
      .values({
        vendorId: vendorProfile.id,
        planId: plan.id,
        status: 'active',
        billingCycle,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: null, // Replace with actual Stripe subscription ID
        stripeCustomerId: null, // Replace with actual Stripe customer ID
        metadata: {
          upgradedFrom: existingActiveSubscription?.plan?.name || 'free',
          paymentMethodId: paymentMethodId || 'demo',
        },
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Update vendor profile subscription status
    await db
      .update(vendorProfiles)
      .set({
        subscriptionStatus: 'active',
        updatedAt: now,
      })
      .where(eq(vendorProfiles.id, vendorProfile.id));

    return NextResponse.json({
      success: true,
      subscription: {
        ...newSubscription,
        plan,
      },
      message: 'Subscription created successfully',
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PATCH: Update subscription (cancel, change plan, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (user.accountType !== 'VENDOR') {
      return NextResponse.json({ success: false, error: 'Vendor only' }, { status: 403 });
    }

    const [vendorProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    if (!vendorProfile) {
      return NextResponse.json({ success: false, error: 'Vendor profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action, subscriptionId } = body;

    if (!action || !subscriptionId) {
      return NextResponse.json({ success: false, error: 'Action and subscription ID are required' }, { status: 400 });
    }

    // Verify subscription belongs to vendor
    const [subscription] = await db
      .select()
      .from(vendorSubscriptions)
      .where(
        and(
          eq(vendorSubscriptions.id, subscriptionId),
          eq(vendorSubscriptions.vendorId, vendorProfile.id)
        )
      )
      .limit(1);

    if (!subscription) {
      return NextResponse.json({ success: false, error: 'Subscription not found' }, { status: 404 });
    }

    const now = new Date();

    switch (action) {
      case 'cancel':
        // Cancel at period end
        await db
          .update(vendorSubscriptions)
          .set({
            cancelAtPeriodEnd: true,
            updatedAt: now,
          })
          .where(eq(vendorSubscriptions.id, subscriptionId));
        
        return NextResponse.json({
          success: true,
          message: 'Subscription will be canceled at the end of the billing period',
        });

      case 'reactivate':
        // Reactivate canceled subscription
        await db
          .update(vendorSubscriptions)
          .set({
            cancelAtPeriodEnd: false,
            updatedAt: now,
          })
          .where(eq(vendorSubscriptions.id, subscriptionId));
        
        return NextResponse.json({
          success: true,
          message: 'Subscription reactivated',
        });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Update subscription error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}