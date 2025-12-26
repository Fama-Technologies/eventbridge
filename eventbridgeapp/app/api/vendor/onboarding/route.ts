// app/api/vendor/onboarding/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import {
  users,
  sessions,
  vendorProfiles,
  onboardingProgress,
  vendorPackages,
  vendorVideos,
  vendorPortfolio,
  cancellationPolicies,
  vendorDiscounts,
  verificationDocuments,
} from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

// ============================================
// HELPER: Get Current User
// ============================================
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

// ============================================
// HELPER: Check if user can be vendor
// ============================================
function canUserBeVendor(user: any): { allowed: boolean; reason?: string } {
  if (user.accountType === 'PLANNER') {
    return {
      allowed: false,
      reason: 'Event planners cannot register as vendors. Please use a different email address.',
    };
  }
  return { allowed: true };
}

// ============================================
// GET - Retrieve Onboarding Progress
// ============================================
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can be a vendor
    const vendorCheck = canUserBeVendor(user);
    if (!vendorCheck.allowed) {
      return NextResponse.json({ error: vendorCheck.reason }, { status: 403 });
    }

    // Get onboarding progress
    const [progress] = await db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.userId, user.id))
      .limit(1);

    if (!progress) {
      // Create new progress record
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
    console.error('Get onboarding progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Save Step Progress or Complete
// ============================================
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can be a vendor
    const vendorCheck = canUserBeVendor(user);
    if (!vendorCheck.allowed) {
      return NextResponse.json({ error: vendorCheck.reason }, { status: 403 });
    }

    const body = await request.json();
    const { step, data, action } = body;

    console.log(`Onboarding action: ${action}, Step: ${step}`);

    // Get or create progress
    let [progress] = await db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.userId, user.id))
      .limit(1);

    if (!progress) {
      [progress] = await db
        .insert(onboardingProgress)
        .values({
          userId: user.id,
          currentStep: 1,
          completedSteps: [],
          formData: {},
        })
        .returning();
    }

    // ============================================
    // ACTION: Save and Continue
    // ============================================
    if (action === 'save-and-continue') {
      const updatedFormData = {
        ...progress.formData,
        [`step${step}`]: data,
      };

      const completedSteps = [...(progress.completedSteps || [])];
      if (!completedSteps.includes(step)) {
        completedSteps.push(step);
      }

      await db
        .update(onboardingProgress)
        .set({
          currentStep: step + 1,
          completedSteps,
          formData: updatedFormData,
          updatedAt: new Date(),
        })
        .where(eq(onboardingProgress.id, progress.id));

      return NextResponse.json({
        success: true,
        message: 'Progress saved',
        nextStep: step + 1,
      });
    }

    // ============================================
    // ACTION: Save and Go Back
    // ============================================
    if (action === 'save-and-back') {
      const updatedFormData = {
        ...progress.formData,
        [`step${step}`]: data,
      };

      await db
        .update(onboardingProgress)
        .set({
          currentStep: Math.max(1, step - 1),
          formData: updatedFormData,
          updatedAt: new Date(),
        })
        .where(eq(onboardingProgress.id, progress.id));

      return NextResponse.json({
        success: true,
        message: 'Going back',
        nextStep: Math.max(1, step - 1),
      });
    }

    // ============================================
    // ACTION: Save Draft (No Navigation)
    // ============================================
    if (action === 'save-draft') {
      const updatedFormData = {
        ...progress.formData,
        [`step${step}`]: data,
      };

      await db
        .update(onboardingProgress)
        .set({
          formData: updatedFormData,
          updatedAt: new Date(),
        })
        .where(eq(onboardingProgress.id, progress.id));

      return NextResponse.json({
        success: true,
        message: 'Draft saved',
      });
    }

    // ============================================
    // ACTION: Complete Onboarding
    // ============================================
    if (action === 'complete') {
      return await completeOnboarding(user, progress);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    );
  }
}

