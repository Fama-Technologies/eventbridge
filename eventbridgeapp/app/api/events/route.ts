import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events, eventCategories, eventCategoryRelations, users } from '@/drizzle/schema';
import { authMiddleware } from '@/middleware/auth';  
import { desc, asc, eq, like, and, or, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Use middleware to authenticate
    const authResult = await authMiddleware(request);
    
    // If middleware returns error response, return it
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    // Now authResult is the AuthUser
    const user = authResult;
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    // Build where conditions - FIXED: Type the array as any[]
    const conditions: any[] = [eq(events.vendorId, user.id)];
    
    if (search) {
      conditions.push(
        or(
          like(events.title, `%${search}%`),
          like(events.description, `%${search}%`),
          like(events.location, `%${search}%`)
        )
      );
    }
    
    if (category) {
      // FIXED: Use sql.raw() instead of sql template literal
      conditions.push(sql.raw(`
        EXISTS (
          SELECT 1 FROM event_category_relations ecr
          JOIN event_categories ec ON ecr.category_id = ec.id
          WHERE ecr.event_id = events.id AND ec.name = '${category}'
        )
      `));
    }

    // Fetch events with categories
    const eventList = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        location: events.location,
        startDate: events.startDate,
        endDate: events.endDate,
        imageUrl: events.imageUrl,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        vendor: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
        categories: sql<string[]>`ARRAY_AGG(DISTINCT ec.name)`.as('categories'),
      })
      .from(events)
      .leftJoin(eventCategoryRelations, eq(events.id, eventCategoryRelations.eventId))
      .leftJoin(eventCategories, eq(eventCategoryRelations.categoryId, eventCategories.id))
      .innerJoin(users, eq(events.vendorId, users.id))
      .where(and(...conditions))
      .groupBy(
        events.id,
        events.title,
        events.description,
        events.location,
        events.startDate,
        events.endDate,
        events.imageUrl,
        events.createdAt,
        events.updatedAt,
        users.id,
        users.firstName,
        users.lastName,
        users.email
      )
      .orderBy(
        sortOrder === 'desc' 
          ? desc(events[sortBy as keyof typeof events.$inferSelect]) 
          : asc(events[sortBy as keyof typeof events.$inferSelect])
      )
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(and(...conditions));

    const total = totalResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: eventList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1,
      },
    });
  } catch (error) {
    console.error('List events error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Use middleware to authenticate
    const authResult = await authMiddleware(request);
    
    // If middleware returns error response, return it
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    // Now authResult is the AuthUser
    const user = authResult;

    // Check if user is vendor
    if (user.accountType !== 'VENDOR') {
      return NextResponse.json(
        { success: false, error: 'Only vendors can create events' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      location,
      startDate,
      endDate,
      imageUrl,
      categoryIds = [],
    } = body;

    // Validation
    if (!title || !location || !startDate) {
      return NextResponse.json(
        { success: false, error: 'Title, location, and start date are required' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    if (end && end < start) {
      return NextResponse.json(
        { success: false, error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Validate categories exist if provided
    if (categoryIds.length > 0) {
      // FIXED: Use proper SQL parameterization
      const existingCategories = await db
        .select({ id: eventCategories.id })
        .from(eventCategories)
        .where(sql`id IN (${sql.raw(categoryIds.join(','))})`);
      
      if (existingCategories.length !== categoryIds.length) {
        return NextResponse.json(
          { success: false, error: 'One or more categories do not exist' },
          { status: 400 }
        );
      }
    }

    // Start transaction
    const result = await db.transaction(async (tx) => {
      // Create event
      const [event] = await tx
        .insert(events)
        .values({
          title,
          description,
          location,
          startDate: start,
          endDate: end,
          imageUrl,
          vendorId: user.id,
        })
        .returning();

      // Add categories if provided
      if (categoryIds.length > 0) {
        await tx.insert(eventCategoryRelations).values(
          categoryIds.map((categoryId: number) => ({
            eventId: event.id,
            categoryId,
          }))
        );
      }

      // Fetch the created event with categories
      const eventWithCategories = await tx
        .select({
          event: events,
          categories: sql<string[]>`ARRAY_AGG(ec.name)`.as('categories'),
        })
        .from(events)
        .leftJoin(eventCategoryRelations, eq(events.id, eventCategoryRelations.eventId))
        .leftJoin(eventCategories, eq(eventCategoryRelations.categoryId, eventCategories.id))
        .where(eq(events.id, event.id))
        .groupBy(events.id);

      return eventWithCategories[0];
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Event created successfully',
    });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    );
  }
}