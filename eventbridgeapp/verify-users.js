const { neon } = require('@neondatabase/serverless');
require('dotenv/config');

async function verifyUsers() {
  console.log('Verifying seeded users...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL not set');
    process.exit(1);
  }
  
  const sql = neon(databaseUrl);
  
  try {
    // Check all users
    const users = await sql`
      SELECT id, email, account_type, email_verified, is_active
      FROM users 
      ORDER BY email
    `;
    
    console.log(`Found ${users.length} total users:`);
    console.log('');
    
    users.forEach(user => {
      console.log(`  ${user.email}`);
      console.log(`    ID: ${user.id}, Type: ${user.account_type}`);
      console.log(`    Verified: ${user.email_verified}, Active: ${user.is_active}`);
      console.log('');
    });
    
    // Check specific test users
    const testUsers = ['admin@eventbridge.com', 'vendor@eventbridge.com', 'customer@eventbridge.com', 'planner@eventbridge.com'];
    console.log('Checking test users:');
    
    for (const email of testUsers) {
      const result = await sql`
        SELECT * FROM users WHERE email = ${email}
      `;
      
      if (result.length > 0) {
        console.log(`  ✓ ${email} - EXISTS`);
      } else {
        console.log(`  ✗ ${email} - MISSING`);
      }
    }
    
    // Check vendor profile
    const vendorProfile = await sql`
      SELECT vp.*, u.email 
      FROM vendor_profiles vp
      JOIN users u ON u.id = vp.user_id
      WHERE u.email = 'vendor@eventbridge.com'
    `;
    
    console.log('');
    if (vendorProfile.length > 0) {
      console.log('✓ Vendor profile exists:');
      console.log(`  Business: ${vendorProfile[0].business_name}`);
      console.log(`  Verified: ${vendorProfile[0].is_verified}`);
    } else {
      console.log('✗ Vendor profile missing');
    }
    
    // Check table counts with proper syntax
    console.log('');
    console.log('Database statistics:');
    
    const tables = ['users', 'accounts', 'sessions', 'vendor_profiles', 'events', 'bookings'];
    
    for (const table of tables) {
      try {
        // Use parameterized query
        const result = await sql`SELECT COUNT(*) as count FROM public.${sql(table)}`;
        console.log(`  ${table}: ${result[0].count} rows`);
      } catch (error) {
        console.log(`  ${table}: 0 rows (or error)`);
      }
    }
    
  } catch (error) {
    console.error('Verification error:', error.message);
  }
}

verifyUsers();
