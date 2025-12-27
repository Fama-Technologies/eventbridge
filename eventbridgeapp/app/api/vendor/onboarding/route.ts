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
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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
      reason: 'Event planners cannot register as vendors. Please use a different email address.',
    };
  }
  return { allowed: true };
}

async function saveFile(file: File, folder: string): Promise<string> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${extension}`;

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return public URL
    return `/uploads/${folder}/${filename}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file');
  }
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
    console.error('GET onboarding progress error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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

    // Parse FormData
    const formData = await request.formData();

    // Extract text fields
    const businessName = formData.get('businessName') as string;
    const serviceCategories = JSON.parse(formData.get('serviceCategories') as string || '[]');
    const primaryLocation = formData.get('primaryLocation') as string;
    const serviceDescription = formData.get('serviceDescription') as string;
    const pricingStructure = JSON.parse(formData.get('pricingStructure') as string || '[]');
    const priceRange = formData.get('priceRange') as string;
    const generalAvailability = formData.get('generalAvailability') as string;
    const phone = formData.get('phone') as string;
    const website = formData.get('website') as string;

    // Handle file uploads
    let profilePhotoUrl = null;
    const profilePhoto = formData.get('profilePhoto') as File | null;
    if (profilePhoto && profilePhoto.size > 0) {
      profilePhotoUrl = await saveFile(profilePhoto, 'profiles');
    }

    // Handle gallery images
    const galleryUrls: string[] = [];
    let galleryIndex = 0;
    while (formData.has(`galleryImage_${galleryIndex}`)) {
      const file = formData.get(`galleryImage_${galleryIndex}`) as File;
      if (file && file.size > 0) {
        const url = await saveFile(file, 'gallery');
        galleryUrls.push(url);
      }
      galleryIndex++;
    }

    // Handle verification documents
    const documentUrls: string[] = [];
    let docIndex = 0;
    while (formData.has(`document_${docIndex}`)) {
      const file = formData.get(`document_${docIndex}`) as File;
      if (file && file.size > 0) {
        const url = await saveFile(file, 'documents');
        documentUrls.push(url);
      }
      docIndex++;
    }

    // Validation
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

    if (galleryUrls.length === 0) {
      return NextResponse.json(
        { error: 'Please upload at least one gallery image' },
        { status: 400 }
      );
    }

    if (documentUrls.length === 0) {
      return NextResponse.json(
        { error: 'Please upload at least one verification document' },
        { status: 400 }
      );
    }

    // Extract location
    const locationParts = primaryLocation?.split(',').map((p: string) => p.trim()) || [];
    const city = locationParts[0] || null;
    const state = locationParts[1] || null;

    // Create/Update Vendor Profile
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
      profileImage: profilePhotoUrl,
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
    }

    // Save Packages
    if (pricingStructure.length > 0) {
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

    // Save Portfolio Images
    if (galleryUrls.length > 0) {
      await db
        .delete(vendorPortfolio)
        .where(eq(vendorPortfolio.vendorId, vendorProfileId));

      const portfolioItems = galleryUrls.map((url, index) => ({
        vendorId: vendorProfileId,
        imageUrl: url,
        title: `Gallery Image ${index + 1}`,
        displayOrder: index,
      }));

      await db.insert(vendorPortfolio).values(portfolioItems);
    }

    // Save Cancellation Policy
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

    // Save Verification Documents
    if (documentUrls.length > 0) {
      await db
        .delete(verificationDocuments)
        .where(eq(verificationDocuments.vendorId, vendorProfileId));

      const documents = documentUrls.map((url, index) => ({
        vendorId: vendorProfileId,
        documentType: 'business_license',
        documentUrl: url,
        documentName: `Document ${index + 1}`,
        status: 'pending',
      }));

      await db.insert(verificationDocuments).values(documents);
    }

    // Update User Account Type
    if (user.accountType === 'CUSTOMER') {
      await db
        .update(users)
        .set({ accountType: 'VENDOR' })
        .where(eq(users.id, user.id));
    }

    // Mark Onboarding Complete
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

    return NextResponse.json({
      success: true,
      message: 'Application submitted for verification. You will be notified once reviewed.',
      verificationStatus: 'under_review',
      vendorProfileId,
      redirect: '/',
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