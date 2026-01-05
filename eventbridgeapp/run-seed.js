require('dotenv/config');

async function runSeed() {
  try {
    // Import the seed module
    const module = await import('./drizzle/seed.ts');
    await module.seedDatabase();
  } catch (error) {
    console.error('Failed to run seed:', error);
    process.exit(1);
  }
}

runSeed();
