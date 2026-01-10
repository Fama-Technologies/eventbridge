// scripts/check-data.js
const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

const sql = neon(process.env.DATABASE_URL);

async function checkData() {
  console.log("Checking database content...\n");
  
  try {
    // 1. Check users
    console.log("1. Users:");
    const users = await sql`SELECT id, email, account_type, created_at FROM users ORDER BY id`;
    users.forEach(user => {
      console.log(`  ${user.id}. ${user.email} (${user.account_type}) - ${new Date(user.created_at).toLocaleDateString()}`);
    });
    console.log(`Total users: ${users.length}\n`);
    
    // 2. Check vendor profiles
    console.log("2. Vendor Profiles:");
    const vendors = await sql`SELECT id, user_id, business_name, verification_status, is_verified FROM vendor_profiles ORDER BY id`;
    vendors.forEach(vendor => {
      console.log(`  ${vendor.id}. ${vendor.business_name} (User: ${vendor.user_id}) - Status: ${vendor.verification_status} - Verified: ${vendor.is_verified}`);
    });
    console.log(`Total vendor profiles: ${vendors.length}\n`);
    
    // 3. Check event categories
    console.log("3. Event Categories:");
    const categories = await sql`SELECT id, name, description FROM event_categories ORDER BY name`;
    categories.forEach(category => {
      console.log(`  ${category.id}. ${category.name} - ${category.description || "No description"}`);
    });
    console.log(`Total categories: ${categories.length}\n`);
    
    // 4. Check vendor services
    console.log("4. Vendor Services:");
    try {
      const services = await sql`SELECT id, vendor_id, name, price FROM vendor_services ORDER BY vendor_id`;
      services.forEach(service => {
        console.log(`  ${service.id}. ${service.name} (Vendor: ${service.vendor_id}) - $${service.price}`);
      });
      console.log(`Total services: ${services.length}\n`);
    } catch (error) {
      console.log("  No vendor services found or table doesn't exist.\n");
    }
    
    // 5. Check events
    console.log("5. Events:");
    try {
      const events = await sql`SELECT id, title, vendor_id, start_date FROM events ORDER BY start_date`;
      events.forEach(event => {
        console.log(`  ${event.id}. ${event.title} (Vendor: ${event.vendor_id}) - ${new Date(event.start_date).toLocaleDateString()}`);
      });
      console.log(`Total events: ${events.length}\n`);
    } catch (error) {
      console.log("  No events found or table doesn't exist.\n");
    }
    
    // Summary
    console.log("=== SUMMARY ===");
    console.log(`Users: ${users.length}`);
    console.log(`Vendor Profiles: ${vendors.length}`);
    console.log(`Approved Vendors: ${vendors.filter(v => v.verification_status === 'approved').length}`);
    console.log(`Event Categories: ${categories.length}`);
    
  } catch (error) {
    console.error("Error checking data:", error);
  }
}

checkData();
