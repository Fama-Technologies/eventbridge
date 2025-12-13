import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  image: text("image"),
  provider: text("provider").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
