import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';
import {
  users,
  sessions,
  vendorProfiles,
  vendorAvailability,
  onboardingProgress,
  vendorServices,
  vendorPackages,
  vendorPortfolio,
  vendorVideos,
  cancellationPolicies,
  verificationDocuments,
  userUploads,
} from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper to convert userId to number safely
function getUserIdNumber(user: any): number {
  const userId = Number(user.id);
  if (isNaN(userId)) {
    console.error('Invalid user.id:', user.id);
    throw new Error('Invalid user ID');
  }
  return userId;
}

async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(session.user.id)))
    .limit(1);
    
  return user || null;
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

function parsePriceRange(value?: string): number | null {
  if (!value) return null;
  const match = value.match(/[\d,]+/);
  if (!match) return null;
  const parsed = Number(match[0].replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function mapWorkingDaysToActiveDays(workingDays?: string[]): number[] {
  const dayMap: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thur: 3,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };

  if (!workingDays || workingDays.length === 0) return [];
  return workingDays
    .map((day) => dayMap[day])
    .filter((day) => Number.isFinite(day));
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

    const userId = getUserIdNumber(user);
    
    const [progress] = await db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.userId, userId))
      .limit(1);

    if (!progress) {
      const [newProgress] = await db
        .insert(onboardingProgress)
        .values({
          userId: userId,
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

    const userId = getUserIdNumber(user);
    const body = await request.json();

    const {
      businessName,
      serviceCategories,
      primaryLocation,
      serviceDescription,
      pricingStructure,
      priceRange,
      workingDays,
      phone,
      website,
      profilePhotoUrl,
      coverImageUrl,
      galleryImageUrls,
      videoUrls,
      documentUrls,
    } = body;

    console.log('Received onboarding data:', {
      businessName,
      serviceDescriptionLength: serviceDescription?.length || 0,
      hasProfilePhoto: !!profilePhotoUrl,
      hasCoverImage: !!coverImageUrl,
      galleryCount: galleryImageUrls?.length || 0,
      videoCount: videoUrls?.length || 0,
      documentCount: documentUrls?.length || 0,
    });

    // ===== VALIDATION =====
    if (!businessName || businessName.trim().length < 3) {
      return NextResponse.json(
        { error: 'Business name is required (min 3 characters)' },
        { status: 400 }
      );
    }

    // Service description is now optional
    // if (!serviceDescription || serviceDescription.trim().length < 50) {
    //   return NextResponse.json(
    //     { 
    //       error: 'Service description must be at least 50 characters',
    //       receivedLength: serviceDescription?.length || 0 
    //     },
    //     { status: 400 }
    //   );
    // }

    //  ENFORCE UPLOAD CAPS
    if (galleryImageUrls && galleryImageUrls.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 gallery images allowed' },
        { status: 400 }
      );
    }

    if (videoUrls && videoUrls.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 videos allowed' },
        { status: 400 }
      );
    }

    if (documentUrls && documentUrls.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 documents allowed' },
        { status: 400 }
      );
    }

    const locationParts = primaryLocation?.split(',').map((p: string) => p.trim()) || [];
    const city = locationParts[0] || null;
    const state = locationParts[1] || null;

    // ===== CREATE OR UPDATE VENDOR PROFILE =====
    const [existingProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, userId))
      .limit(1);

    let vendorProfileId: number;

    const profileData = {
      businessName: businessName.trim(),
      description: serviceDescription.trim() + (workingDays && workingDays.length > 0 ? `\n\nWorking Days: ${workingDays.join(', ')}` : ''),
      city,
      state,
      phone: phone || null,
      website: website || null,
      profileImage: profilePhotoUrl || null,
      coverImage: coverImageUrl || null,
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
          userId: userId,
          ...profileData,
          isVerified: false,
        })
        .returning();
      vendorProfileId = newProfile.id;
      console.log('Created new vendor profile:', vendorProfileId);
    }

    // ===== SAVE SERVICES =====
    if (serviceCategories && serviceCategories.length > 0) {
      await db
        .delete(vendorServices)
        .where(eq(vendorServices.vendorId, vendorProfileId));

      const price = parsePriceRange(priceRange);
      const services = serviceCategories.map((name: string) => ({
        vendorId: vendorProfileId,
        name,
        description: serviceDescription || null,
        price,
        duration: null,
        isActive: true,
      }));

      await db.insert(vendorServices).values(services);
      console.log('Saved services:', services.length);
    }

    // ===== SAVE AVAILABILITY =====
    const activeDays = mapWorkingDaysToActiveDays(workingDays);
    const [existingAvailability] = await db
      .select()
      .from(vendorAvailability)
      .where(eq(vendorAvailability.vendorId, vendorProfileId))
      .limit(1);

    if (existingAvailability) {
      await db
        .update(vendorAvailability)
        .set({
          activeDays,
          workingHours: { start: '09:00', end: '17:00' },
          sameDayService: false,
          maxEvents: 5,
          updatedAt: new Date(),
        })
        .where(eq(vendorAvailability.vendorId, vendorProfileId));
    } else {
      await db.insert(vendorAvailability).values({
        vendorId: vendorProfileId,
        activeDays,
        workingHours: { start: '09:00', end: '17:00' },
        sameDayService: false,
        maxEvents: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // ===== SAVE PACKAGES =====
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

    // ===== SAVE PORTFOLIO (GALLERY IMAGES) =====
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

      //  Link gallery uploads to vendor profile
      await db
        .update(userUploads)
        .set({ vendorId: vendorProfileId })
        .where(
          and(
            eq(userUploads.userId, userId),
            eq(userUploads.uploadType, 'gallery')
          )
        );
    }

    // ===== SAVE VIDEOS =====
    if (videoUrls && videoUrls.length > 0) {
      await db
        .delete(vendorVideos)
        .where(eq(vendorVideos.vendorId, vendorProfileId));

      const videoItems = videoUrls.map((url: string, index: number) => ({
        vendorId: vendorProfileId,
        videoUrl: url,
        title: `Video ${index + 1}`,
        displayOrder: index,
      }));

      await db.insert(vendorVideos).values(videoItems);
      console.log('Saved videos:', videoItems.length);

      //  Link video uploads to vendor profile
      await db
        .update(userUploads)
        .set({ vendorId: vendorProfileId })
        .where(
          and(
            eq(userUploads.userId, userId),
            eq(userUploads.uploadType, 'video')
          )
        );
    }

    // ===== SAVE CANCELLATION POLICY =====
    const defaultPolicy =
      'Standard cancellation policy: Full refund if cancelled 7 days before event. 50% refund if cancelled 3-7 days before. No refund if cancelled less than 3 days before event.';

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

    // ===== SAVE VERIFICATION DOCUMENTS =====
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

      //  Link document uploads to vendor profile
      await db
        .update(userUploads)
        .set({ vendorId: vendorProfileId })
        .where(
          and(
            eq(userUploads.userId, userId),
            eq(userUploads.uploadType, 'document')
          )
        );
    }

    // ===== UPDATE USER ACCOUNT TYPE AND SYNC IMAGES =====
    const userUpdate: {
      accountType?: 'VENDOR' | 'CUSTOMER' | 'ADMIN' | 'PLANNER';
      image?: string;
    } = {};

    if (user.accountType === 'CUSTOMER') {
      userUpdate.accountType = 'VENDOR';
    }

    if (profilePhotoUrl) {
      userUpdate.image = profilePhotoUrl;

      //  Link profile photo to vendor
      await db
        .update(userUploads)
        .set({ vendorId: vendorProfileId })
        .where(
          and(
            eq(userUploads.userId, userId),
            eq(userUploads.uploadType, 'profile')
          )
        );
    }

    // ✅ Link cover image to vendor
    if (coverImageUrl) {
      await db
        .update(userUploads)
        .set({ vendorId: vendorProfileId })
        .where(
          and(
            eq(userUploads.userId, userId),
            eq(userUploads.uploadType, 'cover')
          )
        );
    }

    if (Object.keys(userUpdate).length > 0) {
      await db.update(users).set(userUpdate).where(eq(users.id, userId));
      console.log('Updated user profile:', userUpdate);
    }

    // ===== MARK ONBOARDING AS COMPLETE =====
    const [progress] = await db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.userId, userId))
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
        userId: userId,
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
