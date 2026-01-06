import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

async function runTest(name: string, test: () => Promise<boolean>): Promise<TestResult> {
  const start = Date.now();
  try {
    const passed = await test();
    return {
      name,
      passed,
      message: passed ? "Passed" : "Failed",
      duration: Date.now() - start,
    };
  } catch (error: any) {
    return {
      name,
      passed: false,
      message: error.message,
      duration: Date.now() - start,
    };
  }
}

async function testBackend() {
  console.log("🔍 Running backend tests...\n");
  
  const tests: TestResult[] = [];
  
  // Test 1: Database connection
  tests.push(await runTest("Database Connection", async () => {
    const result = await db.execute(sql`SELECT 1 as test`);
    return result.rows.length > 0;
  }));
  
  // Test 2: Auth tables exist
  tests.push(await runTest("Auth Tables", async () => {
    const result = await db.execute(
      sql`SELECT COUNT(*) as count FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('users', 'accounts', 'sessions')`
    );
    return parseInt(result.rows[0].count) === 3;
  }));
  
  // Test 3: Check users table structure
  tests.push(await runTest("Users Table Structure", async () => {
    const result = await db.execute(
      sql`SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name IN ('email', 'password', 'account_type')`
    );
    return result.rows.length >= 3;
  }));
  
  // Test 4: Environment variables
  tests.push(await runTest("Environment Variables", async () => {
    const required = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];
    const missing = required.filter(varName => !process.env[varName]);
    if (missing.length > 0) {
      throw new Error(`Missing: ${missing.join(", ")}`);
    }
    return true;
  }));
  
  // Display results
  console.log("📊 Test Results:");
  console.log("=".repeat(50));
  
  let passedCount = 0;
  tests.forEach((test, i) => {
    const symbol = test.passed ? "✅" : "❌";
    console.log(`${i + 1}. ${symbol} ${test.name}`);
    console.log(`   ${test.message} (${test.duration}ms)`);
    if (!test.passed) {
      console.log(`   🔍 ${test.message}`);
    }
    console.log();
    if (test.passed) passedCount++;
  });
  
  console.log("=".repeat(50));
  console.log(`🎯 ${passedCount}/${tests.length} tests passed`);
  
  if (passedCount === tests.length) {
    console.log("\n🚀 Backend is fully functional!");
    
    // Show database info
    const dbInfo = await db.execute(sql`SELECT version(), current_database()`);
    console.log(`\n📦 Database: ${dbInfo.rows[0].current_database}`);
    console.log(`🔧 Version: ${dbInfo.rows[0].version.split(",")[0]}`);
    
    // Show table counts
    const tables = await db.execute(
      sql`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'`
    );
    console.log(`📊 Tables: ${tables.rows[0].count}`);
    
  } else {
    console.log("\n⚠️  Some tests failed. Check the errors above.");
    process.exit(1);
  }
}

// Run tests
testBackend().catch(error => {
  console.error("Test suite failed:", error);
  process.exit(1);
});
