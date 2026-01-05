const { neon } = require('@neondatabase/serverless');
require('dotenv/config');

async function testDatabase() {
  console.log('Testing Neon database connection...');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set in environment variables');
    console.log('Make sure you have a .env file with DATABASE_URL');
    return false;
  }
  
  console.log('Using database URL:', databaseUrl.substring(0, 50) + '...');
  
  try {
    const sql = neon(databaseUrl);
    const result = await sql`SELECT NOW()`;
    console.log('✅ Connected to Neon!');
    console.log('   Server time:', result[0].now);
    
    // List tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log(`📊 Found ${tables.length} tables`);
    
    if (tables.length > 0) {
      console.log('\nFirst 10 tables:');
      tables.slice(0, 10).forEach((table, i) => {
        console.log(`  ${i + 1}. ${table.table_name}`);
      });
      
      if (tables.length > 10) {
        console.log(`  ... and ${tables.length - 10} more`);
      }
    }
    
    // Check for auth tables
    const authTables = ['users', 'accounts', 'sessions'];
    console.log('\n🔐 Checking auth tables:');
    for (const table of authTables) {
      const exists = tables.some(t => t.table_name === table);
      console.log(`  ${table}: ${exists ? '✅ Found' : '❌ Missing'}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('  1. Check if DATABASE_URL is correct in .env');
    console.log('  2. Check if Neon database is running');
    console.log('  3. Check if your IP is allowed in Neon dashboard');
    console.log('  4. Run: npm run db:push');
    return false;
  }
}

testDatabase().then(success => {
  process.exit(success ? 0 : 1);
});
