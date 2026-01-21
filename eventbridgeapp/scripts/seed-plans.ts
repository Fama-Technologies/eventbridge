// scripts/seed-plans.ts
import { db } from '@/lib/db';
import { subscriptionPlans } from '@/drizzle/schema';

async function seedPlans() {
  const plans = [
    {
      name: 'free',
      displayName: 'Free Plan',
      description: 'Basic features for getting started',
      priceMonthly: 0,
      priceYearly: 0,
      currency: 'UGX',
      billingCycle: 'monthly',
      features: {
        leads: true,
        invoices: true,
        profileListing: true,
        profileViews: true,
        ratings: true,
        responseRateDashboard: true,
        earningsDashboard: true,
        chatMessaging: true,
        bookingsCalendar: 'limited',
        customerInsights: false,
        topListing: false,
        topRecommendation: false,
        portfolioBoost: false,
      },
      limits: {
        maxLeads: 15,
        maxInvoices: 15,
        maxPackages: 2,
        maxImages: 5,
        maxVideos: 5,
        maxServicePackages: 2,
      }
    },
    {
      name: 'pro',
      displayName: 'Pro Plan',
      description: 'Unlimited features for growing businesses',
      priceMonthly: 35000,
      priceYearly: 420000,
      currency: 'UGX',
      billingCycle: 'monthly',
      features: {
        leads: true,
        invoices: true,
        profileListing: true,
        profileViews: true,
        ratings: true,
        responseRateDashboard: true,
        earningsDashboard: true,
        chatMessaging: true,
        bookingsCalendar: 'full',
        customerInsights: false,
        topListing: false,
        topRecommendation: false,
        portfolioBoost: false,
        unlimitedPhotosVideos: true,
        unlimitedServicePackages: true,
        unlimitedLeads: true,
        unlimitedInvoices: true,
      },
      limits: {
        maxLeads: null, // unlimited
        maxInvoices: null,
        maxPackages: null,
        maxImages: null,
        maxVideos: null,
        maxServicePackages: null,
      }
    },
    {
      name: 'business_pro',
      displayName: 'Business Pro Plan',
      description: 'Premium features for established businesses',
      priceMonthly: 52500,
      priceYearly: 630000,
      currency: 'UGX',
      billingCycle: 'monthly',
      features: {
        leads: true,
        invoices: true,
        profileListing: true,
        profileViews: true,
        ratings: true,
        responseRateDashboard: true,
        earningsDashboard: true,
        chatMessaging: true,
        bookingsCalendar: 'full',
        customerInsights: true,
        topListing: true,
        topRecommendation: true,
        portfolioBoost: true,
        unlimitedPhotosVideos: true,
        unlimitedServicePackages: true,
        unlimitedLeads: true,
        unlimitedInvoices: true,
        trendsAnalytics: true,
      },
      limits: {
        maxLeads: null,
        maxInvoices: null,
        maxPackages: null,
        maxImages: null,
        maxVideos: null,
        maxServicePackages: null,
      }
    }
  ];

  for (const plan of plans) {
    await db.insert(subscriptionPlans).values(plan).onConflictDoNothing();
  }
  
  console.log('Plans seeded successfully');
}

seedPlans().catch(console.error);