// drizzle/schema.ts
import { pgTable, serial, text, timestamp, integer, boolean, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table - MATCHES YOUR ACTUAL DATABASE
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  image: text('image'),
  provider: text('provider').notNull().default('local'),
  createdAt: timestamp('created_at').defaultNow(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  password: text('password').notNull(),
  accountType: text('account_type').notNull(), // 'client', 'vendor', 'admin'
});

// Sessions table - FOR AUTHENTICATION
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Events table
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  imageUrl: text('image_url'),
  vendorId: integer('vendor_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Password Reset Tokens table
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Event Categories table
export const eventCategories = pgTable('event_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Event to Category relationship (many-to-many)
export const eventCategoryRelations = pgTable('event_category_relations', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  categoryId: integer('category_id').references(() => eventCategories.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Vendors/Planners profile table
export const vendorProfiles = pgTable('vendor_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  businessName: text('business_name'),
  description: text('description'),
  phone: text('phone'),
  website: text('website'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  serviceRadius: integer('service_radius'), // in miles
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

// Vendor Services/Skills
export const vendorServices = pgTable('vendor_services', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendorProfiles.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price'),
  duration: integer('duration'), // in hours
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Vendor Portfolio (images/works)
export const vendorPortfolio = pgTable('vendor_portfolio', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendorProfiles.id, { onDelete: 'cascade' }).notNull(),
  imageUrl: text('image_url').notNull(),
  title: text('title'),
  description: text('description'),
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Bookings/Appointments
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  vendorId: integer('vendor_id').references(() => vendorProfiles.id, { onDelete: 'cascade' }).notNull(),
  clientId: integer('client_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  serviceId: integer('service_id').references(() => vendorServices.id, { onDelete: 'set null' }),
  bookingDate: timestamp('booking_date').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'confirmed', 'completed', 'cancelled'
  totalAmount: integer('total_amount'),
  notes: text('notes'),
  paymentStatus: text('payment_status').default('unpaid'), // 'unpaid', 'partial', 'paid'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Reviews/Ratings
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').references(() => bookings.id, { onDelete: 'cascade' }).notNull(),
  clientId: integer('client_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  vendorId: integer('vendor_id').references(() => vendorProfiles.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  isAnonymous: boolean('is_anonymous').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ===== RELATIONS =====

// Users relations
export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  events: many(events),
  passwordResetTokens: many(passwordResetTokens),
  vendorProfile: one(vendorProfiles, {
    fields: [users.id],
    references: [vendorProfiles.userId],
  }),
  clientBookings: many(bookings, { relationName: 'clientBookings' }),
  vendorBookings: many(bookings, { relationName: 'vendorBookings' }),
  reviewsGiven: many(reviews, { relationName: 'clientReviews' }),
}));

// Sessions relations
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Events relations
export const eventsRelations = relations(events, ({ one, many }) => ({
  vendor: one(users, {
    fields: [events.vendorId],
    references: [users.id],
  }),
  categories: many(eventCategoryRelations),
  bookings: many(bookings),
}));

// Password Reset Tokens relations
export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

// Event Categories relations
export const eventCategoriesRelations = relations(eventCategories, ({ many }) => ({
  events: many(eventCategoryRelations),
}));

// Event Category Relations relations
export const eventCategoryRelationsRelations = relations(eventCategoryRelations, ({ one }) => ({
  event: one(events, {
    fields: [eventCategoryRelations.eventId],
    references: [events.id],
  }),
  category: one(eventCategories, {
    fields: [eventCategoryRelations.categoryId],
    references: [eventCategories.id],
  }),
}));

// Vendor Profiles relations
export const vendorProfilesRelations = relations(vendorProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [vendorProfiles.userId],
    references: [users.id],
  }),
  services: many(vendorServices),
  portfolio: many(vendorPortfolio),
  bookings: many(bookings),
  reviews: many(reviews, { relationName: 'vendorReviews' }),
}));

// Vendor Services relations
export const vendorServicesRelations = relations(vendorServices, ({ one, many }) => ({
  vendor: one(vendorProfiles, {
    fields: [vendorServices.vendorId],
    references: [vendorProfiles.id],
  }),
  bookings: many(bookings),
}));

// Vendor Portfolio relations
export const vendorPortfolioRelations = relations(vendorPortfolio, ({ one }) => ({
  vendor: one(vendorProfiles, {
    fields: [vendorPortfolio.vendorId],
    references: [vendorProfiles.id],
  }),
}));

// Bookings relations
export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  event: one(events, {
    fields: [bookings.eventId],
    references: [events.id],
  }),
  vendor: one(vendorProfiles, {
    fields: [bookings.vendorId],
    references: [vendorProfiles.id],
  }),
  client: one(users, {
    fields: [bookings.clientId],
    references: [users.id],
    relationName: 'clientBookings',
  }),
  service: one(vendorServices, {
    fields: [bookings.serviceId],
    references: [vendorServices.id],
  }),
  review: one(reviews, {
    fields: [bookings.id],
    references: [reviews.bookingId],
  }),
}));

// Reviews relations
export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  client: one(users, {
    fields: [reviews.clientId],
    references: [users.id],
    relationName: 'clientReviews',
  }),
  vendor: one(vendorProfiles, {
    fields: [reviews.vendorId],
    references: [vendorProfiles.id],
    relationName: 'vendorReviews',
  }),
}));

// ===== TYPESCRIPT TYPES =====

// Existing types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;

// NEW types
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type EventCategory = typeof eventCategories.$inferSelect;
export type NewEventCategory = typeof eventCategories.$inferInsert;
export type EventCategoryRelation = typeof eventCategoryRelations.$inferSelect;
export type NewEventCategoryRelation = typeof eventCategoryRelations.$inferInsert;
export type VendorProfile = typeof vendorProfiles.$inferSelect;
export type NewVendorProfile = typeof vendorProfiles.$inferInsert;
export type VendorService = typeof vendorServices.$inferSelect;
export type NewVendorService = typeof vendorServices.$inferInsert;
export type VendorPortfolio = typeof vendorPortfolio.$inferSelect;
export type NewVendorPortfolio = typeof vendorPortfolio.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;