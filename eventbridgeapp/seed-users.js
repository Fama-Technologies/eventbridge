const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
require('dotenv/config');

async function seedUsers() {
  console.log('Starting user seed...');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL is not set in environment variables');
    console.log('Make sure you have a .env file with DATABASE_URL');
    process.exit(1);
  }
  
  console.log('Using database:', databaseUrl.substring(0, 50) + '...');
  
  try {
    const sql = neon(databaseUrl);
    
    console.log('Creating test users...');
    
    // 1. Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await sql`
      INSERT INTO users (
        email, password, first_name, last_name, 
        provider, account_type, email_verified, is_active,
        created_at, updated_at
      ) VALUES (
        'admin@eventbridge.com', ${adminPassword}, 'Admin', 'User',
        'local', 'ADMIN', true, true,
        NOW(), NOW()
      )
      ON CONFLICT (email) DO NOTHING
    `;
    console.log('✓ Admin user created/verified');
    
    // 2. Create vendor user
    const vendorPassword = await bcrypt.hash('vendor123', 10);
    await sql`
      INSERT INTO users (
        email, password, first_name, last_name, 
        provider, account_type, email_verified, is_active,
        created_at, updated_at
      ) VALUES (
        'vendor@eventbridge.com', ${vendorPassword}, 'Event', 'Vendor',
        'local', 'VENDOR', true, true,
        NOW(), NOW()
      )
      ON CONFLICT (email) DO NOTHING
    `;
    console.log('✓ Vendor user created/verified');
    
    // 3. Get vendor ID for profile
    const vendorResult = await sql`
      SELECT id FROM users WHERE email = 'vendor@eventbridge.com'
    `;
    
    if (vendorResult.length > 0) {
      await sql`
        INSERT INTO vendor_profiles (
          user_id, business_name, description, is_verified, 
          verification_status, can_access_dashboard,
          created_at, updated_at
        ) VALUES (
          ${vendorResult[0].id}, 'Premium Event Services', 
          'Professional event planning and coordination',
          true, 'approved', true,
          NOW(), NOW()
        )
        ON CONFLICT (user_id) DO NOTHING
      `;
      console.log('✓ Vendor profile created/verified');
    }
    
    // 4. Create customer user
    const customerPassword = await bcrypt.hash('customer123', 10);
    await sql`
      INSERT INTO users (
        email, password, first_name, last_name, 
        provider, account_type, email_verified, is_active,
        created_at, updated_at
      ) VALUES (
        'customer@eventbridge.com', ${customerPassword}, 'Event', 'Planner',
        'local', 'CUSTOMER', true, true,
        NOW(), NOW()
      )
      ON CONFLICT (email) DO NOTHING
    `;
    console.log('✓ Customer user created/verified');
    
    // 5. Create planner user
    const plannerPassword = await bcrypt.hash('planner123', 10);
    await sql`
      INSERT INTO users (
        email, password, first_name, last_name, 
        provider, account_type, email_verified, is_active,
        created_at, updated_at
      ) VALUES (
        'planner@eventbridge.com', ${plannerPassword}, 'Professional', 'Planner',
        'local', 'PLANNER', true, true,
        NOW(), NOW()
      )
      ON CONFLICT (email) DO NOTHING
    `;
    console.log('✓ Planner user created/verified');
    
    console.log('');
    console.log('================================');
    console.log('SEED COMPLETE!');
    console.log('================================');
    console.log('');
    console.log('Test credentials:');
    console.log('  Admin:    admin@eventbridge.com / admin123');
    console.log('  Vendor:   vendor@eventbridge.com / vendor123');
    console.log('  Customer: customer@eventbridge.com / customer123');
    console.log('  Planner:  planner@eventbridge.com / planner123');
    console.log('');
    console.log('Total users in database:');
    const count = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`  ${count[0].count} users`);
    
  } catch (error) {
    console.error('SEED ERROR:', error.message);
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Make sure database tables exist (run: npm run db:push)');
    console.log('2. Check DATABASE_URL in .env file');
    console.log('3. Check if Neon database is accessible');
    process.exit(1);
  }
}

// Run the seed
seedUsers();
