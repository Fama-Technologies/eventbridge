import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import {
  users,
  sessions,
  vendorProfiles,
  onboardingProgress,
  vendorPackages,
  vendorPortfolio,
  cancellationPolicies,
  verificationDocuments,
} from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getCurrentUser() {
  try {
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
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}

function canUserBeVendor(user: any): { allowed: boolean; reason?: string } {
  if (user.accountType === 'PLANNER') {
    return {
      allowed: false,
      reason: 'Event planners cannot register as vendors.',
    };
  }
  return { allowed: true };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendorCheck = canUserBeVendor(user);
    if (!vendorCheck.allowed) {
      return NextResponse.json({ error: vendorCheck.reason }, { status: 403 });
    }

    const [progress] = await db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.userId, user.id))
      .limit(1);

    if (!progress) {
      const [newProgress] = await db
        .insert(onboardingProgress)
        .values({
          userId: user.id,
          currentStep: 1,
          completedSteps: [],
          formData: {},
        })
        .returning();

      return NextResponse.json({
        success: true,
        progress: newProgress,
      });
    }

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error('GET onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendorCheck = canUserBeVendor(user);
    if (!vendorCheck.allowed) {
      return NextResponse.json({ error: vendorCheck.reason }, { status: 403 });
    }

    const body = await request.json();
    
    const {
      businessName,
      serviceCategories,
      primaryLocation,
      serviceDescription,
      pricingStructure,
      priceRange,
      generalAvailability,
      phone,
      website,
      profilePhotoUrl,
      galleryImageUrls,
      documentUrls,
    } = body;

    console.log('Received onboarding data:', {
      businessName,
      hasProfilePhoto: !!profilePhotoUrl,
      galleryCount: galleryImageUrls?.length || 0,
      documentCount: documentUrls?.length || 0,
    });

    if (!businessName || businessName.trim().length < 3) {
      return NextResponse.json(
        { error: 'Business name is required (min 3 characters)' },
        { status: 400 }
      );
    }

    if (!serviceDescription || serviceDescription.trim().length < 50) {
      return NextResponse.json(
        { error: 'Service description must be at least 50 characters' },
        { status: 400 }
      );
    }

    const locationParts = primaryLocation?.split(',').map((p: string) => p.trim()) || [];
    const city = locationParts[0] || null;
    const state = locationParts[1] || null;

    const [existingProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    let vendorProfileId: number;

    const profileData = {
      businessName: businessName.trim(),
      description: serviceDescription.trim(),
      city,
      state,
      phone: phone || null,
      website: website || null,
      profileImage: profilePhotoUrl || null,
      verificationStatus: 'under_review',
      verificationSubmittedAt: new Date(),
      canAccessDashboard: false,
      updatedAt: new Date(),
    };

    if (existingProfile) {
      await db
        .update(vendorProfiles)
        .set(profileData)
        .where(eq(vendorProfiles.id, existingProfile.id));
      vendorProfileId = existingProfile.id;
      console.log('Updated existing vendor profile:', vendorProfileId);
    } else {
      const [newProfile] = await db
        .insert(vendorProfiles)
        .values({
          userId: user.id,
          ...profileData,
          isVerified: false,
        })
        .returning();
      vendorProfileId = newProfile.id;
      console.log('Created new vendor profile:', vendorProfileId);
    }

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
      console.log('Saved packages:', packages.length);
    }

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
      console.log('Saved portfolio items:', portfolioItems.length);
    }

    const defaultPolicy = 'Standard cancellation policy: Full refund if cancelled 7 days before event. 50% refund if cancelled 3-7 days before. No refund if cancelled less than 3 days before event.';
    
    const [existingPolicy] = await db
      .select()
      .from(cancellationPolicies)
      .where(eq(cancellationPolicies.vendorId, vendorProfileId))
      .limit(1);

    if (existingPolicy) {
      await db
        .update(cancellationPolicies)
        .set({
          policyText: defaultPolicy,
          updatedAt: new Date(),
        })
        .where(eq(cancellationPolicies.vendorId, vendorProfileId));
    } else {
      await db.insert(cancellationPolicies).values({
        vendorId: vendorProfileId,
        policyText: defaultPolicy,
      });
    }
    console.log('Saved cancellation policy');

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
      console.log('Saved verification documents:', documents.length);
    }

    if (user.accountType === 'CUSTOMER') {
      await db
        .update(users)
        .set({ accountType: 'VENDOR' })
        .where(eq(users.id, user.id));
      console.log('Updated user account type to VENDOR');
    }

    const [progress] = await db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.userId, user.id))
      .limit(1);

    if (progress) {
      await db
        .update(onboardingProgress)
        .set({
          isComplete: true,
          updatedAt: new Date(),
        })
        .where(eq(onboardingProgress.id, progress.id));
    } else {
      await db.insert(onboardingProgress).values({
        userId: user.id,
        currentStep: 4,
        completedSteps: [1, 2, 3, 4],
        formData: {},
        isComplete: true,
      });
    }
    console.log('Marked onboarding as complete');

    return NextResponse.json({
      success: true,
      message: 'Application submitted for verification.',
      verificationStatus: 'under_review',
      vendorProfileId,
    });
  } catch (error) {
    console.error('POST Onboarding error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save progress',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}