import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { vendorProfiles } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);

  // Auth check
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  // 👤 Vendor-only
  if (user.accountType !== 'VENDOR') {
    return NextResponse.json(
      { success: false, message: 'Only vendors can submit verification.' },
      { status: 403 }
    );
  }

  try {
    const now = new Date();

    // Check existing vendor profile
    const [existingProfile] = await db
      .select({
        id: vendorProfiles.id,
        verificationStatus: vendorProfiles.verificationStatus,
      })
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    // Already approved → block
    if (existingProfile?.verificationStatus === 'approved') {
      return NextResponse.json(
        {
          success: false,
          message: 'Your account is already verified.',
        },
        { status: 400 }
      );
    }

    // Update existing profile
    if (existingProfile) {
      await db
        .update(vendorProfiles)
        .set({
          verificationStatus: 'under_review',
          verificationSubmittedAt: now,
          verificationReviewedAt: null,
          verificationNotes: null,
          canAccessDashboard: false,
          isVerified: false,
          updatedAt: now,
        })
        .where(eq(vendorProfiles.userId, user.id));
    } else {
      // Create vendor profile if missing
      await db.insert(vendorProfiles).values({
        userId: user.id,
        verificationStatus: 'under_review',
        verificationSubmittedAt: now,
        canAccessDashboard: false,
        isVerified: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    return NextResponse.json({
      success: true,
      message:
        'Verification submitted successfully. Our team will review your documents.',
      verificationStatus: 'under_review',
      canAccessDashboard: false,
    });
  } catch (error) {
    console.error('Submit verification error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit verification. Please try again.',
      },
      { status: 500 }
    );
  }
}
