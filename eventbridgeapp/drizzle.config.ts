// drizzle.config.ts
import type { Config } from 'drizzle-kit';
import { loadEnvConfig } from '@next/env';

// Load environment variables
const projectDir = process.cwd();
loadEnvConfig(projectDir);

export default {
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;