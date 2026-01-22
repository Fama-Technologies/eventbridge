import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  bookings, 
  vendorProfiles, 
  users, 
  events,
  vendorServices,
  vendorPackages
} from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { format, addDays, subDays } from 'date-fns';

// Define payment type for TypeScript
type PaymentItem = {
  type: 'paid' | 'due' | 'discount';
  label: string;
  amount: number;
  date: string;
};

// GET - Fetch real bookings from database
export async function GET(req: Request) {
  try {
    // TODO: Get vendor ID from session/authentication
    // For now, using vendor ID 1 as example
    const vendorId = 1;
    
    // Fetch bookings for this vendor from database
    const dbBookings = await db
      .select({
        id: bookings.id,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        bookingDate: bookings.bookingDate,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        totalAmount: bookings.totalAmount,
        notes: bookings.notes,
        discountCode: bookings.discountCode,
        discountAmount: bookings.discountAmount,
        // Client info
        clientId: users.id,
        clientFirstName: users.firstName,
        clientLastName: users.lastName,
        clientEmail: users.email,
        // Event info
        eventId: events.id,
        eventTitle: events.title,
        eventLocation: events.location,
        eventDescription: events.description,
        // Service info (if any)
        serviceName: vendorServices.name,
        // Package info (if any)
        packageName: vendorPackages.name,
      })
      .from(bookings)
      .innerJoin(users, eq(bookings.clientId, users.id))
      .innerJoin(events, eq(bookings.eventId, events.id))
      .leftJoin(vendorServices, eq(bookings.serviceId, vendorServices.id))
      .leftJoin(vendorPackages, eq(bookings.packageId, vendorPackages.id))
      .where(eq(bookings.vendorId, vendorId))
      .orderBy(desc(bookings.startTime));

    // Format bookings for frontend - matching BookingDetailsModal expectations
    const formattedBookings = dbBookings.map((booking: { id: { toString: () => string; }; paymentStatus: string; totalAmount: any; startTime: string | number | Date; endTime: string | number | Date; eventTitle: any; status: any; clientFirstName: string; clientLastName: string; clientEmail: any; eventLocation: any; notes: any; }) => {
      // Generate booking ID from database ID
      const bookingId = `BK-${booking.id.toString().padStart(6, '0')}`;
      
      // Determine payment status label
      const paymentStatus = booking.paymentStatus || 'unpaid';
      const isPaid = paymentStatus === 'paid';
      const isPartial = paymentStatus === 'partial';
      
      // Calculate balance amount (simplified logic)
      const balanceAmount = isPaid ? 0 : (booking.totalAmount || 0) * 0.5; // Example: 50% balance if not paid
      
      // Parse dates safely
      const startTime = booking.startTime ? new Date(booking.startTime) : new Date();
      const endTime = booking.endTime ? new Date(booking.endTime) : startTime;
      
      // Create mock payments array for demonstration
      const payments: PaymentItem[] = [
        {
          type: 'paid',
          label: 'Deposit',
          amount: isPaid ? booking.totalAmount || 0 : (booking.totalAmount || 0) * 0.5,
          date: format(subDays(startTime, 7), 'MMM d, yyyy') // 7 days before event
        }
      ];
      
      if (isPartial) {
        payments.push({
          type: 'due',
          label: 'Balance Due',
          amount: balanceAmount,
          date: format(new Date(), 'MMM d, yyyy')
        });
      }
      
      // Calculate guest count (default to 50 if not available)
      const guestCount = 50; // Default value since not in your schema
      
      return {
        id: booking.id.toString(),
        bookingId: bookingId,
        title: booking.eventTitle || 'Booking',
        status: (booking.status || 'pending') as 'confirmed' | 'pending' | 'pending_payment' | 'cancelled',
        date: startTime,
        startDate: startTime,
        endDate: endTime,
        initials: (
          (booking.clientFirstName?.charAt(0) || '') + 
          (booking.clientLastName?.charAt(0) || '')
        ).toUpperCase() || 'CL',
        dateDisplay: format(startTime, 'MMM d'),
        client: {
          name: `${booking.clientFirstName} ${booking.clientLastName}`.trim(),
          email: booking.clientEmail || '',
          rating: 4.5, // Default rating
          reviews: 12, // Default review count
        },
        guests: guestCount, // Using 'guests' field name that BookingDetailsModal expects
        guestCount: guestCount, // Also include guestCount for compatibility
        totalAmount: booking.totalAmount || 0,
        venue: booking.eventLocation || 'Location not specified',
        dateRange: format(startTime, 'MMM d') + 
          (startTime.toDateString() === endTime.toDateString() 
            ? '' 
            : ` - ${format(endTime, 'MMM d')}`),
        timeRange: 'All Day',
        paymentStatus: paymentStatus,
        payments: payments,
        notes: booking.notes,
        // Fields needed by BookingDetailsModal
        conversationId: `conv-${booking.id}`, // Generate conversation ID
        balanceAmount: balanceAmount,
        balanceDue: format(new Date(), 'MMM d, yyyy'), // Due date (today for demo)
        latestMessage: {
          sender: `${booking.clientFirstName} ${booking.clientLastName}`.trim(),
          time: '2 hours ago',
          content: 'Looking forward to the event!',
          attachment: null as string | null
        },
        invoiceId: `INV-${booking.id.toString().padStart(6, '0')}`,
        receiptIds: isPaid ? [`RCPT-${booking.id.toString().padStart(6, '0')}`] : []
      };
    });

    return NextResponse.json({ bookings: formattedBookings });
    
  } catch (error) {
    console.error('Error fetching bookings from database:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new booking (dynamic from database)
export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    console.log('Booking creation data received:', data);
    
    // Validate required fields
    const requiredFields = [
      'clientName', 
      'startDate', 
      'endDate', 
      'venue', 
      'vendorId'
    ];
    
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Get or create client user
    let clientId = data.clientId;
    
    if (!clientId) {
      // Check if client already exists by email
      if (data.clientEmail) {
        const existingClient = await db.select({ id: users.id })
          .from(users)
          .where(eq(users.email, data.clientEmail))
          .limit(1);
        
        if (existingClient.length > 0) {
          clientId = existingClient[0].id;
          console.log('Found existing client with ID:', clientId);
        }
      }
      
      // If no existing client, create new one
      if (!clientId) {
        const [newUser] = await db.insert(users).values({
          email: data.clientEmail || `${data.clientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          firstName: data.clientName.split(' ')[0] || data.clientName,
          lastName: data.clientName.split(' ').slice(1).join(' ') || 'Client',
          password: 'temporary-password',
          accountType: 'CUSTOMER',
        }).returning();
        
        clientId = newUser.id;
        console.log('Created new client user with ID:', clientId);
      }
    }

    // Create event
    const [newEvent] = await db.insert(events).values({
      title: data.eventName || `${data.clientName}'s Event`,
      description: data.notes || '',
      location: data.venue,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      vendorId: data.vendorId,
    }).returning();

    console.log('Created event with ID:', newEvent.id);

    // Create booking
    const [newBooking] = await db.insert(bookings).values({
      eventId: newEvent.id,
      vendorId: data.vendorId,
      clientId: clientId,
      bookingDate: new Date(data.startDate),
      startTime: new Date(data.startDate),
      endTime: new Date(data.endDate),
      status: data.status || 'confirmed',
      paymentStatus: data.paymentStatus || 'pending',
      totalAmount: data.totalAmount || 0,
      notes: data.notes || null,
      discountCode: data.discountCode || null,
      discountAmount: data.discountAmount || 0,
      serviceId: data.serviceId || null,
      packageId: data.packageId || null,
    }).returning();

    console.log('Created booking with ID:', newBooking.id);

    // Get client info for response
    const client = await db.select({
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, clientId))
    .limit(1);

    // Format response for frontend - matching BookingDetailsModal expectations
    const bookingId = `BK-${newBooking.id.toString().padStart(6, '0')}`;
    const guestCount = data.guestCount || 0;
    const paymentStatus = data.paymentStatus || 'pending';
    const totalAmount = newBooking.totalAmount || 0;
    
    // Calculate balance amount
    const balanceAmount = paymentStatus === 'paid' ? 0 : totalAmount * 0.5;
    
    // Parse dates safely
    const startTime = new Date(data.startDate);
    const endTime = new Date(data.endDate);
    
    // Create payments array with proper types
    const payments: PaymentItem[] = [
      {
        type: 'paid',
        label: 'Deposit',
        amount: paymentStatus === 'paid' ? totalAmount : totalAmount * 0.5,
        date: format(new Date(), 'MMM d, yyyy')
      }
    ];
    
    if (paymentStatus === 'partial') {
      payments.push({
        type: 'due',
        label: 'Balance Due',
        amount: balanceAmount,
        date: format(addDays(new Date(), 7), 'MMM d, yyyy') // 7 days from now
      });
    }

    const formattedBooking = {
      id: newBooking.id.toString(),
      bookingId: bookingId,
      title: newEvent.title,
      status: newBooking.status as 'confirmed' | 'pending' | 'pending_payment' | 'cancelled',
      date: startTime,
      startDate: startTime,
      endDate: endTime,
      initials: client[0] ? 
        ((client[0].firstName?.charAt(0) || '') + (client[0].lastName?.charAt(0) || '')).toUpperCase() : 
        data.clientName.substring(0, 2).toUpperCase(),
      dateDisplay: format(startTime, 'MMM d'),
      client: {
        name: client[0] ? `${client[0].firstName} ${client[0].lastName}` : data.clientName,
        email: client[0]?.email || data.clientEmail || '',
        phone: data.clientPhone || '',
        rating: 4.5, // Default rating
        reviews: 12, // Default review count
      },
      guests: guestCount, // Using 'guests' field name
      guestCount: guestCount, // Also include guestCount
      totalAmount: totalAmount,
      venue: newEvent.location,
      dateRange: format(startTime, 'MMM d') + 
        (startTime.toDateString() === endTime.toDateString() 
          ? '' 
          : ` - ${format(endTime, 'MMM d')}`),
      timeRange: 'All Day',
      paymentStatus: paymentStatus,
      payments: payments,
      notes: newBooking.notes,
      // Additional fields for BookingDetailsModal
      conversationId: `conv-${newBooking.id}`,
      balanceAmount: balanceAmount,
      balanceDue: format(addDays(new Date(), 7), 'MMM d, yyyy'),
      latestMessage: {
        sender: client[0] ? `${client[0].firstName} ${client[0].lastName}` : data.clientName,
        time: 'Just now',
        content: 'Thank you for the booking!',
        attachment: null as string | null
      },
      invoiceId: `INV-${newBooking.id.toString().padStart(6, '0')}`,
      receiptIds: paymentStatus === 'paid' ? [`RCPT-${newBooking.id.toString().padStart(6, '0')}`] : []
    };

    return NextResponse.json(formattedBooking, { status: 201 });
    
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}