// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

// Validate database URL
function validateDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    console.error('Please add DATABASE_URL to your .env file:');
    console.error('Example: DATABASE_URL="postgresql://user:password@localhost:5432/eventbridge"');
    process.exit(1);
  }

  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    console.error('ERROR: DATABASE_URL must start with postgresql:// or postgres://');
    console.error('Current value:', databaseUrl.substring(0, 50) + '...');
    process.exit(1);
  }

  return databaseUrl;
}

export default defineConfig({
  // Required: Database dialect
  dialect: 'postgresql',
  
  // Required: Path to your schema file
  schema: './drizzle/schema.ts',
  
  // Required: Output directory for migrations
  out: './drizzle/migrations',
  
  // Optional: Safer migrations (creates breakpoints for data safety)
  breakpoints: true,
  
  // Optional: Verbose output in development
  verbose: process.env.NODE_ENV !== 'production',
  
  // Optional: Strict mode for better type safety
  strict: true,
  
  // Required: Database connection
  dbCredentials: {
    url: validateDatabaseUrl(),
  },
  
  // Optional: Filter out internal drizzle tables
  tablesFilter: ['!drizzle_*'],
  
  // Optional: Migration table configuration
  migrations: {
    table: 'migrations',
    schema: 'public',
  },
  
  // Optional: Column naming convention
  // Note: 'casing' is not a valid property, removed
  
  // Note: Removed 'schemaPush' as it's not a valid property in drizzle-kit
});