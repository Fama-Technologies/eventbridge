import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, sessions, vendorProfiles } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

// If you have a services table, import it too
// import { vendorServices } from '@/drizzle/schema';

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

    // If no profile exists, create a default one
    if (!profile) {
      // Optional: You might want to create a default profile here
      // const [newProfile] = await db.insert(vendorProfiles).values({
      //   userId: user.id,
      //   businessName: null,
      //   description: null,
      //   phone: null,
      //   website: null,
      //   address: null,
      //   city: null,
      //   state: null,
      //   zipCode: null,
      //   yearsExperience: 0,
      //   isVerified: false,
      //   rating: 0,
      //   reviewCount: 0,
      //   profileImage: null,
      //   verificationStatus: 'not_submitted',
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // }).returning();

      // return NextResponse.json({
      //   success: true,
      //   profile: newProfile,
      //   services: []
      // });

      // For now, return empty with success
      return NextResponse.json({ 
        success: true,
        profile: null,
        services: [],
        message: 'No profile found'
      });
    }

    // Get vendor services if you have a services table
    // Uncomment and adjust when you implement services
    /*
    const services = await db
      .select()
      .from(vendorServices)
      .where(eq(vendorServices.vendorId, user.id));
    */

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
        verificationStatus: profile.verificationStatus || 'not_submitted'
      },
      services: [] // Replace with services when implemented
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

// Add this if you want to handle profile creation/update from the same route
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
      socialLinks // This is not in your schema, you might need to handle it separately
    } = body;

    // Check if profile exists
    const [existingProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    let updatedProfile;

    if (existingProfile) {
      // Update existing profile
      [updatedProfile] = await db
        .update(vendorProfiles)
        .set({
          businessName,
          description,
          phone,
          address,
          city,
          state,
          zipCode,
          website,
          yearsExperience: yearsExperience || 0,
          updatedAt: new Date()
        })
        .where(eq(vendorProfiles.userId, user.id))
        .returning();
    } else {
      // Create new profile
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
          isVerified: false,
          rating: 0,
          reviewCount: 0,
          profileImage: null,
          verificationStatus: 'not_submitted',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
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