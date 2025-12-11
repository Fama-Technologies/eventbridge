import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",          // ✅ REQUIRED
  dbCredentials: {
    url: process.env.DATABASE_URL!,   // must exist in .env
  },
});
