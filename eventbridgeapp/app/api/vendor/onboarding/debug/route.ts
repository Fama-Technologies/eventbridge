// app/api/vendor/onboarding/debug/route.ts
// DETAILED DEBUG ENDPOINT - Shows exactly what's in the database
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, sessions, onboardingProgress } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

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

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [progress] = await db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.userId, user.id))
      .limit(1);

    // Extract step data
    const step1 = progress?.formData?.step1 || null;
    const step2 = progress?.formData?.step2 || null;
    const step3 = progress?.formData?.step3 || null;
    const step4 = progress?.formData?.step4 || null;
    const step5 = progress?.formData?.step5 || null;
    const step6 = progress?.formData?.step6 || null;

    return NextResponse.json({
      status: 'Debug Info Retrieved',
      timestamp: new Date().toISOString(),
      
      user: {
        id: user.id,
        email: user.email,
        accountType: user.accountType,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      
      progress: {
        exists: !!progress,
        id: progress?.id,
        currentStep: progress?.currentStep,
        completedSteps: progress?.completedSteps || [],
        isComplete: progress?.isComplete || false,
        createdAt: progress?.createdAt,
        updatedAt: progress?.updatedAt,
      },
      
      steps: {
        step1: {
          saved: !!step1,
          fields: step1 ? Object.keys(step1) : [],
          data: step1,
        },
        step2: {
          saved: !!step2,
          packages: step2?.packages?.length || 0,
          data: step2,
        },
        step3: {
          saved: !!step3,
          images: step3?.images?.length || 0,
          videos: step3?.videos?.length || 0,
          data: step3,
        },
        step4: {
          saved: !!step4,
          policyLength: step4?.policyText?.length || 0,
          data: step4,
        },
        step5: {
          saved: !!step5,
          discounts: step5?.discounts?.length || 0,
          data: step5,
        },
        step6: {
          saved: !!step6,
          documents: step6?.documents?.length || 0,
          data: step6,
        },
      },
      
      validation: {
        canSubmit: true, // Will check below
        errors: [],
        warnings: [],
      },
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Internal error', 
        details: error instanceof Error ? error.message : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// POST to manually trigger completion with debug info
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { forceComplete } = body;

    const [progress] = await db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.userId, user.id))
      .limit(1);

    if (!progress) {
      return NextResponse.json({ error: 'No progress found' }, { status: 404 });
    }

    if (forceComplete) {
      // Call the main onboarding API
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/vendor/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '',
        },
        body: JSON.stringify({
          action: 'complete',
        }),
      });

      const result = await response.json();

      return NextResponse.json({
        debug: 'Force complete attempted',
        statusCode: response.status,
        result,
      });
    }

    return NextResponse.json({
      message: 'Send forceComplete: true to trigger completion',
      currentData: progress.formData,
    });
  } catch (error) {
    console.error('Debug POST error:', error);
    return NextResponse.json(
      { error: 'Internal error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}