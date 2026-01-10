import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, sessions, vendorProfiles, vendorPortfolio, vendorServices } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

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

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    if (user.accountType !== 'VENDOR') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Vendor only' 
      }, { status: 403 });
    }

    // Get vendor profile
    const [profile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ 
        success: true,
        profile: null,
        services: [],
        portfolio: [],
        message: 'No profile found'
      });
    }

    // Get vendor services
    const services = await db
      .select()
      .from(vendorServices)
      .where(eq(vendorServices.vendorId, profile.id));

    // Get vendor portfolio items
    const portfolio = await db
      .select()
      .from(vendorPortfolio)
      .where(eq(vendorPortfolio.vendorId, profile.id))
      .orderBy(vendorPortfolio.createdAt);

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        businessName: profile.businessName,
        description: profile.description,
        phone: profile.phone,
        website: profile.website,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zipCode: profile.zipCode,
        yearsExperience: profile.yearsExperience || 0,
        isVerified: profile.isVerified || false,
        rating: profile.rating || 0,
        reviewCount: profile.reviewCount || 0,
        profileImage: profile.profileImage,
        verificationStatus: profile.verificationStatus || 'not_submitted',
        serviceRadius: profile.serviceRadius,
        hourlyRate: profile.hourlyRate,
        coverImage: profile.coverImage,
        canAccessDashboard: profile.canAccessDashboard
      },
      services: services.map((service: { id: any; name: any; description: any; price: any; duration: any; isActive: any; }) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        isActive: service.isActive
      })),
      portfolio: portfolio.map((item: { id: any; imageUrl: any; title: any; description: any; category: any; width: any; height: any; fileSize: any; quality: any; displayOrder: any; createdAt: any; }) => ({
        id: item.id,
        imageUrl: item.imageUrl,
        title: item.title,
        description: item.description,
        category: item.category,
        width: item.width,
        height: item.height,
        fileSize: item.fileSize,
        quality: item.quality,
        displayOrder: item.displayOrder,
        createdAt: item.createdAt
      }))
    });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    if (user.accountType !== 'VENDOR') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Vendor only' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { 
      businessName,
      description,
      phone,
      address,
      city,
      state,
      zipCode,
      website,
      yearsExperience,
      profileImage,
      socialLinks,
      serviceRadius,
      hourlyRate,
      coverImage
    } = body;

    // Check if profile exists
    const [existingProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    let updatedProfile;

    // Create typed update object
    const updateData: {
      businessName?: string;
      description?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      website?: string;
      yearsExperience?: number;
      profileImage?: string;
      serviceRadius?: number;
      hourlyRate?: number;
      coverImage?: string;
      updatedAt: Date;
    } = {
      updatedAt: new Date()
    };

    // Add provided fields to updateData
    if (businessName !== undefined) updateData.businessName = businessName;
    if (description !== undefined) updateData.description = description;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zipCode !== undefined) updateData.zipCode = zipCode;
    if (website !== undefined) updateData.website = website;
    if (yearsExperience !== undefined) updateData.yearsExperience = yearsExperience;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (serviceRadius !== undefined) updateData.serviceRadius = serviceRadius;
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
    if (coverImage !== undefined) updateData.coverImage = coverImage;

    if (existingProfile) {
      // Update existing profile
      [updatedProfile] = await db
        .update(vendorProfiles)
        .set(updateData)
        .where(eq(vendorProfiles.userId, user.id))
        .returning();
    } else {
      // Create new profile with all fields
      [updatedProfile] = await db
        .insert(vendorProfiles)
        .values({
          userId: user.id,
          businessName,
          description,
          phone,
          address,
          city,
          state,
          zipCode,
          website,
          yearsExperience: yearsExperience || 0,
          serviceRadius: serviceRadius || null,
          hourlyRate: hourlyRate || null,
          profileImage: profileImage || null,
          coverImage: coverImage || null,
          isVerified: false,
          rating: 0,
          reviewCount: 0,
          verificationStatus: 'not_submitted',
          canAccessDashboard: false,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
    }

    // Return the complete updated profile
    return NextResponse.json({
      success: true,
      profile: {
        id: updatedProfile.id,
        businessName: updatedProfile.businessName,
        description: updatedProfile.description,
        phone: updatedProfile.phone,
        website: updatedProfile.website,
        address: updatedProfile.address,
        city: updatedProfile.city,
        state: updatedProfile.state,
        zipCode: updatedProfile.zipCode,
        yearsExperience: updatedProfile.yearsExperience || 0,
        isVerified: updatedProfile.isVerified || false,
        rating: updatedProfile.rating || 0,
        reviewCount: updatedProfile.reviewCount || 0,
        profileImage: updatedProfile.profileImage,
        verificationStatus: updatedProfile.verificationStatus || 'not_submitted',
        serviceRadius: updatedProfile.serviceRadius,
        hourlyRate: updatedProfile.hourlyRate,
        coverImage: updatedProfile.coverImage,
        canAccessDashboard: updatedProfile.canAccessDashboard
      },
      message: existingProfile ? 'Profile updated successfully' : 'Profile created successfully'
    });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Optional: Add PATCH for partial updates
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    if (user.accountType !== 'VENDOR') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Vendor only' 
      }, { status: 403 });
    }

    const body = await request.json();
    
    // Check if profile exists
    const [existingProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    if (!existingProfile) {
      return NextResponse.json({ 
        success: false, 
        error: 'Profile not found' 
      }, { status: 404 });
    }

    // Create typed update object
    const updateData: {
      businessName?: string;
      description?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      website?: string;
      yearsExperience?: number;
      profileImage?: string;
      serviceRadius?: number;
      hourlyRate?: number;
      coverImage?: string;
      updatedAt: Date;
    } = {
      updatedAt: new Date()
    };

    // Add fields that are provided in the request
    const fields = [
      'businessName', 'description', 'phone', 'address', 'city', 'state',
      'zipCode', 'website', 'yearsExperience', 'profileImage', 'coverImage',
      'serviceRadius', 'hourlyRate'
    ] as const;

    fields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    const [updatedProfile] = await db
      .update(vendorProfiles)
      .set(updateData)
      .where(eq(vendorProfiles.userId, user.id))
      .returning();

    return NextResponse.json({
      success: true,
      profile: {
        id: updatedProfile.id,
        businessName: updatedProfile.businessName,
        description: updatedProfile.description,
        phone: updatedProfile.phone,
        website: updatedProfile.website,
        address: updatedProfile.address,
        city: updatedProfile.city,
        state: updatedProfile.state,
        zipCode: updatedProfile.zipCode,
        yearsExperience: updatedProfile.yearsExperience || 0,
        isVerified: updatedProfile.isVerified || false,
        rating: updatedProfile.rating || 0,
        reviewCount: updatedProfile.reviewCount || 0,
        profileImage: updatedProfile.profileImage,
        verificationStatus: updatedProfile.verificationStatus || 'not_submitted',
        serviceRadius: updatedProfile.serviceRadius,
        hourlyRate: updatedProfile.hourlyRate,
        coverImage: updatedProfile.coverImage,
        canAccessDashboard: updatedProfile.canAccessDashboard
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Patch vendor profile error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}