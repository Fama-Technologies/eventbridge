// scripts/seed-categories.js
const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

const sql = neon(process.env.DATABASE_URL);

async function seedCategories() {
  console.log("Seeding event categories...");
  
  try {
    // First check if table exists by trying to select from it
    try {
      await sql`SELECT 1 FROM event_categories LIMIT 1`;
    } catch (error) {
      console.log("event_categories table might not exist. Creating it first...");
      // You might need to run migrations first
      return;
    }
    
    // Check if categories exist
    const result = await sql`SELECT COUNT(*) as count FROM event_categories`;
    const count = parseInt(result[0].count);
    
    if (count === 0) {
      console.log("No categories found. Seeding...");
      
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
      console.log(`Event categories already exist (${count} found)`);
    }
    
    // Show final count
    const finalResult = await sql`SELECT COUNT(*) as count FROM event_categories`;
    console.log(`Total event categories: ${finalResult[0].count}`);
    
  } catch (error) {
    console.error("Error seeding categories:", error);
  }
}

seedCategories();
