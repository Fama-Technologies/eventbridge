// scripts/update-vendors-visibility.ts
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { vendorProfiles, verificationDocuments } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in environment variables');
  console.error('Current .env files checked: .env.local, .env');
  console.error('Please add it to your .env file:');
  console.error('DATABASE_URL="postgresql://username:password@localhost:5432/dbname"');
  process.exit(1);
}

console.log('Database URL found:', process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@'));

async function updateExistingVendorsVisibility() {
  try {
    // Create a direct database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    const db = drizzle(pool);
    
    console.log('Starting to update existing vendors visibility...');
    
    // Get all vendor profiles
    const allVendors = await db.select().from(vendorProfiles);
    
    console.log(`Found ${allVendors.length} vendor profiles to update`);
    
    let updatedCount = 0;
    let documentUpdatedCount = 0;
    
    for (const vendor of allVendors) {
      // Update vendor profile to be visible
      await db
        .update(vendorProfiles)
        .set({
          isVerified: true,
          verificationStatus: 'approved',
          verificationReviewedAt: new Date(),
          canAccessDashboard: true,
          updatedAt: new Date(),
        })
        .where(eq(vendorProfiles.id, vendor.id));
      
      updatedCount++;
      
      // Also update their verification documents if they exist
      await db
        .update(verificationDocuments)
        .set({
          status: 'approved',
        })
        .where(eq(verificationDocuments.vendorId, vendor.id));
        
      documentUpdatedCount++;
      
      if (updatedCount % 10 === 0) {
        console.log(`Updated ${updatedCount} vendors...`);
      }
    }
    
    console.log('=========================================');
    console.log('UPDATE COMPLETE');
    console.log(`Updated ${updatedCount} vendor profiles to be visible`);
    console.log(`Updated ${documentUpdatedCount} verification documents`);
    console.log('All existing vendors are now visible on the landing page');
    console.log('=========================================');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error updating vendors:', error);
    process.exit(1);
  }
}

updateExistingVendorsVisibility();