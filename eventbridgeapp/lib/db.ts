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
let sql: any = null;
let db: any = null;

if (databaseUrl) {
  try {
    sql = neon(databaseUrl, {
      fetchOptions: {
        cache: 'no-store',
      },
      fullResults: false,
    });
    db = drizzle({ client: sql, schema });
    console.log('Database client initialized');
  } catch (error) {
    console.error('Failed to initialize database client:', error);
  }
}

export { db, sql };