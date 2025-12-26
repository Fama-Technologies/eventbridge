import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  users,
  vendorProfiles,
  vendorServices,
  vendorPackages,
  vendorPortfolio,
  vendorVideos,
  cancellationPolicies,
  vendorDiscounts,
  verificationDocuments,
  onboardingProgress,
} from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);

  // Auth check
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Vendor-only
  if (user.accountType !== 'VENDOR') {
    return NextResponse.json(
      { success: false, message: 'Only vendors can access this summary.' },
      { status: 403 }
    );
  }

  try {
    /* ===================== USER ===================== */
    const [userInfo] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        image: users.image,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    /* ===================== VENDOR PROFILE ===================== */
    const [vendorProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    if (!vendorProfile) {
      return NextResponse.json(
        {
          success: false,
          message: 'Vendor profile not found.',
        },
        { status: 404 }
      );
    }

    /* ===================== SERVICES ===================== */
    const services = await db
      .select()
      .from(vendorServices)
      .where(eq(vendorServices.vendorId, vendorProfile.id));

    /* ===================== PACKAGES ===================== */
    const packages = await db
      .select()
      .from(vendorPackages)
      .where(eq(vendorPackages.vendorId, vendorProfile.id));

    /* ===================== PORTFOLIO ===================== */
    const portfolio = await db
      .select()
      .from(vendorPortfolio)
      .where(eq(vendorPortfolio.vendorId, vendorProfile.id));

    /* ===================== VIDEOS ===================== */
    const videos = await db
      .select()
      .from(vendorVideos)
      .where(eq(vendorVideos.vendorId, vendorProfile.id));

    /* ===================== CANCELLATION POLICY ===================== */
    const [cancellationPolicy] = await db
      .select()
      .from(cancellationPolicies)
      .where(eq(cancellationPolicies.vendorId, vendorProfile.id))
      .limit(1);

    /* ===================== DISCOUNTS ===================== */
    const discounts = await db
      .select()
      .from(vendorDiscounts)
      .where(eq(vendorDiscounts.vendorId, vendorProfile.id));

    /* ===================== VERIFICATION DOCUMENTS ===================== */
    const documents = await db
      .select()
      .from(verificationDocuments)
      .where(eq(verificationDocuments.vendorId, vendorProfile.id));

    /* ===================== ONBOARDING PROGRESS ===================== */
    const [progress] = await db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.userId, user.id))
      .limit(1);

    /* ===================== RESPONSE ===================== */
    return NextResponse.json({
      success: true,
      summary: {
        user: userInfo,
        vendorProfile,
        services,
        packages,
        portfolio,
        videos,
        cancellationPolicy,
        discounts,
        verificationDocuments: documents,
        onboardingProgress: progress,
        verification: {
          status: vendorProfile.verificationStatus,
          canAccessDashboard: vendorProfile.canAccessDashboard,
          submittedAt: vendorProfile.verificationSubmittedAt,
        },
      },
    });
  } catch (error) {
    console.error('Review summary error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to load review summary.',
      },
      { status: 500 }
    );
  }
}
