require('dotenv/config');

async function runSeed() {
  try {
    // Import the seed module
    const { seedDatabase } = require('./drizzle/seed.js');
    await seedDatabase();
  } catch (error) {
    console.error('Failed to run seed:', error);
    process.exit(1);
  }
}

runSeed();
