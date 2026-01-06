import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  vendorProfiles, 
  users, 
  vendorServices, 
  vendorPackages,
  vendorPortfolio 
} from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

// GET vendor profile by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vendorId = parseInt(params.id);
    
    if (isNaN(vendorId)) {
      return NextResponse.json(
        { error: 'Invalid vendor ID' },
        { status: 400 }
      );
    }

    // Fetch vendor profile with user details
    const vendorData = await db
      .select({
        id: vendorProfiles.id,
        userId: vendorProfiles.userId,
        businessName: vendorProfiles.businessName,
        description: vendorProfiles.description,
        phone: vendorProfiles.phone,
        website: vendorProfiles.website,
        address: vendorProfiles.address,
        city: vendorProfiles.city,
        state: vendorProfiles.state,
        zipCode: vendorProfiles.zipCode,
        serviceRadius: vendorProfiles.serviceRadius,
        yearsExperience: vendorProfiles.yearsExperience,
        hourlyRate: vendorProfiles.hourlyRate,
        isVerified: vendorProfiles.isVerified,
        rating: vendorProfiles.rating,
        reviewCount: vendorProfiles.reviewCount,
        profileImage: vendorProfiles.profileImage,
        coverImage: vendorProfiles.coverImage,
        verificationStatus: vendorProfiles.verificationStatus,
        createdAt: vendorProfiles.createdAt,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
      })
      .from(vendorProfiles)
      .leftJoin(users, eq(vendorProfiles.userId, users.id))
      .where(eq(vendorProfiles.id, vendorId))
      .limit(1);

    if (!vendorData.length) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    const vendor = vendorData[0];

    // Fetch vendor services
    const services = await db
      .select()
      .from(vendorServices)
      .where(eq(vendorServices.vendorId, vendorId));

    // Fetch vendor packages
    const packages = await db
      .select()
      .from(vendorPackages)
      .where(eq(vendorPackages.vendorId, vendorId));

    // Fetch vendor portfolio images
    const portfolio = await db
      .select()
      .from(vendorPortfolio)
      .where(eq(vendorPortfolio.vendorId, vendorId));

    // Format response
    const response = {
      id: vendor.id.toString(),
      name: vendor.businessName || `${vendor.userFirstName} ${vendor.userLastName}`,
      category: services.length > 0 ? services[0].name : 'Event Services',
      location: vendor.city || 'Kampala',
      country: vendor.state || 'Uganda',
      rating: (vendor.rating || 0) / 100, // Convert from integer to decimal
      reviewCount: vendor.reviewCount || 0,
      isVerified: vendor.isVerified || false,
      startingPrice: vendor.hourlyRate || 0,
      priceUnit: 'event',
      yearsExperience: vendor.yearsExperience || 0,
      responseTime: '<1h',
      availability: 'Available this month',
      guestCapacity: '100+',
      description: vendor.description || '',
      images: portfolio.length > 0 
        ? portfolio.map((p: any) => p.imageUrl)
        : [vendor.coverImage || '/categories/weddings.jpg'],
      packages: packages.map((pkg: any) => ({
        id: pkg.id.toString(),
        name: pkg.name,
        description: pkg.description || '',
        price: pkg.price,
        priceType: pkg.price > 0 ? 'fixed' : 'custom',
        features: (pkg.features as string[]) || [],
        badge: pkg.isPopular ? 'Popular' : undefined,
      })),
      services: services.map((svc: any) => ({
        id: svc.id.toString(),
        name: svc.name,
        description: svc.description || '',
        price: svc.price || 0,
        duration: svc.duration || 0,
      })),
      contact: {
        phone: vendor.phone,
        email: vendor.userEmail,
        website: vendor.website,
      },
      address: {
        street: vendor.address,
        city: vendor.city,
        state: vendor.state,
        zipCode: vendor.zipCode,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
