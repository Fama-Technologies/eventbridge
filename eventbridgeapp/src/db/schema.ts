import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  accountType: text("account_type").notNull(),
  provider: text("provider").notNull().default('local'),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
});