import { db } from '@/lib/db';
import { users, vendorProfiles } from '@/drizzle/schema';
import { hash } from 'bcryptjs';

async function seedDatabase() {
  console.log('Seeding database...');
  
  try {
    // Create admin user
    const adminPassword = await hash('admin123', 10);
    
    const [admin] = await db.insert(users).values({
      email: 'admin@eventbridge.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      provider: 'local',
      accountType: 'ADMIN',
      emailVerified: true,
      isActive: true,
    }).returning({ id: users.id });
    
    console.log('Admin user created:');
    console.log('  Email: admin@eventbridge.com');
    console.log('  Password: admin123');
    
    // Create vendor user
    const vendorPassword = await hash('vendor123', 10);
    
    const [vendor] = await db.insert(users).values({
      email: 'vendor@eventbridge.com',
      password: vendorPassword,
      firstName: 'Event',
      lastName: 'Vendor',
      provider: 'local',
      accountType: 'VENDOR',
      emailVerified: true,
      isActive: true,
    }).returning({ id: users.id });
    
    console.log('Vendor user created:');
    console.log('  Email: vendor@eventbridge.com');
    console.log('  Password: vendor123');
    
    // Create vendor profile
    await db.insert(vendorProfiles).values({
      userId: vendor.id,
      businessName: 'Premium Event Services',
      description: 'Professional event planning and coordination',
      isVerified: true,
      verificationStatus: 'approved',
      canAccessDashboard: true,
    });
    
    console.log('Vendor profile created');
    
    // Create customer user
    const customerPassword = await hash('customer123', 10);
    
    const [customer] = await db.insert(users).values({
      email: 'customer@eventbridge.com',
      password: customerPassword,
      firstName: 'Event',
      lastName: 'Planner',
      provider: 'local',
      accountType: 'CUSTOMER',
      emailVerified: true,
      isActive: true,
    }).returning({ id: users.id });
    
    console.log('Customer user created:');
    console.log('  Email: customer@eventbridge.com');
    console.log('  Password: customer123');
    
    console.log('');
    console.log('Seeding complete!');
    console.log('');
    console.log('Test credentials:');
    console.log('  Admin:    admin@eventbridge.com / admin123');
    console.log('  Vendor:   vendor@eventbridge.com / vendor123');
    console.log('  Customer: customer@eventbridge.com / customer123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
