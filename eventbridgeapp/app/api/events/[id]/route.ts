import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events, eventCategories, eventCategoryRelations } from '@/drizzle/schema';
import { authMiddleware } from '@/middleware/auth';  
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, context: any) {
  const { params } = context;
  try {
    // Use middleware to authenticate
    const authResult = await authMiddleware(request);
    
    // If middleware returns error response, return it
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    // Now authResult is the AuthUser
    const user = authResult;

    // Parse ID
    const eventId = parseInt(params.id);
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Fetch event with categories
    const event = await db
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
        vendorId: events.vendorId,
        categories: sql<string[]>`ARRAY_AGG(DISTINCT ec.name)`.as('categories'),
        categoryIds: sql<number[]>`ARRAY_AGG(DISTINCT ec.id)`.as('categoryIds'),
      })
      .from(events)
      .leftJoin(eventCategoryRelations, eq(events.id, eventCategoryRelations.eventId))
      .leftJoin(eventCategories, eq(eventCategoryRelations.categoryId, eventCategories.id))
      .where(and(
        eq(events.id, eventId),
        eq(events.vendorId, user.id)
      ))
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
        events.vendorId
      );

    if (!event[0]) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event[0],
    });
  } catch (error) {
    console.error('Get event error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: any) {
  const { params } = context;
  try {
    // Use middleware to authenticate
    const authResult = await authMiddleware(request);
    
    // If middleware returns error response, return it
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    // Now authResult is the AuthUser
    const user = authResult;

    // Parse ID
    const eventId = parseInt(params.id);
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
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
      categoryIds,
    } = body;

    // Check if event exists and belongs to user
    const existingEvent = await db.query.events.findFirst({
      where: and(
        eq(events.id, eventId),
        eq(events.vendorId, user.id)
      ),
    });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Validate dates if provided
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    
    if (startDate) {
      updateData.startDate = new Date(startDate);
    }
    
    if (endDate !== undefined) {
      updateData.endDate = endDate ? new Date(endDate) : null;
    }
    
    updateData.updatedAt = new Date();

    // Update event
    const [updatedEvent] = await db
      .update(events)
      .set(updateData)
      .where(and(
        eq(events.id, eventId),
        eq(events.vendorId, user.id)
      ))
      .returning();

    // Update categories if provided
    if (categoryIds !== undefined) {
      await db.transaction(async (tx: typeof db) => {
        // Remove existing categories
        await tx
          .delete(eventCategoryRelations)
          .where(eq(eventCategoryRelations.eventId, eventId));

        // Add new categories if any
        if (Array.isArray(categoryIds) && categoryIds.length > 0) {
          await tx.insert(eventCategoryRelations).values(
            categoryIds.map((categoryId: number) => ({
              eventId,
              categoryId,
            }))
          );
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: 'Event updated successfully',
    });
  } catch (error) {
    console.error('Update event error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: any) {
  const { params } = context;
  try {
    // Use middleware to authenticate
    const authResult = await authMiddleware(request);
    
    // If middleware returns error response, return it
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    // Now authResult is the AuthUser
    const user = authResult;

    // Parse ID
    const eventId = parseInt(params.id);
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Check if event exists and belongs to user
    const existingEvent = await db.query.events.findFirst({
      where: and(
        eq(events.id, eventId),
        eq(events.vendorId, user.id)
      ),
    });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Delete event (cascade will handle related records)
    await db.delete(events).where(
      and(
        eq(events.id, eventId),
        eq(events.vendorId, user.id)
      )
    );

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}