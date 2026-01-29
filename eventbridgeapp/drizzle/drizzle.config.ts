// drizzle.config.ts
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export default {
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql', // Changed from 'driver' to 'dialect' for v0.22+
  dbCredentials: {
    url: process.env.DATABASE_URL, // Changed from 'connectionString' to 'url'
  },
  verbose: true,
  strict: true,
};