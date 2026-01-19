// lib/queries.ts
import { db } from '@/lib/db';
import { 
  vendorProfiles, 
  bookings, 
  vendorServices,
  users,
  vendorPackages,
  reviews,
  eventCategories,
  eventCategoryRelations,
  events
} from '@/drizzle/schema';
import { 
  and, 
  eq, 
  notExists, 
  desc, 
  gte, 
  lte, 
  sql, 
  ilike, 
  or,
  count,
  asc,
  inArray,
  SQL
} from 'drizzle-orm';

// Helper function to safely create conditions
function createCondition(condition: SQL | undefined): SQL | undefined {
  return condition;
}

// ===================== VENDOR SEARCH QUERIES =====================

export async function searchVendors(params: {
  date?: Date;
  serviceType?: string;
  location?: string;
  minRating?: number;
  maxPrice?: number;
  category?: string;
}) {
  const conditions: SQL[] = [eq(vendorProfiles.isVerified, true)];

  if (params.minRating) {
    conditions.push(eq(vendorProfiles.rating, params.minRating));
  }

  if (params.serviceType) {
    conditions.push(
      ilike(vendorServices.name, `%${params.serviceType}%`)!
    );
  }

  if (params.location) {
    const locationCondition = or(
      ilike(vendorProfiles.city, `%${params.location}%`),
      ilike(vendorProfiles.state, `%${params.location}%`),
      ilike(vendorProfiles.address, `%${params.location}%`)
    );
    if (locationCondition) conditions.push(locationCondition);
  }

  if (params.maxPrice) {
    const priceCondition = or(
      eq(vendorServices.price, params.maxPrice),
      eq(vendorPackages.price, params.maxPrice)
    );
    if (priceCondition) conditions.push(priceCondition);
  }

  // Handle date availability
  if (params.date) {
    const dateStr = params.date.toISOString();
    
    const dateCondition = sql`
      NOT EXISTS (
        SELECT 1 FROM ${bookings}
        WHERE ${bookings.vendorId} = ${vendorProfiles.id}
          AND ${bookings.status} = 'confirmed'
          AND (
            ${sql.raw(`'${dateStr}'`)}::timestamp BETWEEN ${bookings.startTime} AND ${bookings.endTime}
            OR ${bookings.startTime} BETWEEN ${sql.raw(`'${dateStr}'`)}::timestamp 
              AND ${sql.raw(`'${dateStr}'`)}::timestamp + INTERVAL '1 day'
          )
      )
    `;
    conditions.push(dateCondition);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db
    .select({
      vendor: vendorProfiles,
      user: users,
      services: vendorServices,
      averageRating: vendorProfiles.rating,
      reviewCount: vendorProfiles.reviewCount,
    })
    .from(vendorProfiles)
    .innerJoin(users, eq(vendorProfiles.userId, users.id))
    .leftJoin(vendorServices, eq(vendorProfiles.id, vendorServices.vendorId))
    .leftJoin(vendorPackages, eq(vendorProfiles.id, vendorPackages.vendorId))
    .where(whereClause || sql`1=1`)
    .groupBy(vendorProfiles.id, users.id, vendorServices.id, vendorPackages.id)
    .orderBy(desc(vendorProfiles.rating));
}

// ===================== SIMPLIFIED VERSION (Recommended) =====================

export async function searchVendorsSimple(params: {
  query?: string;
  location?: string;
  date?: Date;
}) {
  // Start with base query
  let query = db
    .select({
      id: vendorProfiles.id,
      businessName: vendorProfiles.businessName,
      description: vendorProfiles.description,
      city: vendorProfiles.city,
      state: vendorProfiles.state,
      rating: vendorProfiles.rating,
      reviewCount: vendorProfiles.reviewCount,
      profileImage: vendorProfiles.profileImage,
      firstName: users.firstName,
      lastName: users.lastName,
      serviceName: vendorServices.name,
      servicePrice: vendorServices.price,
    })
    .from(vendorProfiles)
    .innerJoin(users, eq(vendorProfiles.userId, users.id))
    .leftJoin(vendorServices, eq(vendorProfiles.id, vendorServices.vendorId))
    .where(eq(vendorProfiles.isVerified, true));

  // Apply search query if provided
  if (params.query) {
    query = query.where(
      or(
        ilike(vendorProfiles.businessName, `%${params.query}%`),
        ilike(vendorProfiles.description, `%${params.query}%`),
        ilike(users.firstName, `%${params.query}%`),
        ilike(users.lastName, `%${params.query}%`),
        ilike(vendorServices.name, `%${params.query}%`)
      )!
    );
  }

  // Apply location filter if provided
  if (params.location) {
    query = query.where(
      or(
        ilike(vendorProfiles.city, `%${params.location}%`),
        ilike(vendorProfiles.state, `%${params.location}%`)
      )!
    );
  }

  // Apply date availability filter if provided
  if (params.date) {
    const dateStr = params.date.toISOString();
    query = query.where(
      notExists(
        db.select()
          .from(bookings)
          .where(
            and(
              eq(bookings.vendorId, vendorProfiles.id),
              eq(bookings.status, 'confirmed'),
              sql`DATE(${bookings.startTime}) = DATE(${sql.raw(`'${dateStr}'`)}::timestamp)`
            )
          )
      )
    );
  }

  return await query
    .groupBy(vendorProfiles.id, users.id, vendorServices.id)
    .orderBy(desc(vendorProfiles.rating))
    .limit(20);
}

export async function getVendorBookings(vendorId: number, startDate?: Date, endDate?: Date) {
  const conditions: SQL[] = [
    eq(bookings.vendorId, vendorId),
    eq(bookings.status, 'confirmed')
  ];

  if (startDate && endDate) {
    conditions.push(
      and(
        gte(bookings.startTime, startDate),
        lte(bookings.endTime, endDate)
      )!
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db
    .select()
    .from(bookings)
    .where(whereClause || sql`1=1`)
    .orderBy(bookings.startTime);
}

// ===================== VENDOR AVAILABILITY =====================

export async function checkVendorAvailability(vendorId: number, startDate: Date, endDate: Date) {
  const startDateStr = startDate.toISOString();
  const endDateStr = endDate.toISOString();
  
  const conflictingBookings = await db
    .select()
    .from(bookings)
    .where(sql`
      ${bookings.vendorId} = ${vendorId}
      AND ${bookings.status} = 'confirmed'
      AND (
        ${sql.raw(`'${startDateStr}'`)}::timestamp BETWEEN ${bookings.startTime} AND ${bookings.endTime}
        OR ${sql.raw(`'${endDateStr}'`)}::timestamp BETWEEN ${bookings.startTime} AND ${bookings.endTime}
        OR ${bookings.startTime} BETWEEN ${sql.raw(`'${startDateStr}'`)}::timestamp 
          AND ${sql.raw(`'${endDateStr}'`)}::timestamp
      )
    `)
    .limit(1);

  return conflictingBookings.length === 0;
}

// ===================== STATISTICS =====================

export async function getPlatformStats() {
  const [
    vendorCount,
    bookingCount,
    eventCount,
    userCount
  ] = await Promise.all([
    db.select({ count: count() }).from(vendorProfiles).where(eq(vendorProfiles.isVerified, true)),
    db.select({ count: count() }).from(bookings).where(eq(bookings.status, 'confirmed')),
    db.select({ count: count() }).from(events),
    db.select({ count: count() }).from(users)
  ]);

  return {
    totalVendors: vendorCount[0]?.count || 0,
    totalBookings: bookingCount[0]?.count || 0,
    totalEvents: eventCount[0]?.count || 0,
    totalUsers: userCount[0]?.count || 0
  };
}

// ===================== POPULAR VENDORS =====================

export async function getPopularVendors(limit: number = 10) {
  return await db
    .select({
      id: vendorProfiles.id,
      businessName: vendorProfiles.businessName,
      description: vendorProfiles.description,
      city: vendorProfiles.city,
      state: vendorProfiles.state,
      rating: vendorProfiles.rating,
      reviewCount: vendorProfiles.reviewCount,
      profileImage: vendorProfiles.profileImage,
      totalBookings: sql<number>`COUNT(DISTINCT ${bookings.id})`.as('total_bookings'),
    })
    .from(vendorProfiles)
    .leftJoin(bookings, eq(vendorProfiles.id, bookings.vendorId))
    .where(eq(vendorProfiles.isVerified, true))
    .groupBy(vendorProfiles.id)
    .orderBy(desc(sql`COUNT(DISTINCT ${bookings.id})`))
    .limit(limit);
}

// ===================== USER-SPECIFIC QUERIES =====================

export async function getVendorByUserId(userId: number) {
  const result = await db
    .select()
    .from(vendorProfiles)
    .where(eq(vendorProfiles.userId, userId))
    .limit(1);
  return result[0];
}

// ===================== SIMPLIFIED QUERIES FOR BOOKING PROCESS =====================

export async function getQuickStats() {
  const vendorCount = await db
    .select({ count: count() })
    .from(vendorProfiles)
    .where(eq(vendorProfiles.isVerified, true));
  
  const bookingCount = await db
    .select({ count: count() })
    .from(bookings)
    .where(eq(bookings.status, 'confirmed'));

  return {
    totalVendors: vendorCount[0]?.count || 0,
    totalBookings: bookingCount[0]?.count || 0
  };
}

export async function getFeaturedVendors(limit: number = 4) {
  return await db
    .select({
      id: vendorProfiles.id,
      businessName: vendorProfiles.businessName,
      description: vendorProfiles.description,
      city: vendorProfiles.city,
      state: vendorProfiles.state,
      rating: vendorProfiles.rating,
      profileImage: vendorProfiles.profileImage,
      serviceName: vendorServices.name
    })
    .from(vendorProfiles)
    .leftJoin(vendorServices, eq(vendorProfiles.id, vendorServices.vendorId))
    .where(eq(vendorProfiles.isVerified, true))
    .orderBy(desc(vendorProfiles.rating))
    .limit(limit)
    .groupBy(vendorProfiles.id, vendorServices.id);
}

// ===================== SIMPLE SEARCH SUGGESTIONS =====================

export async function getSearchSuggestions(query: string) {
  const vendors = await db
    .select({
      id: vendorProfiles.id,
      name: vendorProfiles.businessName,
      type: sql`'vendor'`.as('type')
    })
    .from(vendorProfiles)
    .where(
      and(
        eq(vendorProfiles.isVerified, true),
        ilike(vendorProfiles.businessName, `%${query}%`)
      )
    )
    .limit(3);

  const services = await db
    .select({
      id: vendorServices.id,
      name: vendorServices.name,
      type: sql`'service'`.as('type')
    })
    .from(vendorServices)
    .innerJoin(vendorProfiles, eq(vendorServices.vendorId, vendorProfiles.id))
    .where(
      and(
        eq(vendorProfiles.isVerified, true),
        ilike(vendorServices.name, `%${query}%`)
      )
    )
    .limit(3);

  const locations = await db
    .select({
      id: sql`DISTINCT ON (${vendorProfiles.city}, ${vendorProfiles.state}) ${vendorProfiles.id}`.as('id'),
      name: sql`CONCAT(${vendorProfiles.city}, ', ', ${vendorProfiles.state})`.as('name'),
      type: sql`'location'`.as('type')
    })
    .from(vendorProfiles)
    .where(
      and(
        eq(vendorProfiles.isVerified, true),
        or(
          ilike(vendorProfiles.city, `%${query}%`),
          ilike(vendorProfiles.state, `%${query}%`)
        )
      )
    )
    .limit(3);

  return [...vendors, ...services, ...locations];
}