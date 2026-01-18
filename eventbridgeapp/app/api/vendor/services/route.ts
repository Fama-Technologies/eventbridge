import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, sessions, vendorProfiles, vendorServices } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
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

export async function GET() {
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

    const services = await db
      .select()
      .from(vendorServices)
      .where(eq(vendorServices.vendorId, vendorProfile.id));

    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error('Get services error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const name = String(body.name || '').trim();

    if (!name) {
      return NextResponse.json({ success: false, error: 'Service name is required' }, { status: 400 });
    }

    const price = Number.isFinite(Number(body.price)) ? Number(body.price) : null;

    const [service] = await db
      .insert(vendorServices)
      .values({
        vendorId: vendorProfile.id,
        name,
        description: body.description || null,
        price,
        duration: Number.isFinite(Number(body.duration)) ? Number(body.duration) : null,
        isActive: true,
      })
      .returning();

    return NextResponse.json({ success: true, service });
  } catch (error) {
    console.error('Create service error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
