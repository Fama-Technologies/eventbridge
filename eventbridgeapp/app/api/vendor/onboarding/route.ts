import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, sessions, vendorProfiles, vendorPortfolio } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

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

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.accountType !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized - Vendor only' }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    
    const businessName = formData.get('businessName') as string;
    const serviceCategories = JSON.parse(formData.get('serviceCategories') as string || '[]');
    const primaryLocation = formData.get('primaryLocation') as string;
    const serviceDescription = formData.get('serviceDescription') as string;
    const pricingStructure = JSON.parse(formData.get('pricingStructure') as string || '[]');
    const priceRange = formData.get('priceRange') as string;
    const generalAvailability = formData.get('generalAvailability') as string;

    // Handle file uploads (you would typically upload to cloud storage here)
    const profilePhoto = formData.get('profilePhoto') as File | null;
    let profileImageUrl = null;

    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll just store the metadata
    if (profilePhoto) {
      // TODO: Upload to cloud storage and get URL
      // profileImageUrl = await uploadToStorage(profilePhoto);
      profileImageUrl = '/uploads/default-profile.jpg'; // Placeholder
    }

    // Extract location parts
    const locationParts = primaryLocation.split(',').map(p => p.trim());
    const city = locationParts[0] || null;
    const state = locationParts[1] || null;

    // Parse price range for hourly rate
    const priceMatch = priceRange.match(/[\d,]+/);
    const hourlyRate = priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : null;

    // Check if vendor profile already exists
    const [existingProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    let vendorProfileId: number;

    if (existingProfile) {
      // Update existing profile
      await db
        .update(vendorProfiles)
        .set({
          businessName,
          description: serviceDescription,
          city,
          state,
          hourlyRate,
          profileImage: profileImageUrl || existingProfile.profileImage,
          updatedAt: new Date(),
        })
        .where(eq(vendorProfiles.id, existingProfile.id));
      
      vendorProfileId = existingProfile.id;
    } else {
      // Create new vendor profile
      const [newProfile] = await db
        .insert(vendorProfiles)
        .values({
          userId: user.id,
          businessName,
          description: serviceDescription,
          city,
          state,
          hourlyRate,
          profileImage: profileImageUrl,
          isVerified: false,
        })
        .returning();
      
      vendorProfileId = newProfile.id;
    }

    // Handle gallery images
    const galleryImages: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('galleryImage_') && value instanceof File) {
        // TODO: Upload to cloud storage
        // const imageUrl = await uploadToStorage(value);
        const imageUrl = `/uploads/gallery/${value.name}`; // Placeholder
        galleryImages.push(imageUrl);
      }
    }

    // Save gallery images to portfolio
    if (galleryImages.length > 0) {
      // Delete existing portfolio items first (optional)
      await db
        .delete(vendorPortfolio)
        .where(eq(vendorPortfolio.vendorId, vendorProfileId));

      // Insert new portfolio items
      await db
        .insert(vendorPortfolio)
        .values(
          galleryImages.map((imageUrl, index) => ({
            vendorId: vendorProfileId,
            imageUrl,
            title: `Service Image ${index + 1}`,
            category: serviceCategories[0] || 'General',
          }))
        );
    }

    // Store service categories (you might want a separate table for this)
    // For now, we'll store as part of the description
    // TODO: Create vendor_categories junction table

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      vendorProfileId,
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
