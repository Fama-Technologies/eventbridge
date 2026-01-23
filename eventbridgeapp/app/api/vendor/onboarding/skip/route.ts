import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';
import {
  users,
  vendorProfiles,
  onboardingProgress,
  vendorServices,
  vendorAvailability,
  cancellationPolicies,
  userUploads,
} from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.error('No session found');
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Please log in again' 
      }, { status: 401 });
    }

    const userId = Number(session.user.id);
    
    if (isNaN(userId)) {
      console.error('Invalid user ID from session:', session.user.id);
      return NextResponse.json({ 
        success: false,
        error: 'Invalid user ID' 
      }, { status: 400 });
    }

    console.log('Processing skip onboarding for user:', userId);

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      console.error('User not found in database:', userId);
      return NextResponse.json({ 
        success: false,
        error: 'User not found' 
      }, { status: 404 });
    }

    console.log('Found user:', { 
      id: user.id, 
      email: user.email, 
      accountType: user.accountType 
    });

    // Get existing onboarding progress
    const [progress] = await db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.userId, userId))
      .limit(1);

    console.log('Found progress:', progress);

    // Use form data from progress or create minimal defaults
    let formData: any = {};
    if (progress?.formData && typeof progress.formData === 'object') {
      formData = progress.formData;
      console.log('Using progress form data:', formData);
    }

    // ===== SET DEFAULTS FOR MISSING DATA =====
    const businessName = formData.businessName?.trim() || 
                       user.firstName ? `${user.firstName}'s Business` : 
                       'My Business';

    const serviceDescription = formData.serviceDescription?.trim() || 
                             'Professional vendor services. Complete profile details coming soon.';

    const serviceCategories = Array.isArray(formData.serviceCategories) && formData.serviceCategories.length > 0
                            ? formData.serviceCategories
                            : ['General Services'];

    const primaryLocation = formData.primaryLocation || 'Nairobi, Kenya';
    const locationParts = primaryLocation.split(',').map((p: string) => p.trim());
    const city = locationParts[0] || null;
    const state = locationParts[1] || null;

    console.log('Processed data:', {
      businessName,
      serviceDescriptionLength: serviceDescription.length,
      serviceCategories,
      city,
      state
    });

    // ===== CREATE OR UPDATE VENDOR PROFILE (MINIMAL) =====
    const [existingProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, userId))
      .limit(1);

    let vendorProfileId: number;

    const profileData = {
      businessName: businessName,
      description: serviceDescription,
      city,
      state,
      phone: formData.phone || user.phone || null,
      website: formData.website || null,
      profileImage: formData.profilePhotoUrl || user.image || null,
      coverImage: formData.coverImageUrl || null,
      isVerified: false, // Not verified since we skipped
      verificationStatus: 'not_submitted',
      verificationSubmittedAt: null,
      verificationReviewedAt: null,
      canAccessDashboard: true,
      createdAt: existingProfile ? undefined : new Date(),
      updatedAt: new Date(),
    };

    if (existingProfile) {
      console.log('Updating existing vendor profile:', existingProfile.id);
      await db
        .update(vendorProfiles)
        .set(profileData)
        .where(eq(vendorProfiles.id, existingProfile.id));
      vendorProfileId = existingProfile.id;
    } else {
      console.log('Creating new vendor profile');
      const [newProfile] = await db
        .insert(vendorProfiles)
        .values({
          userId: userId,
          ...profileData,
        })
        .returning();
      vendorProfileId = newProfile.id;
      console.log('Created vendor profile with ID:', vendorProfileId);
    }

    // ===== SAVE BASIC SERVICES =====
    console.log('Saving services:', serviceCategories);
    await db
      .delete(vendorServices)
      .where(eq(vendorServices.vendorId, vendorProfileId));

    const services = serviceCategories.map((name: string, index: number) => ({
      vendorId: vendorProfileId,
      name: name || 'General Service',
      description: serviceDescription,
      price: 0,
      duration: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      displayOrder: index,
    }));

    if (services.length > 0) {
      await db.insert(vendorServices).values(services);
      console.log('Inserted services:', services.length);
    }

    // ===== SAVE BASIC AVAILABILITY =====
    console.log('Saving availability');
    const activeDays = [0, 1, 2, 3, 4]; // Mon-Fri by default
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

    // ===== SAVE BASIC CANCELLATION POLICY =====
    console.log('Saving cancellation policy');
    const [existingPolicy] = await db
      .select()
      .from(cancellationPolicies)
      .where(eq(cancellationPolicies.vendorId, vendorProfileId))
      .limit(1);

    const defaultPolicy = 'Standard cancellation policy will be added later.';

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
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // ===== UPDATE USER ACCOUNT TYPE =====
    console.log('Updating user account type');
    if (user.accountType === 'CUSTOMER') {
      await db.update(users).set({ 
        accountType: 'VENDOR',
        updatedAt: new Date() 
      }).where(eq(users.id, userId));
      console.log('Updated user account type to VENDOR');
    }

    // ===== LINK UPLOADS TO VENDOR PROFILE =====
    console.log('Linking uploads to vendor profile');
    const uploadTypes = ['profile', 'cover', 'gallery', 'video', 'document'] as const;
    
    for (const uploadType of uploadTypes) {
      try {
        await db
          .update(userUploads)
          .set({ 
            vendorId: vendorProfileId,
            updatedAt: new Date()
          })
          .where(
            eq(userUploads.userId, userId) &&
            eq(userUploads.uploadType, uploadType)
          );
        console.log(`Linked ${uploadType} uploads`);
      } catch (uploadError) {
        console.warn(`Failed to link ${uploadType} uploads:`, uploadError);
      }
    }

    // ===== MARK ONBOARDING AS COMPLETE =====
    console.log('Marking onboarding as complete');
    if (progress) {
      await db
        .update(onboardingProgress)
        .set({
          isComplete: true,
          currentStep: 4,
          completedSteps: [1, 2, 3, 4],
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
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log('Skip onboarding completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Vendor onboarding completed successfully! You can add verification documents later from your dashboard.',
      verificationStatus: 'not_submitted',
      vendorProfileId,
      redirectTo: '/vendor',
    });

  } catch (error) {
    console.error('Skip onboarding error:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to complete onboarding',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}