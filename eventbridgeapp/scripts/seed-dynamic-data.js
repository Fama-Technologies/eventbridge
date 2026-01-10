// scripts/seed-dynamic-data.js
const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

const sql = neon(process.env.DATABASE_URL);

async function seedDynamicData() {
  console.log("Seeding dynamic data...");
  
  try {
    // 1. Check for vendor users
    console.log("1. Checking for vendor users...");
    const vendorUsers = await sql`SELECT id, email, first_name, last_name FROM users WHERE account_type = 'VENDOR' LIMIT 5`;
    
    console.log(`Found ${vendorUsers.length} vendor users`);
    
    // 2. Ensure vendor profiles exist
    if (vendorUsers.length > 0) {
      console.log("2. Ensuring vendor profiles exist...");
      for (const user of vendorUsers) {
        const existingProfile = await sql`SELECT id FROM vendor_profiles WHERE user_id = ${user.id}`;
        
        if (existingProfile.length === 0) {
          console.log(`Creating vendor profile for user ${user.id} (${user.email})`);
          const businessName = user.first_name + " " + user.last_name + " Events";
          const description = "Professional event services by " + user.first_name + " " + user.last_name + ". Specializing in high-quality event planning and coordination.";
          
          await sql`
            INSERT INTO vendor_profiles (
              user_id, 
              business_name,
              description,
              city,
              state,
              verification_status,
              is_verified,
              rating,
              review_count,
              created_at,
              updated_at
            ) VALUES (
              ${user.id},
              ${businessName},
              ${description},
              'New York',
              'NY',
              'approved',
              true,
              ${Math.floor(Math.random() * 2) + 4},
              ${Math.floor(Math.random() * 100) + 10},
              NOW(),
              NOW()
            )
          `;
        }
      }
    }
    
    // 3. Seed event categories
    console.log("3. Seeding event categories...");
    try {
      const existingCategories = await sql`SELECT COUNT(*) FROM event_categories`;
      
      if (existingCategories[0].count === 0) {
        const categories = [
          { name: "Wedding", description: "Wedding planning and services", icon: "wedding" },
          { name: "Corporate", description: "Corporate events and conferences", icon: "corporate" },
          { name: "Birthday", description: "Birthday parties and celebrations", icon: "birthday" },
          { name: "Conference", description: "Professional conferences and seminars", icon: "conference" },
          { name: "Concert", description: "Music concerts and performances", icon: "concert" },
          { name: "Festival", description: "Festivals and cultural events", icon: "festival" },
          { name: "Charity", description: "Charity and fundraising events", icon: "charity" },
          { name: "Sports", description: "Sports events and tournaments", icon: "sports" },
          { name: "Networking", description: "Networking and social events", icon: "networking" },
          { name: "Exhibition", description: "Exhibitions and trade shows", icon: "exhibition" },
        ];

        for (const category of categories) {
          await sql`
            INSERT INTO event_categories (name, description, icon, created_at)
            VALUES (${category.name}, ${category.description}, ${category.icon}, NOW())
          `;
        }
        console.log(`Added ${categories.length} event categories`);
      } else {
        console.log(`Event categories already exist (${existingCategories[0].count} found)`);
      }
    } catch (error) {
      console.log("event_categories table might not exist yet:", error.message);
    }
    
    console.log("Dynamic data seeding completed!");
    
    // Show summary
    console.log("\nDatabase Summary:");
    const summary = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT COUNT(*) as count FROM vendor_profiles`,
      sql`SELECT COUNT(*) as count FROM event_categories`.catch(() => [{ count: 0 }]),
      sql`SELECT COUNT(*) as count FROM vendor_services`.catch(() => [{ count: 0 }]),
      sql`SELECT COUNT(*) as count FROM events`.catch(() => [{ count: 0 }]),
    ]);
    
    console.log(`Users: ${summary[0][0].count}`);
    console.log(`Vendor Profiles: ${summary[1][0].count}`);
    console.log(`Event Categories: ${summary[2][0].count}`);
    console.log(`Vendor Services: ${summary[3][0].count}`);
    console.log(`Events: ${summary[4][0].count}`);

  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedDynamicData();
