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

    console.log(' Checking auth - has authToken:', !!authToken, 'has sessionToken:', !!sessionToken);

    if (authToken) {
      try {
        const payload = await verifyToken(authToken);
        if (payload && payload.userId) {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, payload.userId as number))
            .limit(1);
          console.log('User found via authToken:', user?.id);
          return user;
        }
      } catch (error) {
        console.error(' Token verification failed:', error);
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
        console.log(' User found via sessionToken:', user?.id);
        return user;
      }
    }

    console.log(' No valid auth found');
    return null;
  } catch (error) {
    console.error(' getCurrentUser error:', error);
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
    console.log(' GET onboarding progress');
    
    const user = await getCurrentUser();

    if (!user) {
      console.log('Unauthorized - no user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(' User:', user.id, user.email, user.accountType);

    // Check if user can be a vendor
    const vendorCheck = canUserBeVendor(user);
    if (!vendorCheck.allowed) {
      console.log(' User cannot be vendor:', vendorCheck.reason);
      return NextResponse.json({ error: vendorCheck.reason }, { status: 403 });
    }

    // Get onboarding progress
    const [progress] = await db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.userId, user.id))
      .limit(1);

    if (!progress) {
      console.log(' Creating new progress record');
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

    console.log(' Progress found:', progress.currentStep, 'Complete:', progress.isComplete);

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error(' GET onboarding progress error:', error);
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
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(' POST ONBOARDING REQUEST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const user = await getCurrentUser();

    if (!user) {
      console.log(' Unauthorized - no user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(' User authenticated:', {
      id: user.id,
      email: user.email,
      accountType: user.accountType,
    });

    // Check if user can be a vendor
    const vendorCheck = canUserBeVendor(user);
    if (!vendorCheck.allowed) {
      console.log(' User cannot be vendor:', vendorCheck.reason);
      return NextResponse.json({ error: vendorCheck.reason }, { status: 403 });
    }

    const body = await request.json();
    const { step, data, action } = body;

    console.log(' Request Details:');
    console.log('  - Action:', action);
    console.log('  - Step:', step);
    console.log('  - Data present:', !!data);
    console.log('  - Data keys:', data ? Object.keys(data).join(', ') : 'none');
    
    // Log actual data if present
    if (data && Object.keys(data).length > 0) {
      console.log(' DATA RECEIVED:');
      console.log(JSON.stringify(data, null, 2));
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Get or create progress
    let [progress] = await db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.userId, user.id))
      .limit(1);

    if (!progress) {
      console.log(' Creating new progress record');
      [progress] = await db
        .insert(onboardingProgress)
        .values({
          userId: user.id,
          currentStep: 1,
          completedSteps: [],
          formData: {},
        })
        .returning();
      console.log(' Progress created, ID:', progress.id);
    } else {
      console.log(' Progress found, ID:', progress.id);
      console.log('   Current step:', progress.currentStep);
      console.log('   Completed steps:', progress.completedSteps);
      console.log('   Steps saved:', Object.keys(progress.formData || {}).length);
    }

    // ============================================
    // ACTION: Save and Continue
    // ============================================
    if (action === 'save-and-continue') {
      console.log('');
      console.log('ACTION: Save and Continue');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const updatedFormData = {
        ...progress.formData,
        [`step${step}`]: data,
      };

      console.log('Form Data Update:');
      Object.keys(updatedFormData).forEach(stepKey => {
        const stepData = updatedFormData[stepKey];
        const keys = stepData && typeof stepData === 'object' ? Object.keys(stepData) : [];
        console.log(`  ${stepKey}: ${keys.length} fields (${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''})`);
      });

      const completedSteps = [...(progress.completedSteps || [])];
      if (!completedSteps.includes(step)) {
        completedSteps.push(step);
        console.log('Marked step', step, 'as completed');
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

      console.log('Progress saved to database');
      console.log('   Next step:', step + 1);
      console.log('   Total completed:', completedSteps.length);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');

      return NextResponse.json({
        success: true,
        message: 'Progress saved',
        nextStep: step + 1,
        debug: {
          savedStep: step,
          totalStepsCompleted: completedSteps.length,
          dataKeys: Object.keys(data),
        },
      });
    }

    // ============================================
    // ACTION: Save and Go Back
    // ============================================
    if (action === 'save-and-back') {
      console.log('ACTION: Save and go back');
      
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

      console.log('Going back to step', Math.max(1, step - 1));

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
      console.log('ACTION: Save draft (no navigation)');
      
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

      console.log('Draft saved');

      return NextResponse.json({
        success: true,
        message: 'Draft saved',
      });
    }

    // ============================================
    // ACTION: Skip Step
    // ============================================
    if (action === 'skip') {
      console.log('ACTION: Skip step', step);
      
      const updatedFormData = {
        ...progress.formData,
        [`step${step}`]: data || {}, // Save even if empty
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

      console.log('Step skipped, moving to', step + 1);

      return NextResponse.json({
        success: true,
        message: 'Step skipped',
        nextStep: step + 1,
      });
    }

    // ============================================
    // ACTION: Complete / Submit / Finish
    // ============================================
    if (action === 'complete' || action === 'submit-for-review' || action === 'finish') {
      console.log('ACTION: Complete onboarding (action:', action + ')');
      return await completeOnboarding(user, progress);
    }

    console.log('Invalid action:', action);
    return NextResponse.json(
      { 
        error: `Invalid action: ${action}`,
        validActions: ['save-and-continue', 'save-and-back', 'save-draft', 'skip', 'complete', 'submit-for-review', 'finish']
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('POST Onboarding error:', error);
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
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
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('COMPLETING VENDOR ONBOARDING');
    console.log('═══════════════════════════════════════════');
    console.log('User ID:', user.id);
    console.log('User Email:', user.email);
    console.log('Account Type:', user.accountType);
    console.log('═══════════════════════════════════════════');
    console.log('');
    
    const formData = progress.formData;
    console.log('FormData structure:', Object.keys(formData).join(', '));

    // Extract data from all steps
    const businessInfo = formData.step1 || {};
    const packages = formData.step2?.packages || [];
    const media = formData.step3 || {};
    const cancellationPolicy = formData.step4 || {};
    const discounts = formData.step5?.discounts || [];
    const verificationDocs = formData.step6?.documents || [];

    console.log('');
    console.log('DATA SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Step 1 - Business Info:');
    console.log('  ✓ Business Name:', businessInfo.businessName || 'MISSING');
    console.log('  ✓ Description:', businessInfo.serviceDescription ? `${businessInfo.serviceDescription.substring(0, 50)}...` : 'MISSING');
    console.log('  ✓ Location:', businessInfo.primaryLocation || 'Not provided');
    console.log('  ✓ Phone:', businessInfo.phone || 'Not provided');
    console.log('  ✓ Website:', businessInfo.website || 'Not provided');
    console.log('  ✓ Profile Photo:', businessInfo.profilePhoto ? 'Provided' : 'Not provided');
    console.log('');
    console.log('Step 2 - Packages:', packages.length, 'package(s)');
    packages.forEach((pkg: any, index: number) => {
      console.log(`  ${index + 1}. ${pkg.name} - $${pkg.price}`);
    });
    console.log('');
    console.log('Step 3 - Media:');
    console.log('  ✓ Images:', media.images?.length || 0);
    console.log('  ✓ Videos:', media.videos?.length || 0);
    console.log('');
    console.log('Step 4 - Cancellation Policy:');
    console.log('  ✓ Length:', cancellationPolicy.policyText?.length || 0, 'characters');
    if (cancellationPolicy.policyText) {
      console.log('  ✓ Text:', cancellationPolicy.policyText.substring(0, 100) + '...');
    } else {
      console.log('  NOT PROVIDED');
    }
    console.log('');
    console.log('Step 5 - Discounts:', discounts.length, 'discount(s)');
    discounts.forEach((disc: any, index: number) => {
      console.log(`  ${index + 1}. ${disc.name} - ${disc.discountValue}${disc.discountType === 'percentage' ? '%' : ' fixed'}`);
    });
    console.log('');
    console.log('Step 6 - Verification Docs:', verificationDocs.length, 'document(s)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // ============================================
    // VALIDATION (Relaxed for testing)
    // ============================================
    console.log('Validating required fields...');
    
    if (!businessInfo.businessName || businessInfo.businessName.trim().length === 0) {
      console.log('VALIDATION FAILED: Business name missing');
      return NextResponse.json(
        { error: 'Business name is required', field: 'businessName' },
        { status: 400 }
      );
    }

    if (!businessInfo.serviceDescription || businessInfo.serviceDescription.trim().length === 0) {
      console.log('VALIDATION FAILED: Service description missing');
      return NextResponse.json(
        { error: 'Service description is required', field: 'serviceDescription' },
        { status: 400 }
      );
    }

    // Make cancellation policy optional (can be added later)
    if (cancellationPolicy.policyText && cancellationPolicy.policyText.length > 0 && cancellationPolicy.policyText.length < 50) {
      console.log('VALIDATION FAILED: Policy too short');
      return NextResponse.json(
        { error: 'Cancellation policy must be at least 50 characters if provided', field: 'policyText' },
        { status: 400 }
      );
    }

    // Validate media limits
    const imageCount = media.images?.length || 0;
    const videoCount = media.videos?.length || 0;

    if (imageCount > 10) {
      console.log('VALIDATION FAILED: Too many images:', imageCount);
      return NextResponse.json(
        { error: `Maximum 10 images allowed. You have ${imageCount}.`, field: 'images' },
        { status: 400 }
      );
    }

    if (videoCount > 10) {
      console.log('VALIDATION FAILED: Too many videos:', videoCount);
      return NextResponse.json(
        { error: `Maximum 10 videos allowed. You have ${videoCount}.`, field: 'videos' },
        { status: 400 }
      );
    }

    console.log('Validation passed');
    console.log('');

    // Extract location
    const locationParts = businessInfo.primaryLocation?.split(',').map((p: string) => p.trim()) || [];
    const city = locationParts[0] || null;
    const state = locationParts[1] || null;

    // ============================================
    // Create/Update Vendor Profile
    // ============================================
    console.log('Saving vendor profile...');
    
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
      console.log('Updating existing profile:', existingProfile.id);
      await db
        .update(vendorProfiles)
        .set(profileData)
        .where(eq(vendorProfiles.id, existingProfile.id));
      vendorProfileId = existingProfile.id;
    } else {
      console.log('Creating new profile');
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

    console.log('Vendor profile saved, ID:', vendorProfileId);

    // ============================================
    // Save Packages
    // ============================================
    if (packages.length > 0) {
      console.log('Saving', packages.length, 'package(s)...');
      
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
      
      console.log(`Saved ${packages.length} packages`);
    } else {
      console.log('No packages to save');
    }

    // ============================================
    // Save Portfolio Images
    // ============================================
    if (media.images && media.images.length > 0) {
      console.log('Saving', media.images.length, 'portfolio image(s)...');
      
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
      
      console.log(`Saved ${media.images.length} portfolio images`);
    } else {
      console.log('No images to save');
    }

    // ============================================
    // Save Videos
    // ============================================
    if (media.videos && media.videos.length > 0) {
      console.log('Saving', media.videos.length, 'video(s)...');
      
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
      
      console.log(`Saved ${media.videos.length} videos`);
    } else {
      console.log('No videos to save');
    }

    // ============================================
    // Save Cancellation Policy (if provided)
    // ============================================
    if (cancellationPolicy.policyText && cancellationPolicy.policyText.trim().length > 0) {
      console.log('Saving cancellation policy...');
      
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
      
      console.log('Saved cancellation policy');
    } else {
      console.log('No cancellation policy provided - skipping');
    }

    // ============================================
    // Save Discounts
    // ============================================
    if (discounts.length > 0) {
      console.log('Saving', discounts.length, 'discount(s)...');
      
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
      
      console.log(`Saved ${discounts.length} discounts`);
    } else {
      console.log('No discounts to save');
    }

    // ============================================
    // Save Verification Documents
    // ============================================
    if (verificationDocs.length > 0) {
      console.log('Saving', verificationDocs.length, 'verification document(s)...');
      
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
      
      console.log(`Saved ${verificationDocs.length} verification documents`);
    } else {
      console.log('No verification documents to save');
    }

    // ============================================
    // Update User Account Type (if needed)
    // ============================================
    if (user.accountType === 'CUSTOMER') {
      console.log('👤 Upgrading user account type from CUSTOMER to VENDOR...');
      await db
        .update(users)
        .set({ accountType: 'VENDOR' })
        .where(eq(users.id, user.id));
      console.log('User upgraded to VENDOR');
    } else {
      console.log('✓ User already has correct account type:', user.accountType);
    }

    // ============================================
    // Mark Onboarding Complete
    // ============================================
    console.log('✓ Marking onboarding as complete...');
    
    await db
      .update(onboardingProgress)
      .set({
        isComplete: true,
        updatedAt: new Date(),
      })
      .where(eq(onboardingProgress.id, progress.id));

    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('ONBOARDING COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════');
    console.log('Vendor Profile ID:', vendorProfileId);
    console.log('Verification Status: under_review');
    console.log('Can Access Dashboard: false (pending approval)');
    console.log('═══════════════════════════════════════════');
    console.log('');

    // TODO: Send email notification about verification pending

    return NextResponse.json({
      success: true,
      message: 'Application submitted for verification. You will be notified once reviewed.',
      verificationStatus: 'under_review',
      vendorProfileId,
    });
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════');
    console.error('❌ ONBOARDING COMPLETION FAILED');
    console.error('═══════════════════════════════════════════');
    console.error('Error type:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:');
      console.error(error.stack);
    }
    console.error('═══════════════════════════════════════════');
    console.error('');
    
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