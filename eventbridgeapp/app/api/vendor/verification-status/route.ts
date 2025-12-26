import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { vendorProfiles } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
// Import your getCurrentUser function

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [profile] = await db
    .select({
      verificationStatus: vendorProfiles.verificationStatus,
      canAccessDashboard: vendorProfiles.canAccessDashboard,
      verificationNotes: vendorProfiles.verificationNotes,
    })
    .from(vendorProfiles)
    .where(eq(vendorProfiles.userId, user.id))
    .limit(1);

  if (!profile) {
    return NextResponse.json({
      verificationStatus: 'not_started',
      canAccessDashboard: false,
    });
  }

  return NextResponse.json(profile);
}