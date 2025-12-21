// drizzle/schema.ts
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/* ===================== USERS ===================== */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),

  email: text('email').notNull().unique(),
  password: text('password').notNull(),

  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),

  image: text('image'),
  provider: text('provider').notNull().default('local'),
  accountType: text('account_type').notNull(), // 'VENDOR' | 'CUSTOMER'

  isActive: boolean('is_active').default(true),
  emailVerified: boolean('email_verified').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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

/* ===================== VENDORS ===================== */
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

  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),

  serviceRadius: integer('service_radius'),
  yearsExperience: integer('years_experience'),
  hourlyRate: integer('hourly_rate'),

  isVerified: boolean('is_verified').default(false),
  rating: integer('rating').default(0),
  reviewCount: integer('review_count').default(0),

  profileImage: text('profile_image'),
  coverImage: text('cover_image'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const vendorServices = pgTable('vendor_services', {
  id: serial('id').primaryKey(),

  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendorProfiles.id, { onDelete: 'cascade' }),

  name: text('name').notNull(),
  description: text('description'),
  price: integer('price'),
  duration: integer('duration'),

  isActive: boolean('is_active').default(true),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const vendorPortfolio = pgTable('vendor_portfolio', {
  id: serial('id').primaryKey(),

  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendorProfiles.id, { onDelete: 'cascade' }),

  imageUrl: text('image_url').notNull(),
  title: text('title'),
  description: text('description'),
  category: text('category'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/* ===================== BOOKINGS ===================== */
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),

  eventId: integer('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendorProfiles.id, { onDelete: 'cascade' }),

  clientId: integer('client_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  serviceId: integer('service_id').references(() => vendorServices.id),

  bookingDate: timestamp('booking_date').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),

  status: text('status').default('pending').notNull(),
  paymentStatus: text('payment_status').default('unpaid'),

  totalAmount: integer('total_amount'),
  notes: text('notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/* ===================== REVIEWS ===================== */
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),

  bookingId: integer('booking_id')
    .notNull()
    .references(() => bookings.id, { onDelete: 'cascade' }),

  clientId: integer('client_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendorProfiles.id, { onDelete: 'cascade' }),

  rating: integer('rating').notNull(),
  comment: text('comment'),
  isAnonymous: boolean('is_anonymous').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/* ===================== RELATIONS ===================== */
export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  events: many(events),
  passwordResetTokens: many(passwordResetTokens),
  vendorProfile: one(vendorProfiles),
  clientBookings: many(bookings),
  reviewsGiven: many(reviews),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  event: one(events),
  vendor: one(vendorProfiles),
  client: one(users),
  service: one(vendorServices),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings),
  client: one(users),
  vendor: one(vendorProfiles),
}));

/* ===================== TYPES ===================== */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type Event = typeof events.$inferSelect;
export type VendorProfile = typeof vendorProfiles.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Review = typeof reviews.$inferSelect;
