import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@/drizzle/schema';

// Defer database connection initialization to runtime to allow builds without DATABASE_URL
function createDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in environment variables');
  }

  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
}

// Create a lazy-initialized database connection
let dbInstance: ReturnType<typeof createDb> | null = null;

function getDb() {
  if (!dbInstance) {
    dbInstance = createDb();
  }
  return dbInstance;
}

// Export a proxy that defers initialization until first use
export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(target, prop) {
    const database = getDb();
    const value = database[prop as keyof typeof database];
    return typeof value === 'function' ? value.bind(database) : value;
  }
});
