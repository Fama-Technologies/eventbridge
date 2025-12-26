// drizzle/schema.ts - COMPLETE UPDATED VERSION
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
  password: text('password').notNull(),

  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),

  image: text('image'),
  provider: text('provider').notNull().default('local'),
  accountType: text('account_type').notNull(), // 'VENDOR' | 'CUSTOMER' | 'PLANNER'

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
  hourlyRate: integer('hourly_rate'), // Keep for backward compatibility

  // ✅ NEW: VERIFICATION FIELDS
  verificationStatus: text('verification_status').default('pending').notNull(),
  // 'pending', 'under_review', 'approved', 'rejected', 'resubmission_required'
  verificationSubmittedAt: timestamp('verification_submitted_at'),
  verificationReviewedAt: timestamp('verification_reviewed_at'),
  verificationNotes: text('verification_notes'),
  canAccessDashboard: boolean('can_access_dashboard').default(false).notNull(),

  isVerified: boolean('is_verified').default(false),
  rating: integer('rating').default(0),
  reviewCount: integer('review_count').default(0),

  profileImage: text('profile_image'),
  coverImage: text('cover_image'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/* ===================== VENDOR SERVICES (KEPT AS IS) ===================== */
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

/* ===================== ✅ NEW: VENDOR PACKAGES ===================== */
export const vendorPackages = pgTable('vendor_packages', {
  id: serial('id').primaryKey(),

  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendorProfiles.id, { onDelete: 'cascade' }),

  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(), // in cents
  duration: integer('duration'), // in minutes
  features: jsonb('features').$type<string[]>(), // array of features

  isPopular: boolean('is_popular').default(false),
  isActive: boolean('is_active').default(true),
  displayOrder: integer('display_order').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/* ===================== SERVICE GALLERY (KEPT AS IS) ===================== */
export const serviceGallery = pgTable('service_gallery', {
  id: serial('id').primaryKey(),

  serviceId: integer('service_id')
    .notNull()
    .references(() => vendorServices.id, { onDelete: 'cascade' }),

  mediaUrl: text('media_url').notNull(),
  mediaType: text('media_type').notNull(), // 'image' | 'video'

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/* ===================== VENDOR PORTFOLIO (UPDATED) ===================== */
export const vendorPortfolio = pgTable('vendor_portfolio', {
  id: serial('id').primaryKey(),

  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendorProfiles.id, { onDelete: 'cascade' }),

  imageUrl: text('image_url').notNull(),
  title: text('title'),
  description: text('description'),
  category: text('category'),

  // ✅ NEW: QUALITY TRACKING
  width: integer('width'),
  height: integer('height'),
  fileSize: integer('file_size'),
  quality: text('quality'), // 'high', 'medium', 'low'
  displayOrder: integer('display_order').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/* ===================== ✅ NEW: VENDOR VIDEOS ===================== */
export const vendorVideos = pgTable('vendor_videos', {
  id: serial('id').primaryKey(),

  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendorProfiles.id, { onDelete: 'cascade' }),

  videoUrl: text('video_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  title: text('title'),
  description: text('description'),

  duration: integer('duration'), // in seconds
  fileSize: integer('file_size'), // in bytes
  width: integer('width'),
  height: integer('height'),
  quality: text('quality'), // 'high', 'medium', 'low'
  displayOrder: integer('display_order').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/* ===================== ✅ NEW: CANCELLATION POLICIES ===================== */
export const cancellationPolicies = pgTable('cancellation_policies', {
  id: serial('id').primaryKey(),

  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendorProfiles.id, { onDelete: 'cascade' }),

  policyText: text('policy_text').notNull(), // Free text input

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/* ===================== ✅ NEW: VENDOR DISCOUNTS ===================== */
export const vendorDiscounts = pgTable('vendor_discounts', {
  id: serial('id').primaryKey(),

  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendorProfiles.id, { onDelete: 'cascade' }),

  code: text('code').unique(),
  name: text('name').notNull(),
  discountType: text('discount_type').notNull(), // 'percentage', 'fixed'
  discountValue: integer('discount_value').notNull(),

  validFrom: timestamp('valid_from').notNull(),
  validUntil: timestamp('valid_until').notNull(),

  maxUses: integer('max_uses'),
  currentUses: integer('current_uses').default(0),
  minimumBookingAmount: integer('minimum_booking_amount'),

  isActive: boolean('is_active').default(true),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/* ===================== ✅ NEW: VERIFICATION DOCUMENTS ===================== */
export const verificationDocuments = pgTable('verification_documents', {
  id: serial('id').primaryKey(),

  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendorProfiles.id, { onDelete: 'cascade' }),

  documentType: text('document_type').notNull(),
  // 'business_license', 'insurance', 'id_verification', 'tax_document', 'other'
  documentUrl: text('document_url').notNull(),
  documentName: text('document_name').notNull(),
  fileSize: integer('file_size'),

  status: text('status').default('pending').notNull(), // 'pending', 'approved', 'rejected'

  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});

/* ===================== ✅ NEW: ONBOARDING PROGRESS ===================== */
export const onboardingProgress = pgTable('onboarding_progress', {
  id: serial('id').primaryKey(),

  userId: integer('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),

  currentStep: integer('current_step').default(1).notNull(),
  completedSteps: jsonb('completed_steps').$type<number[]>().default([]),
  formData: jsonb('form_data').$type<Record<string, any>>().default({}),

  isComplete: boolean('is_complete').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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

  serviceId: integer('service_id')
    .references(() => vendorServices.id),

  // ✅ NEW: Can also reference package instead of service
  packageId: integer('package_id')
    .references(() => vendorPackages.id),

  bookingDate: timestamp('booking_date').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),

  status: text('status').default('pending').notNull(),
  paymentStatus: text('payment_status').default('unpaid'),

  totalAmount: integer('total_amount'),
  notes: text('notes'),

  // ✅ NEW: Discount tracking
  discountCode: text('discount_code'),
  discountAmount: integer('discount_amount').default(0),

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
  onboardingProgress: one(onboardingProgress),
}));

export const vendorProfilesRelations = relations(vendorProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [vendorProfiles.userId],
    references: [users.id],
  }),
  services: many(vendorServices),
  packages: many(vendorPackages),
  portfolio: many(vendorPortfolio),
  videos: many(vendorVideos),
  cancellationPolicy: one(cancellationPolicies),
  discounts: many(vendorDiscounts),
  verificationDocuments: many(verificationDocuments),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const vendorPackagesRelations = relations(vendorPackages, ({ one }) => ({
  vendor: one(vendorProfiles, {
    fields: [vendorPackages.vendorId],
    references: [vendorProfiles.id],
  }),
}));

export const vendorVideosRelations = relations(vendorVideos, ({ one }) => ({
  vendor: one(vendorProfiles, {
    fields: [vendorVideos.vendorId],
    references: [vendorProfiles.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  event: one(events),
  vendor: one(vendorProfiles),
  client: one(users),
  service: one(vendorServices),
  package: one(vendorPackages),
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
export type VendorPackage = typeof vendorPackages.$inferSelect;
export type VendorVideo = typeof vendorVideos.$inferSelect;
export type VendorPortfolioItem = typeof vendorPortfolio.$inferSelect;
export type CancellationPolicy = typeof cancellationPolicies.$inferSelect;
export type VendorDiscount = typeof vendorDiscounts.$inferSelect;
export type VerificationDocument = typeof verificationDocuments.$inferSelect;

export type Booking = typeof bookings.$inferSelect;
export type Review = typeof reviews.$inferSelect;

export type OnboardingProgress = typeof onboardingProgress.$inferSelect;