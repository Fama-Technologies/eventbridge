import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookings, vendorProfiles } from '@/drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const vendor = await db.query.vendorProfiles.findFirst({
            where: eq(vendorProfiles.userId, user.id),
        });

        let earningsValue = 0;

        if (vendor) {
            const statsQuery = await db
                .select({
                    totalValue: sql<number>`sum(${bookings.totalAmount})`,
                })
                .from(bookings)
                .where(eq(bookings.vendorId, vendor.id));

            earningsValue = statsQuery[0]?.totalValue || 0;
        }

        return NextResponse.json({
            stats: {
                // Real DB Value
                earnings: { value: earningsValue, trend: "+0%" },

                // Zero/Empty because tables don't exist
                profileViews: { value: 0, trend: "0%" },
                newLeads: { value: 0, trend: "0" },
                responseRate: { value: 0, trend: "0%" }
            }
        });

    } catch (error) {
        console.error("Failed to fetch KPI stats:", error);
        return NextResponse.json({
            stats: {
                profileViews: { value: 0, trend: "0%" },
                newLeads: { value: 0, trend: "0" },
                earnings: { value: 0, trend: "0%" },
                responseRate: { value: 0, trend: "0%" }
            }
        });
    }
}