// ============================================
// COMPLETE ONBOARDING - Create All Records
// ============================================
async function completeOnboarding(user: any, progress: any) {
  try {
    const formData = progress.formData;

    console.log('Completing vendor onboarding for user:', user.id);

    // Extract data from all steps
    const businessInfo = formData.step1 || {};
    const packages = formData.step2?.packages || [];
    const media = formData.step3 || {};
    const cancellationPolicy = formData.step4 || {};
    const discounts = formData.step5?.discounts || [];
    const verificationDocs = formData.step6?.documents || [];

    // Validate required fields
    if (!businessInfo.businessName) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    if (!businessInfo.serviceDescription) {
      return NextResponse.json(
        { error: 'Service description is required' },
        { status: 400 }
      );
    }

    if (!cancellationPolicy.policyText || cancellationPolicy.policyText.length < 50) {
      return NextResponse.json(
        { error: 'Cancellation policy must be at least 50 characters' },
        { status: 400 }
      );
    }

    // Validate media limits (max 10 images, 10 videos)
    const imageCount = media.images?.length || 0;
    const videoCount = media.videos?.length || 0;

    if (imageCount > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 images allowed' },
        { status: 400 }
      );
    }

    if (videoCount > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 videos allowed' },
        { status: 400 }
      );
    }

    // Extract location
    const locationParts = businessInfo.primaryLocation?.split(',').map((p: string) => p.trim()) || [];
    const city = locationParts[0] || null;
    const state = locationParts[1] || null;

    // ============================================
    // Create/Update Vendor Profile
    // ============================================
    const [existingProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    let vendorProfileId: number;

    if (existingProfile) {
      await db
        .update(vendorProfiles)
        .set({
          businessName: businessInfo.businessName,
          description: businessInfo.serviceDescription,
          city,
          state,
          phone: businessInfo.phone,
          website: businessInfo.website,
          profileImage: businessInfo.profilePhoto,
          verificationStatus: 'under_review',
          verificationSubmittedAt: new Date(),
          canAccessDashboard: false,
          updatedAt: new Date(),
        })
        .where(eq(vendorProfiles.id, existingProfile.id));

      vendorProfileId = existingProfile.id;
    } else {
      const [newProfile] = await db
        .insert(vendorProfiles)
        .values({
          userId: user.id,
          businessName: businessInfo.businessName,
          description: businessInfo.serviceDescription,
          city,
          state,
          phone: businessInfo.phone,
          website: businessInfo.website,
          profileImage: businessInfo.profilePhoto,
          verificationStatus: 'under_review',
          verificationSubmittedAt: new Date(),
          canAccessDashboard: false,
          isVerified: false,
        })
        .returning();

      vendorProfileId = newProfile.id;
    }

    // ============================================
    // Save Packages
    // ============================================
    if (packages.length > 0) {
      await db
        .delete(vendorPackages)
        .where(eq(vendorPackages.vendorId, vendorProfileId));

      await db.insert(vendorPackages).values(
        packages.map((pkg: any, index: number) => ({
          vendorId: vendorProfileId,
          name: pkg.name,
          description: pkg.description,
          price: Math.round(pkg.price * 100), // Convert to cents
          duration: pkg.duration,
          features: pkg.features,
          isPopular: pkg.isPopular || false,
          displayOrder: index,
        }))
      );
    }

    // ============================================
    // Save Portfolio Images
    // ============================================
    if (media.images && media.images.length > 0) {
      await db
        .delete(vendorPortfolio)
        .where(eq(vendorPortfolio.vendorId, vendorProfileId));

      await db.insert(vendorPortfolio).values(
        media.images.map((image: any, index: number) => ({
          vendorId: vendorProfileId,
          imageUrl: image.url,
          title: image.title || `Portfolio Image ${index + 1}`,
          width: image.width || null,
          height: image.height || null,
          fileSize: image.fileSize || null,
          quality: image.quality || 'medium',
          displayOrder: index,
        }))
      );
    }

    // ============================================
    // Save Videos
    // ============================================
    if (media.videos && media.videos.length > 0) {
      await db
        .delete(vendorVideos)
        .where(eq(vendorVideos.vendorId, vendorProfileId));

      await db.insert(vendorVideos).values(
        media.videos.map((video: any, index: number) => ({
          vendorId: vendorProfileId,
          videoUrl: video.url,
          thumbnailUrl: video.thumbnail,
          title: video.title,
          description: video.description,
          duration: video.duration,
          fileSize: video.fileSize,
          width: video.width || null,
          height: video.height || null,
          quality: video.quality || 'medium',
          displayOrder: index,
        }))
      );
    }

    // ============================================
    // Save Cancellation Policy
    // ============================================
    await db
      .delete(cancellationPolicies)
      .where(eq(cancellationPolicies.vendorId, vendorProfileId));

    await db.insert(cancellationPolicies).values({
      vendorId: vendorProfileId,
      policyText: cancellationPolicy.policyText,
    });

    // ============================================
    // Save Discounts
    // ============================================
    if (discounts.length > 0) {
      await db
        .delete(vendorDiscounts)
        .where(eq(vendorDiscounts.vendorId, vendorProfileId));

      await db.insert(vendorDiscounts).values(
        discounts.map((discount: any) => ({
          vendorId: vendorProfileId,
          code: discount.code || null,
          name: discount.name,
          discountType: discount.discountType,
          discountValue: discount.discountValue,
          validFrom: new Date(discount.validFrom),
          validUntil: new Date(discount.validUntil),
          maxUses: discount.maxUses || null,
          minimumBookingAmount: discount.minimumBookingAmount || null,
        }))
      );
    }

    // ============================================
    // Save Verification Documents
    // ============================================
    if (verificationDocs.length > 0) {
      await db
        .delete(verificationDocuments)
        .where(eq(verificationDocuments.vendorId, vendorProfileId));

      await db.insert(verificationDocuments).values(
        verificationDocs.map((doc: any) => ({
          vendorId: vendorProfileId,
          documentType: doc.type,
          documentUrl: doc.url,
          documentName: doc.name,
          fileSize: doc.fileSize,
        }))
      );
    }

    // ============================================
    // Update User Account Type
    // ============================================
    if (user.accountType === 'CUSTOMER') {
      await db
        .update(users)
        .set({ accountType: 'VENDOR' })
        .where(eq(users.id, user.id));
    }

    // ============================================
    // Mark Onboarding Complete
    // ============================================
    await db
      .update(onboardingProgress)
      .set({
        isComplete: true,
        updatedAt: new Date(),
      })
      .where(eq(onboardingProgress.id, progress.id));

    console.log('Vendor onboarding completed successfully');

    // TODO: Send email notification about verification pending

    return NextResponse.json({
      success: true,
      message: 'Application submitted for verification. You will be notified once reviewed.',
      verificationStatus: 'under_review',
      vendorProfileId,
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    throw error;
  }
}