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
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

// ============================================
// HELPER: Get Current User
// ============================================
async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;
    const sessionToken = cookieStore.get('session')?.value;

    console.log('🔍 Checking auth - has authToken:', !!authToken, 'has sessionToken:', !!sessionToken);

    if (authToken) {
      try {
        const payload = await verifyToken(authToken);
        if (payload && payload.userId) {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, payload.userId as number))
            .limit(1);
          console.log('✅ User found via authToken:', user?.id);
          return user;
        }
      } catch (error) {
        console.error('❌ Token verification failed:', error);
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
        console.log('✅ User found via sessionToken:', user?.id);
        return user;
      }
    }

    console.log('❌ No valid auth found');
    return null;
  } catch (error) {
    console.error('❌ getCurrentUser error:', error);
    return null;
  }
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
    console.log('📥 GET onboarding progress');
    
    const user = await getCurrentUser();

    if (!user) {
      console.log('❌ Unauthorized - no user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('👤 User:', user.id, user.email, user.accountType);

    // Check if user can be a vendor
    const vendorCheck = canUserBeVendor(user);
    if (!vendorCheck.allowed) {
      console.log('❌ User cannot be vendor:', vendorCheck.reason);
      return NextResponse.json({ error: vendorCheck.reason }, { status: 403 });
    }

    // Get onboarding progress
    const [progress] = await db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.userId, user.id))
      .limit(1);

    if (!progress) {
      console.log('📝 Creating new progress record');
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

    console.log('✅ Progress found:', progress.currentStep, 'Complete:', progress.isComplete);

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error('❌ GET onboarding progress error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : 'No stack'
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Save Step Progress or Complete
// ============================================
export async function POST(request: NextRequest) {
  try {
    console.log('📥 POST onboarding request');
    
    const user = await getCurrentUser();

    if (!user) {
      console.log('❌ Unauthorized - no user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('👤 User:', user.id, user.email, user.accountType);

    // Check if user can be a vendor
    const vendorCheck = canUserBeVendor(user);
    if (!vendorCheck.allowed) {
      console.log('❌ User cannot be vendor:', vendorCheck.reason);
      return NextResponse.json({ error: vendorCheck.reason }, { status: 403 });
    }

    const body = await request.json();
    const { step, data, action } = body;

    console.log(`📝 Onboarding action: ${action}, Step: ${step}`);
    console.log('📦 Data keys:', data ? Object.keys(data) : 'none');

    // Get or create progress
    let [progress] = await db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.userId, user.id))
      .limit(1);

    if (!progress) {
      console.log('📝 Creating new progress record');
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
      console.log('💾 Save and continue');
      
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

      console.log('✅ Progress saved, moving to step', step + 1);

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
      console.log('⬅️ Save and go back');
      
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

      console.log('✅ Going back to step', Math.max(1, step - 1));

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
      console.log('💾 Save draft');
      
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

      console.log('✅ Draft saved');

      return NextResponse.json({
        success: true,
        message: 'Draft saved',
      });
    }

    // ============================================
    // ACTION: Complete Onboarding
    // ============================================
    if (action === 'complete') {
      console.log('🎯 Completing onboarding');
      return await completeOnboarding(user, progress);
    }

    console.log('❌ Invalid action:', action);
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ POST Onboarding error:', error);
    console.error('❌ Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { 
        error: 'Failed to save progress',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

// ============================================
// COMPLETE ONBOARDING - Create All Records
// ============================================
async function completeOnboarding(user: any, progress: any) {
  try {
    console.log('🎯 Starting completeOnboarding for user:', user.id);
    
    const formData = progress.formData;
    console.log('📦 FormData structure:', Object.keys(formData));

    // Extract data from all steps
    const businessInfo = formData.step1 || {};
    const packages = formData.step2?.packages || [];
    const media = formData.step3 || {};
    const cancellationPolicy = formData.step4 || {};
    const discounts = formData.step5?.discounts || [];
    const verificationDocs = formData.step6?.documents || [];

    console.log('📊 Data counts:', {
      packages: packages.length,
      images: media.images?.length || 0,
      videos: media.videos?.length || 0,
      discounts: discounts.length,
      documents: verificationDocs.length
    });

    // ============================================
    // VALIDATION
    // ============================================
    console.log('🔍 Validating data...');
    
    if (!businessInfo.businessName) {
      console.log('❌ Missing business name');
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    if (!businessInfo.serviceDescription) {
      console.log('❌ Missing service description');
      return NextResponse.json(
        { error: 'Service description is required' },
        { status: 400 }
      );
    }

    if (!cancellationPolicy.policyText || cancellationPolicy.policyText.length < 50) {
      console.log('❌ Invalid cancellation policy');
      return NextResponse.json(
        { error: 'Cancellation policy must be at least 50 characters' },
        { status: 400 }
      );
    }

    // Validate media limits
    const imageCount = media.images?.length || 0;
    const videoCount = media.videos?.length || 0;

    if (imageCount > 10) {
      console.log('❌ Too many images:', imageCount);
      return NextResponse.json(
        { error: 'Maximum 10 images allowed' },
        { status: 400 }
      );
    }

    if (videoCount > 10) {
      console.log('❌ Too many videos:', videoCount);
      return NextResponse.json(
        { error: 'Maximum 10 videos allowed' },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed');

    // Extract location
    const locationParts = businessInfo.primaryLocation?.split(',').map((p: string) => p.trim()) || [];
    const city = locationParts[0] || null;
    const state = locationParts[1] || null;

    // ============================================
    // Create/Update Vendor Profile
    // ============================================
    console.log('💼 Creating/updating vendor profile...');
    
    const [existingProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    let vendorProfileId: number;

    const profileData = {
      businessName: businessInfo.businessName,
      description: businessInfo.serviceDescription,
      city,
      state,
      phone: businessInfo.phone || null,
      website: businessInfo.website || null,
      address: businessInfo.address || null,
      zipCode: businessInfo.zipCode || null,
      serviceRadius: businessInfo.serviceRadius || null,
      yearsExperience: businessInfo.yearsExperience || null,
      profileImage: businessInfo.profilePhoto || null,
      coverImage: businessInfo.coverPhoto || null,
      verificationStatus: 'under_review',
      verificationSubmittedAt: new Date(),
      canAccessDashboard: false,
      updatedAt: new Date(),
    };

    if (existingProfile) {
      console.log('📝 Updating existing profile:', existingProfile.id);
      await db
        .update(vendorProfiles)
        .set(profileData)
        .where(eq(vendorProfiles.id, existingProfile.id));

      vendorProfileId = existingProfile.id;
    } else {
      console.log('📝 Creating new profile');
      const [newProfile] = await db
        .insert(vendorProfiles)
        .values({
          userId: user.id,
          ...profileData,
          isVerified: false,
        })
        .returning();

      vendorProfileId = newProfile.id;
    }

    console.log('✅ Vendor profile saved:', vendorProfileId);

    // ============================================
    // Save Packages
    // ============================================
    if (packages.length > 0) {
      console.log('📦 Saving packages...');
      
      await db
        .delete(vendorPackages)
        .where(eq(vendorPackages.vendorId, vendorProfileId));

      await db.insert(vendorPackages).values(
        packages.map((pkg: any, index: number) => ({
          vendorId: vendorProfileId,
          name: pkg.name,
          description: pkg.description || null,
          price: Math.round(parseFloat(pkg.price) * 100),
          duration: pkg.duration || null,
          features: pkg.features || [],
          isPopular: pkg.isPopular || false,
          isActive: true,
          displayOrder: index,
        }))
      );
      
      console.log(`✅ Saved ${packages.length} packages`);
    }

    // ============================================
    // Save Portfolio Images
    // ============================================
    if (media.images && media.images.length > 0) {
      console.log('🖼️ Saving portfolio images...');
      
      await db
        .delete(vendorPortfolio)
        .where(eq(vendorPortfolio.vendorId, vendorProfileId));

      await db.insert(vendorPortfolio).values(
        media.images.map((image: any, index: number) => ({
          vendorId: vendorProfileId,
          imageUrl: image.url,
          title: image.title || null,
          description: image.description || null,
          category: image.category || null,
          width: image.width || null,
          height: image.height || null,
          fileSize: image.fileSize || null,
          quality: image.quality || 'medium',
          displayOrder: index,
        }))
      );
      
      console.log(`✅ Saved ${media.images.length} portfolio images`);
    }

    // ============================================
    // Save Videos
    // ============================================
    if (media.videos && media.videos.length > 0) {
      console.log('🎥 Saving videos...');
      
      await db
        .delete(vendorVideos)
        .where(eq(vendorVideos.vendorId, vendorProfileId));

      await db.insert(vendorVideos).values(
        media.videos.map((video: any, index: number) => ({
          vendorId: vendorProfileId,
          videoUrl: video.url,
          thumbnailUrl: video.thumbnail || null,
          title: video.title || null,
          description: video.description || null,
          duration: video.duration || null,
          fileSize: video.fileSize || null,
          width: video.width || null,
          height: video.height || null,
          quality: video.quality || 'medium',
          displayOrder: index,
        }))
      );
      
      console.log(`✅ Saved ${media.videos.length} videos`);
    }

    // ============================================
    // Save Cancellation Policy
    // ============================================
    console.log('📜 Saving cancellation policy...');
    
    const [existingPolicy] = await db
      .select()
      .from(cancellationPolicies)
      .where(eq(cancellationPolicies.vendorId, vendorProfileId))
      .limit(1);

    if (existingPolicy) {
      await db
        .update(cancellationPolicies)
        .set({
          policyText: cancellationPolicy.policyText,
          updatedAt: new Date(),
        })
        .where(eq(cancellationPolicies.vendorId, vendorProfileId));
    } else {
      await db.insert(cancellationPolicies).values({
        vendorId: vendorProfileId,
        policyText: cancellationPolicy.policyText,
      });
    }
    
    console.log('✅ Saved cancellation policy');

    // ============================================
    // Save Discounts
    // ============================================
    if (discounts.length > 0) {
      console.log('🎟️ Saving discounts...');
      
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
          currentUses: 0,
          minimumBookingAmount: discount.minimumBookingAmount || null,
          isActive: true,
        }))
      );
      
      console.log(`✅ Saved ${discounts.length} discounts`);
    }

    // ============================================
    // Save Verification Documents
    // ============================================
    if (verificationDocs.length > 0) {
      console.log('📄 Saving verification documents...');
      
      await db
        .delete(verificationDocuments)
        .where(eq(verificationDocuments.vendorId, vendorProfileId));

      await db.insert(verificationDocuments).values(
        verificationDocs.map((doc: any) => ({
          vendorId: vendorProfileId,
          documentType: doc.type,
          documentUrl: doc.url,
          documentName: doc.name,
          fileSize: doc.fileSize || null,
          status: 'pending',
        }))
      );
      
      console.log(`✅ Saved ${verificationDocs.length} verification documents`);
    }

    // ============================================
    // Update User Account Type (if needed)
    // ============================================
    if (user.accountType === 'CUSTOMER') {
      console.log('👤 Updating user account type to VENDOR...');
      await db
        .update(users)
        .set({ accountType: 'VENDOR' })
        .where(eq(users.id, user.id));
      console.log('✅ Updated user account type to VENDOR');
    }

    // ============================================
    // Mark Onboarding Complete
    // ============================================
    console.log('✅ Marking onboarding as complete...');
    
    await db
      .update(onboardingProgress)
      .set({
        isComplete: true,
        updatedAt: new Date(),
      })
      .where(eq(onboardingProgress.id, progress.id));

    console.log('🎉 Vendor onboarding completed successfully!');

    // TODO: Send email notification about verification pending

    return NextResponse.json({
      success: true,
      message: 'Application submitted for verification. You will be notified once reviewed.',
      verificationStatus: 'under_review',
      vendorProfileId,
    });
  } catch (error) {
    console.error('❌ Complete onboarding error:', error);
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : 'No stack'
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to complete onboarding', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}