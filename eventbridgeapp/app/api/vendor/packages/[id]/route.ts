import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, sessions, vendorProfiles, vendorPackages } from '@/drizzle/schema';
import { and, eq } from 'drizzle-orm';
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

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
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
      return NextResponse.json({ success: false, error: 'Vendor profile not found' }, { status: 404 });
    }

    const packageId = Number(params.id);
    if (!Number.isFinite(packageId)) {
      return NextResponse.json({ success: false, error: 'Invalid package ID' }, { status: 400 });
    }

    await db
      .delete(vendorPackages)
      .where(and(eq(vendorPackages.id, packageId), eq(vendorPackages.vendorId, vendorProfile.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete package error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      return NextResponse.json({ success: false, error: 'Vendor profile not found' }, { status: 404 });
    }

    const packageId = Number(params.id);
    if (!Number.isFinite(packageId)) {
      return NextResponse.json({ success: false, error: 'Invalid package ID' }, { status: 400 });
    }

    const body = await request.json();
    const name = String(body.name || '').trim();

    if (!name) {
      return NextResponse.json({ success: false, error: 'Package name is required' }, { status: 400 });
    }

    const [updated] = await db
      .update(vendorPackages)
      .set({
        name,
        description: body.description || null,
        price: Number(body.price) || 0,
        priceMax: Number.isFinite(Number(body.priceMax)) ? Number(body.priceMax) : null,
        duration: Number.isFinite(Number(body.duration)) ? Number(body.duration) : null,
        capacityMin: Number.isFinite(Number(body.capacityMin)) ? Number(body.capacityMin) : null,
        capacityMax: Number.isFinite(Number(body.capacityMax)) ? Number(body.capacityMax) : null,
        pricingModel: body.pricingModel || 'per_event',
        pricingStructure: Array.isArray(body.pricingStructure) ? body.pricingStructure : [],
        customPricing: Boolean(body.customPricing),
        features: Array.isArray(body.features) ? body.features : [],
        tags: Array.isArray(body.tags) ? body.tags : [],
        isPopular: Boolean(body.isPopular),
        isActive: body.isActive !== false,
        updatedAt: new Date()
      })
      .where(and(eq(vendorPackages.id, packageId), eq(vendorPackages.vendorId, vendorProfile.id)))
      .returning();

    return NextResponse.json({ success: true, package: updated });
  } catch (error) {
    console.error('Update package error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
