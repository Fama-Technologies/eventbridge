// lib/subscription-utils.ts
import { db } from '@/lib/db';
import { vendorSubscriptions, subscriptionPlans, vendorUsage } from '@/drizzle/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

interface UsageLimits {
  maxLeads?: number | null;
  maxInvoices?: number | null;
  maxPackages?: number | null;
  maxImages?: number | null;
  maxVideos?: number | null;
  maxServicePackages?: number | null;
}

interface FeatureAccess {
  canUploadImages: boolean;
  canUploadVideos: boolean;
  canCreatePackages: boolean;
  canAccessFullCalendar: boolean;
  canAccessCustomerInsights: boolean;
  hasTopListing: boolean;
  hasTopRecommendation: boolean;
  hasPortfolioBoost: boolean;
  maxPackagesAllowed: number;
  maxImagesAllowed: number;
  maxVideosAllowed: number;
}

export async function getVendorSubscription(vendorId: number) {
  const now = new Date();
  
  const subscription = await db
    .select({
      subscription: vendorSubscriptions,
      plan: subscriptionPlans,
    })
    .from(vendorSubscriptions)
    .innerJoin(subscriptionPlans, eq(vendorSubscriptions.planId, subscriptionPlans.id))
    .where(
      and(
        eq(vendorSubscriptions.vendorId, vendorId),
        eq(vendorSubscriptions.status, 'active'),
        lte(vendorSubscriptions.currentPeriodStart, now),
        gte(vendorSubscriptions.currentPeriodEnd, now)
      )
    )
    .limit(1);

  return subscription[0] || null;
}

export async function getVendorUsage(vendorId: number, monthYear?: string) {
  const currentMonth = monthYear || new Date().toISOString().slice(0, 7); // YYYY-MM
  
  const usage = await db
    .select()
    .from(vendorUsage)
    .where(
      and(
        eq(vendorUsage.vendorId, vendorId),
        eq(vendorUsage.monthYear, currentMonth)
      )
    )
    .limit(1);

  return usage[0] || null;
}

export async function incrementUsage(
  vendorId: number, 
  field: 'leadsUsed' | 'invoicesUsed' | 'packagesCreated' | 'imagesUploaded' | 'videosUploaded',
  amount: number = 1
) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const existingUsage = await getVendorUsage(vendorId, currentMonth);
  
  if (existingUsage) {
    const currentValue = existingUsage.usageData[field] || 0;
    await db
      .update(vendorUsage)
      .set({
        usageData: {
          ...existingUsage.usageData,
          [field]: currentValue + amount
        },
        updatedAt: new Date(),
      })
      .where(eq(vendorUsage.id, existingUsage.id));
  } else {
    await db.insert(vendorUsage).values({
      vendorId,
      monthYear: currentMonth,
      usageData: {
        [field]: amount
      },
    });
  }
}

export async function checkFeatureAccess(vendorId: number): Promise<FeatureAccess> {
  const subscriptionData = await getVendorSubscription(vendorId);
  const usage = await getVendorUsage(vendorId);
  
  // Default to free plan if no subscription
  if (!subscriptionData) {
    return {
      canUploadImages: true,
      canUploadVideos: true,
      canCreatePackages: true,
      canAccessFullCalendar: false,
      canAccessCustomerInsights: false,
      hasTopListing: false,
      hasTopRecommendation: false,
      hasPortfolioBoost: false,
      maxPackagesAllowed: 2,
      maxImagesAllowed: 5,
      maxVideosAllowed: 5,
    };
  }

  const { plan, subscription } = subscriptionData;
  const limits = plan.limits as UsageLimits;
  const features = plan.features as Record<string, any>;
  
  // Calculate current usage
  const currentPackages = usage?.usageData.packagesCreated || 0;
  const currentImages = usage?.usageData.imagesUploaded || 0;
  const currentVideos = usage?.usageData.videosUploaded || 0;

  return {
    canUploadImages: limits.maxImages === null || currentImages < (limits.maxImages || 0),
    canUploadVideos: limits.maxVideos === null || currentVideos < (limits.maxVideos || 0),
    canCreatePackages: limits.maxPackages === null || currentPackages < (limits.maxPackages || 0),
    canAccessFullCalendar: features.bookingsCalendar === 'full',
    canAccessCustomerInsights: features.customerInsights === true,
    hasTopListing: features.topListing === true,
    hasTopRecommendation: features.topRecommendation === true,
    hasPortfolioBoost: features.portfolioBoost === true,
    maxPackagesAllowed: limits.maxPackages || 0,
    maxImagesAllowed: limits.maxImages || 0,
    maxVideosAllowed: limits.maxVideos || 0,
  };
}

export async function canCreatePackage(vendorId: number): Promise<{ allowed: boolean; reason?: string }> {
  const featureAccess = await checkFeatureAccess(vendorId);
  const usage = await getVendorUsage(vendorId);
  
  const currentPackages = usage?.usageData.packagesCreated || 0;
  
  if (!featureAccess.canCreatePackages) {
    return {
      allowed: false,
      reason: `You have reached the maximum limit of ${featureAccess.maxPackagesAllowed} packages on your current plan.`
    };
  }
  
  if (currentPackages >= featureAccess.maxPackagesAllowed) {
    return {
      allowed: false,
      reason: `You have reached the maximum limit of ${featureAccess.maxPackagesAllowed} packages.`
    };
  }
  
  return { allowed: true };
}

export async function canUploadMedia(vendorId: number, type: 'image' | 'video'): Promise<{ allowed: boolean; reason?: string }> {
  const featureAccess = await checkFeatureAccess(vendorId);
  const usage = await getVendorUsage(vendorId);
  
  if (type === 'image') {
    const currentImages = usage?.usageData.imagesUploaded || 0;
    if (!featureAccess.canUploadImages || currentImages >= featureAccess.maxImagesAllowed) {
      return {
        allowed: false,
        reason: `You have reached the maximum limit of ${featureAccess.maxImagesAllowed} images on your current plan.`
      };
    }
  } else {
    const currentVideos = usage?.usageData.videosUploaded || 0;
    if (!featureAccess.canUploadVideos || currentVideos >= featureAccess.maxVideosAllowed) {
      return {
        allowed: false,
        reason: `You have reached the maximum limit of ${featureAccess.maxVideosAllowed} videos on your current plan.`
      };
    }
  }
  
  return { allowed: true };
}