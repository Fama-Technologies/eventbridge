import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, sessions, vendorProfiles, vendorPackages } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

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

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (user.accountType !== 'VENDOR') {
      return NextResponse.json({ success: false, error: 'Vendor only' }, { status: 403 });
    }

    const [vendorProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    if (!vendorProfile) {
      return NextResponse.json({ success: true, packages: [] }, { status: 200 });
    }

    const packages = await db
      .select()
      .from(vendorPackages)
      .where(eq(vendorPackages.vendorId, vendorProfile.id))
      .orderBy(vendorPackages.displayOrder);

    return NextResponse.json({ success: true, packages });
  } catch (error) {
    console.error('Get packages error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/vendor/packages called');
    const user = await getCurrentUser();

    if (!user) {
      console.log('No user found');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (user.accountType !== 'VENDOR') {
      console.log('User is not a vendor:', user.accountType);
      return NextResponse.json({ success: false, error: 'Vendor only' }, { status: 403 });
    }

    const [vendorProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    if (!vendorProfile) {
      console.log('Vendor profile not found for user:', user.id);
      return NextResponse.json({ success: false, error: 'Vendor profile not found' }, { status: 404 });
    }

    const body = await request.json();
    console.log('Request body:', body);

    const name = String(body.name || '').trim();

    if (!name) {
      console.log('Package name is required');
      return NextResponse.json({ success: false, error: 'Package name is required' }, { status: 400 });
    }

    // Get the highest display order
    const [latestPackage] = await db
      .select({ displayOrder: vendorPackages.displayOrder })
      .from(vendorPackages)
      .where(eq(vendorPackages.vendorId, vendorProfile.id))
      .orderBy(vendorPackages.displayOrder)
      .limit(1);

    const nextDisplayOrder = (latestPackage?.displayOrder || 0) + 1;

    const [pkg] = await db
      .insert(vendorPackages)
      .values({
        vendorId: vendorProfile.id,
        name,
        description: body.description || null,
        price: Number(body.price) || 0,
        priceMax: body.priceMax && Number.isFinite(Number(body.priceMax)) && Number(body.priceMax) > 0 
          ? Number(body.priceMax) 
          : null,
        duration: body.duration && Number.isFinite(Number(body.duration)) && Number(body.duration) > 0
          ? Number(body.duration)
          : null,
        capacityMin: body.capacityMin && Number.isFinite(Number(body.capacityMin)) && Number(body.capacityMin) > 0
          ? Number(body.capacityMin)
          : null,
        capacityMax: body.capacityMax && Number.isFinite(Number(body.capacityMax)) && Number(body.capacityMax) > 0
          ? Number(body.capacityMax)
          : null,
        pricingModel: body.pricingModel || 'per_event',
        pricingStructure: Array.isArray(body.pricingStructure) && body.pricingStructure.length > 0 
          ? body.pricingStructure 
          : body.pricingModel ? [body.pricingModel] : [],
        customPricing: Boolean(body.customPricing),
        features: Array.isArray(body.features) ? body.features.filter((f: string) => f && f.trim()) : [],
        tags: Array.isArray(body.tags) ? body.tags.filter((t: string) => t && t.trim()) : [],
        isPopular: Boolean(body.isPopular),
        isActive: body.isActive !== false,
        displayOrder: nextDisplayOrder,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log('Package created successfully:', pkg);
    return NextResponse.json({ 
      success: true, 
      package: pkg 
    });
  } catch (error: any) {
    console.error('Create package error:', error);
    console.error('Error details:', error.message, error.stack);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('PATCH /api/vendor/packages called');
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (user.accountType !== 'VENDOR') {
      return NextResponse.json({ success: false, error: 'Vendor only' }, { status: 403 });
    }

    const [vendorProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    if (!vendorProfile) {
      return NextResponse.json({ success: false, error: 'Vendor profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    console.log('Editing package ID:', id);
    console.log('Request body:', body);

    if (!id || !Number(id)) {
      return NextResponse.json({ success: false, error: 'Package ID is required' }, { status: 400 });
    }

    const packageId = Number(id);
    const name = String(body.name || '').trim();

    if (!name) {
      return NextResponse.json({ success: false, error: 'Package name is required' }, { status: 400 });
    }

    // Check if package exists and belongs to this vendor
    const [existingPackage] = await db
      .select()
      .from(vendorPackages)
      .where(
        and(
          eq(vendorPackages.id, packageId),
          eq(vendorPackages.vendorId, vendorProfile.id)
        )
      )
      .limit(1);

    if (!existingPackage) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
    }

    const [updatedPackage] = await db
      .update(vendorPackages)
      .set({
        name,
        description: body.description || null,
        price: Number(body.price) || 0,
        priceMax: body.priceMax && Number.isFinite(Number(body.priceMax)) && Number(body.priceMax) > 0 
          ? Number(body.priceMax) 
          : null,
        duration: body.duration && Number.isFinite(Number(body.duration)) && Number(body.duration) > 0
          ? Number(body.duration)
          : null,
        capacityMin: body.capacityMin && Number.isFinite(Number(body.capacityMin)) && Number(body.capacityMin) > 0
          ? Number(body.capacityMin)
          : null,
        capacityMax: body.capacityMax && Number.isFinite(Number(body.capacityMax)) && Number(body.capacityMax) > 0
          ? Number(body.capacityMax)
          : null,
        pricingModel: body.pricingModel || 'per_event',
        pricingStructure: Array.isArray(body.pricingStructure) && body.pricingStructure.length > 0 
          ? body.pricingStructure 
          : body.pricingModel ? [body.pricingModel] : [],
        customPricing: Boolean(body.customPricing),
        features: Array.isArray(body.features) ? body.features.filter((f: string) => f && f.trim()) : [],
        tags: Array.isArray(body.tags) ? body.tags.filter((t: string) => t && t.trim()) : [],
        isPopular: Boolean(body.isPopular),
        isActive: body.isActive !== false,
        updatedAt: new Date(),
      })
      .where(eq(vendorPackages.id, packageId))
      .returning();

    console.log('Package updated successfully:', updatedPackage);
    return NextResponse.json({ 
      success: true, 
      package: updatedPackage 
    });
  } catch (error: any) {
    console.error('Update package error:', error);
    console.error('Error details:', error.message, error.stack);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE /api/vendor/packages called');
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (user.accountType !== 'VENDOR') {
      return NextResponse.json({ success: false, error: 'Vendor only' }, { status: 403 });
    }

    const [vendorProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    if (!vendorProfile) {
      return NextResponse.json({ success: false, error: 'Vendor profile not found' }, { status: 404 });
    }

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    console.log('Deleting package ID:', id);

    if (!id || !Number(id)) {
      return NextResponse.json({ success: false, error: 'Package ID is required' }, { status: 400 });
    }

    const packageId = Number(id);

    // Check if package exists and belongs to this vendor
    const [existingPackage] = await db
      .select()
      .from(vendorPackages)
      .where(
        and(
          eq(vendorPackages.id, packageId),
          eq(vendorPackages.vendorId, vendorProfile.id)
        )
      )
      .limit(1);

    if (!existingPackage) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
    }

    await db
      .delete(vendorPackages)
      .where(eq(vendorPackages.id, packageId));

    console.log('Package deleted successfully:', packageId);
    return NextResponse.json({ 
      success: true, 
      message: 'Package deleted successfully' 
    });
  } catch (error: any) {
    console.error('Delete package error:', error);
    console.error('Error details:', error.message, error.stack);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}