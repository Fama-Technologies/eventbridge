import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function testDatabase() {
  console.log("Testing database connection...");
  try {
    // Test basic connection
    const result = await db.execute(sql`SELECT NOW()`);
    console.log("✅ Database connected successfully");
    console.log("   Server time:", result.rows[0].now);
    
    // Check tables
    const tables = await db.execute(
      sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
    );
    console.log(`📊 Found ${tables.rows.length} tables`);
    
    if (tables.rows.length > 0) {
      console.log("\nTables:");
      tables.rows.forEach((row, i) => {
        console.log(`  ${i + 1}. ${row.table_name}`);
      });
    }
    
    // Check specific auth tables
    const authTables = ["users", "accounts", "sessions"];
    console.log("\n🔐 Checking auth tables:");
    for (const table of authTables) {
      const exists = tables.rows.some(row => row.table_name === table);
      console.log(`  ${table}: ${exists ? '✅ Found' : '❌ Missing'}`);
    }
    
    return true;
  } catch (error: any) {
    console.error("❌ Database connection failed:");
    console.error("   Error:", error.message);
    
    // Provide troubleshooting tips
    console.log("\n🔧 Troubleshooting:");
    console.log("   1. Check if DATABASE_URL is correct in .env");
    console.log("   2. Check if Neon database is running");
    console.log("   3. Check if your IP is allowed in Neon dashboard");
    console.log("   4. Run: npm run db:push");
    
    return false;
  }
}

// Run the test
testDatabase().then(success => {
  process.exit(success ? 0 : 1);
});
