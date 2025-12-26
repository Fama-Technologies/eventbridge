// drizzle.config.ts
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default {
  schema: './drizzle/schema.ts',  // Changed from "./src/db/schema.ts"
  out: './drizzle/migrations',    // Changed from "./drizzle" (better organization)
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;