import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";
const sql = neon(dbUrl);
export const db = drizzle(sql);
