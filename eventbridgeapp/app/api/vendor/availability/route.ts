import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, sessions, vendorProfiles, vendorAvailability } from '@/drizzle/schema';
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

function normalizeActiveDays(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((day) => Number(day))
    .filter((day) => Number.isFinite(day) && day >= 0 && day <= 6);
}

function normalizeWorkingHours(value: unknown) {
  if (!value || typeof value !== 'object') {
    return { start: '09:00', end: '17:00' };
  }

  const hours = value as { start?: string; end?: string };
  return {
    start: hours.start || '09:00',
    end: hours.end || '17:00',
  };
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

    const [availability] = await db
      .select()
      .from(vendorAvailability)
      .where(eq(vendorAvailability.vendorId, vendorProfile.id))
      .limit(1);

    return NextResponse.json({
      success: true,
      activeDays: availability?.activeDays || [0, 1, 2, 3, 4],
      sameDayService: availability?.sameDayService ?? false,
      maxEvents: availability?.maxEvents ?? 5,
      workingHours: availability?.workingHours || { start: '09:00', end: '17:00' },
    });
  } catch (error) {
    console.error('Get availability error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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
    const activeDays = normalizeActiveDays(body.activeDays);
    const workingHours = normalizeWorkingHours(body.workingHours);
    const sameDayService = Boolean(body.sameDayService);
    const maxEvents = Number.isFinite(Number(body.maxEvents)) ? Number(body.maxEvents) : 5;

    const [existing] = await db
      .select()
      .from(vendorAvailability)
      .where(eq(vendorAvailability.vendorId, vendorProfile.id))
      .limit(1);

    if (existing) {
      await db
        .update(vendorAvailability)
        .set({
          activeDays,
          workingHours,
          sameDayService,
          maxEvents,
          updatedAt: new Date(),
        })
        .where(eq(vendorAvailability.vendorId, vendorProfile.id));
    } else {
      await db.insert(vendorAvailability).values({
        vendorId: vendorProfile.id,
        activeDays,
        workingHours,
        sameDayService,
        maxEvents,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save availability error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
