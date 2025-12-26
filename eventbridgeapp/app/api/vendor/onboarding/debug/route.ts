// app/api/vendor/onboarding/debug/route.ts
// TEMPORARY DEBUG ENDPOINT - Remove in production
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, sessions, onboardingProgress } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

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

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        accountType: user.accountType,
      },
      progress: progress || null,
      formData: progress?.formData || {},
      steps: {
        step1: progress?.formData?.step1 || null,
        step2: progress?.formData?.step2 || null,
        step3: progress?.formData?.step3 || null,
        step4: progress?.formData?.step4 || null,
        step5: progress?.formData?.step5 || null,
        step6: progress?.formData?.step6 || null,
      },
      validation: {
        hasBusinessName: !!progress?.formData?.step1?.businessName,
        hasDescription: !!progress?.formData?.step1?.serviceDescription,
        hasPackages: (progress?.formData?.step2?.packages?.length || 0) > 0,
        hasImages: (progress?.formData?.step3?.images?.length || 0) > 0,
        hasPolicy: !!progress?.formData?.step4?.policyText,
        policyLength: progress?.formData?.step4?.policyText?.length || 0,
      },
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal error', details: error instanceof Error ? error.message : 'Unknown' },
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