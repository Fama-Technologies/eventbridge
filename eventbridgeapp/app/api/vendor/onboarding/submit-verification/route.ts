// app/api/vendor/onboarding/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';
import { vendorProfiles, onboardingProgress } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.accountType !== 'VENDOR') {
      return NextResponse.json({ error: 'Only vendors can submit onboarding' }, { status: 403 });
    }

    const body = await req.json();
    const userId = parseInt(session.user.id);

    // Extract all the onboarding data
    const {
      // Profile data
      businessName,
      description,
      phone,
      website,
      address,
      city,
      state,
      zipCode,
      serviceRadius,
      yearsExperience,
      hourlyRate,
      
      // Services data
      serviceDescription,
      pricingStructure,
      priceRange,
      generalAvailability,
      experience,
      serviceGallery,
      
      // Verification documents
      verificationDocumentUrls,
      
      // Profile images
      profileImage,
      coverImage,
    } = body;

    // Check if vendor profile exists
    const existingProfile = await db.query.vendorProfiles.findFirst({
      where: eq(vendorProfiles.userId, userId),
    });

    if (existingProfile) {
      // Update existing profile
      await db
        .update(vendorProfiles)
        .set({
          businessName: businessName || null,
          description: description || serviceDescription || null,
          phone: phone || null,
          website: website || null,
          address: address || null,
          city: city || null,
          state: state || null,
          zipCode: zipCode || null,
          serviceRadius: serviceRadius || null,
          yearsExperience: parseInt(experience) || null,
          hourlyRate: hourlyRate || null,
          profileImage: profileImage || null,
          coverImage: coverImage || null,
          verificationStatus: verificationDocumentUrls?.length > 0 ? 'pending' : 'not_submitted',
          verificationSubmittedAt: verificationDocumentUrls?.length > 0 ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(vendorProfiles.userId, userId));
    } else {
      // Create new vendor profile
      await db.insert(vendorProfiles).values({
        userId: userId,
        businessName: businessName || null,
        description: description || serviceDescription || null,
        phone: phone || null,
        website: website || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        serviceRadius: serviceRadius || null,
        yearsExperience: parseInt(experience) || null,
        hourlyRate: hourlyRate || null,
        profileImage: profileImage || null,
        coverImage: coverImage || null,
        verificationStatus: verificationDocumentUrls?.length > 0 ? 'pending' : 'not_submitted',
        verificationSubmittedAt: verificationDocumentUrls?.length > 0 ? new Date() : null,
      });
    }

    // Update onboarding progress
    const existingProgress = await db.query.onboardingProgress.findFirst({
      where: eq(onboardingProgress.userId, userId),
    });

    if (existingProgress) {
      await db
        .update(onboardingProgress)
        .set({
          isComplete: true,
          currentStep: 4,
          completedSteps: [1, 2, 3, 4],
          formData: body,
          updatedAt: new Date(),
        })
        .where(eq(onboardingProgress.userId, userId));
    } else {
      await db.insert(onboardingProgress).values({
        userId: userId,
        isComplete: true,
        currentStep: 4,
        completedSteps: [1, 2, 3, 4],
        formData: body,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding submitted successfully',
      redirectTo: '/vendor',
    });
  } catch (error) {
    console.error('Onboarding submission error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit onboarding',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}