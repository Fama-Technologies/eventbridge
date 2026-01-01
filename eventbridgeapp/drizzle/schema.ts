import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/* ===================== USERS ===================== */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),

  email: text('email').notNull().unique(),
  password: text('password'), // nullable for OAuth users

  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),

  image: text('image'),
  provider: text('provider').notNull().default('local'),

  accountType: text('account_type')
    .$type<'VENDOR' | 'CUSTOMER' | 'PLANNER'>()
    .notNull(),

  isActive: boolean('is_active').default(true),
  emailVerified: boolean('email_verified').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/* ===================== ACCOUNTS ===================== */
export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),

  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),

  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/* ===================== SESSIONS ===================== */
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),

  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/* ===================== EVENTS ===================== */
export const events = pgTable('events', {
  id: serial('id').primaryKey(),

  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),

  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),

  imageUrl: text('image_url'),

  vendorId: integer('vendor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/* ===================== PASSWORD RESET TOKENS ===================== */
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),

  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/* ===================== EVENT CATEGORIES ===================== */
export const eventCategories = pgTable('event_categories', {
  id: serial('id').primaryKey(),

  name: text('name').notNull().unique(),
  description: text('description'),
  icon: text('icon'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const eventCategoryRelations = pgTable('event_category_relations', {
  id: serial('id').primaryKey(),

  eventId: integer('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  categoryId: integer('category_id')
    .notNull()
    .references(() => eventCategories.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/* ===================== VENDOR PROFILES ===================== */
export const vendorProfiles = pgTable('vendor_profiles', {
  id: serial('id').primaryKey(),

  userId: integer('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),

  businessName: text('business_name'),
  description: text('description'),
  phone: text('phone'),
  website: text('website'),

  verificationStatus: text('verification_status').default('pending').notNull(),
  canAccessDashboard: boolean('can_access_dashboard').default(false).notNull(),

  isVerified: boolean('is_verified').default(false),

  profileImage: text('profile_image'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/* ===================== RELATIONS ===================== */
export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  events: many(events),
  passwordResetTokens: many(passwordResetTokens),
  vendorProfile: one(vendorProfiles),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const vendorProfilesRelations = relations(vendorProfiles, ({ one }) => ({
  user: one(users, {
    fields: [vendorProfiles.userId],
    references: [users.id],
  }),
}));

/* ===================== TYPES ===================== */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Event = typeof events.$inferSelect;
export type VendorProfile = typeof vendorProfiles.$inferSelect;
