// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  breakpoints: false,
  verbose: true,
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});