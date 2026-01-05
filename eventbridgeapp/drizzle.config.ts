import { defineConfig } from "drizzle-kit";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL is not set in .env file");
  console.error("Please add your Neon database URL to the .env file");
  process.exit(1);
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  breakpoints: true,
  verbose: true,
  strict: true,
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  tablesFilter: ["!drizzle_*"],
});
