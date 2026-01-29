import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export default {
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
};
