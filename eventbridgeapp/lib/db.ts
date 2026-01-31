import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/drizzle/schema';

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set in environment variables');
    console.error('Please add it to your .env file:');
    console.error('DATABASE_URL="postgresql://user:pass@host/db"');
    return '';
  }
  return url;
}

const databaseUrl = getDatabaseUrl();

// Create a fresh database client for each request (recommended for Neon + Next.js)
export function getDb() {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured');
  }
  
  const sql = neon(databaseUrl, {
    fetchOptions: {
      cache: 'no-store',
      timeout: 15000, // 15 second timeout
      retry: {
        retries: 5,
        backoff: (attempt: number) => Math.min(200 * Math.pow(2, attempt), 2000),
      },
    },
    fullResults: false,
  });
  
  return drizzle({ client: sql, schema });
}

// Keep the singleton for backward compatibility
let db: any = null;

if (databaseUrl) {
  try {
    const sql = neon(databaseUrl, {
      fetchOptions: {
        cache: 'no-store',
        timeout: 15000,
        retry: {
          retries: 5,
          backoff: (attempt: number) => Math.min(200 * Math.pow(2, attempt), 2000),
        },
      },
      fullResults: false,
    });
    db = drizzle({ client: sql, schema });
    console.log('Database client initialized');
  } catch (error) {
    console.error('Failed to initialize database client:', error);
  }
}

export { db };
