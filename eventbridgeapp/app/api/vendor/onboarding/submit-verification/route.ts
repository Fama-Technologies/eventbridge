import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  users,
  vendorProfiles,
  vendorPackages,
  vendorPortfolio,
  cancellationPolicies,
  verificationDocuments,
} from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
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
      { success: false, message: 'Only vendors can submit verification.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const {
      businessName,
      serviceDescription,
      primaryLocation,
      phone,
      website,
      profilePhotoUrl,
      pricingStructure,
      galleryImageUrls,
      documentUrls,
    } = body;

    const now = new Date();

    // Check existing vendor profile
    const [existingProfile] = await db
      .select()
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

    const locationParts = primaryLocation?.split(',').map((p: string) => p.trim()) || [];
    const city = locationParts[0] || null;
    const state = locationParts[1] || null;

    let vendorProfileId: number;

    const profileData = {
      businessName: businessName?.trim(),
      description: serviceDescription?.trim(),
      city,
      state,
      phone: phone || null,
      website: website || null,
      profileImage: profilePhotoUrl || null,
      verificationStatus: 'under_review',
      verificationSubmittedAt: now,
      verificationReviewedAt: null,
      verificationNotes: null,
      canAccessDashboard: false,
      isVerified: false,
      updatedAt: now,
    };

    // Update or Insert Profile
    if (existingProfile) {
      await db
        .update(vendorProfiles)
        .set(profileData)
        .where(eq(vendorProfiles.userId, user.id));
      vendorProfileId = existingProfile.id;
    } else {
      const [newProfile] = await db
        .insert(vendorProfiles)
        .values({
          userId: user.id,
          ...profileData,
          createdAt: now,
        })
        .returning();
      vendorProfileId = newProfile.id;
    }

    // Save Packages
    if (pricingStructure && pricingStructure.length > 0) {
      await db
        .delete(vendorPackages)
        .where(eq(vendorPackages.vendorId, vendorProfileId));

      const packages = pricingStructure.map((item: string, index: number) => ({
        vendorId: vendorProfileId,
        name: item,
        description: `${item} package`,
        price: 0,
        features: [],
        isPopular: false,
        isActive: true,
        displayOrder: index,
      }));

      await db.insert(vendorPackages).values(packages);
    }

    // Save Portfolio
    if (galleryImageUrls && galleryImageUrls.length > 0) {
      await db
        .delete(vendorPortfolio)
        .where(eq(vendorPortfolio.vendorId, vendorProfileId));

      const portfolioItems = galleryImageUrls.map((url: string, index: number) => ({
        vendorId: vendorProfileId,
        imageUrl: url,
        title: `Gallery Image ${index + 1}`,
        displayOrder: index,
      }));

      await db.insert(vendorPortfolio).values(portfolioItems);
    }

    // Save Documents
    if (documentUrls && documentUrls.length > 0) {
      await db
        .delete(verificationDocuments)
        .where(eq(verificationDocuments.vendorId, vendorProfileId));

      const documents = documentUrls.map((url: string, index: number) => ({
        vendorId: vendorProfileId,
        documentType: 'business_license',
        documentUrl: url,
        documentName: `Document ${index + 1}`,
        status: 'pending',
      }));

      await db.insert(verificationDocuments).values(documents);
    }

    // Ensure Cancellation Policy Exists
    const [existingPolicy] = await db
      .select()
      .from(cancellationPolicies)
      .where(eq(cancellationPolicies.vendorId, vendorProfileId))
      .limit(1);

    if (!existingPolicy) {
      const defaultPolicy = 'Standard cancellation policy: Full refund if cancelled 7 days before event. 50% refund if cancelled 3-7 days before. No refund if cancelled less than 3 days before event.';
      await db.insert(cancellationPolicies).values({
        vendorId: vendorProfileId,
        policyText: defaultPolicy,
      });
    }

    // Sync to Users Table (Account Type & Image)
    const userUpdate: { accountType?: 'VENDOR' | 'CUSTOMER' | 'ADMIN' | 'PLANNER'; image?: string } = {};

    // We already checked user is VENDOR at top of function

    if (profilePhotoUrl) {
      userUpdate.image = profilePhotoUrl;
    }

    if (Object.keys(userUpdate).length > 0) {
      await db
        .update(users)
        .set(userUpdate)
        .where(eq(users.id, user.id));
    }

    return NextResponse.json({
      success: true,
      message: 'Verification submitted successfully. Our team will review your documents.',
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
