// drizzle/schema.ts
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
  unique,
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
    .$type<'VENDOR' | 'CUSTOMER' | 'PLANNER' | 'ADMIN'>()
    .notNull(),

  isActive: boolean('is_active').default(true),
  emailVerified: boolean('email_verified').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    emailIdx: index('users_email_idx').on(table.email),
    accountTypeIdx: index('users_account_type_idx').on(table.accountType),
  };
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
}, (table) => {
  return {
    // Add composite unique constraint (required by auth libraries)
    providerProviderAccountIdUnique: unique('provider_provider_account_id_unique')
      .on(table.provider, table.providerAccountId),
    userIdIdx: index('accounts_user_id_idx').on(table.userId),
  };
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
}, (table) => {
  return {
    tokenIdx: index('sessions_token_idx').on(table.token),
    userIdIdx: index('sessions_user_id_idx').on(table.userId),
    expiresAtIdx: index('sessions_expires_at_idx').on(table.expiresAt),
  };
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
}, (table) => {
  return {
    vendorIdIdx: index('events_vendor_id_idx').on(table.vendorId),
    startDateIdx: index('events_start_date_idx').on(table.startDate),
  };
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
}, (table) => {
  return {
    tokenHashIdx: index('password_reset_tokens_token_hash_idx').on(table.tokenHash),
    userIdIdx: index('password_reset_tokens_user_id_idx').on(table.userId),
  };
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
}, (table) => {
  return {
    eventIdIdx: index('event_category_relations_event_id_idx').on(table.eventId),
    categoryIdIdx: index('event_category_relations_category_id_idx').on(table.categoryId),
    uniqueEventCategory: unique('event_category_relations_unique_event_category')
      .on(table.eventId, table.categoryId),
  };
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

  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),

  // ✅ ADDED: Category field for vendors
  categoryId: integer('category_id')
    .references(() => eventCategories.id, { onDelete: 'set null' }),

  serviceRadius: integer('service_radius'),
  yearsExperience: integer('years_experience'),
  hourlyRate: integer('hourly_rate'),

  verificationStatus: text('verification_status').default('pending').notNull(),
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
}, (table) => {
  return {
    userIdIdx: index('vendor_profiles_user_id_idx').on(table.userId),
    verificationStatusIdx: index('vendor_profiles_verification_status_idx').on(table.verificationStatus),
    isVerifiedIdx: index('vendor_profiles_is_verified_idx').on(table.isVerified),
    // ✅ ADDED: Index for category filtering
    categoryIdIdx: index('vendor_profiles_category_id_idx').on(table.categoryId),
  };
});

/* ===================== VENDOR AVAILABILITY ===================== */
export const vendorAvailability = pgTable('vendor_availability', {
  id: serial('id').primaryKey(),

  vendorId: integer('vendor_id')
    .notNull()
    .unique()
    .references(() => vendorProfiles.id, { onDelete: 'cascade' }),

  activeDays: jsonb('active_days').$type<number[]>(),
  workingHours: jsonb('working_hours').$type<{ start: string; end: string }>(),
  sameDayService: boolean('same_day_service').default(false),
  maxEvents: integer('max_events').default(5),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    vendorIdIdx: index('vendor_availability_vendor_id_idx').on(table.vendorId),
  };
});

/* ===================== VENDOR SERVICES ===================== */
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
}, (table) => {
  return {
    vendorIdIdx: index('vendor_services_vendor_id_idx').on(table.vendorId),
    isActiveIdx: index('vendor_services_is_active_idx').on(table.isActive),
  };
});

/* ===================== VENDOR PACKAGES ===================== */
export const vendorPackages = pgTable('vendor_packages', {
  id: serial('id').primaryKey(),

  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendorProfiles.id, { onDelete: 'cascade' }),

  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(),
  priceMax: integer('price_max'),
  duration: integer('duration'),

  capacityMin: integer('capacity_min'),
  capacityMax: integer('capacity_max'),
  pricingModel: text('pricing_model').default('per_event'),

  features: jsonb('features').$type<string[]>(),
  pricingStructure: jsonb('pricing_structure').$type<string[]>(),
  customPricing: boolean('custom_pricing').default(false),
  tags: jsonb('tags').$type<string[]>(),

  isPopular: boolean('is_popular').default(false),
  isActive: boolean('is_active').default(true),
  displayOrder: integer('display_order').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    vendorIdIdx: index('vendor_packages_vendor_id_idx').on(table.vendorId),
    isActiveIdx: index('vendor_packages_is_active_idx').on(table.isActive),
  };
});

/* ===================== SERVICE GALLERY ===================== */
export const serviceGallery = pgTable('service_gallery', {
  id: serial('id').primaryKey(),

  serviceId: integer('service_id')
    .notNull()
    .references(() => vendorServices.id, { onDelete: 'cascade' }),

  mediaUrl: text('media_url').notNull(),
  mediaType: text('media_type').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    serviceIdIdx: index('service_gallery_service_id_idx').on(table.serviceId),
  };
});

/* ===================== VENDOR PORTFOLIO ===================== */
export const vendorPortfolio = pgTable('vendor_portfolio', {
  id: serial('id').primaryKey(),

  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendorProfiles.id, { onDelete: 'cascade' }),

  imageUrl: text('image_url').notNull(),
  title: text('title'),
  description: text('description'),
  category: text('category'),

  width: integer('width'),
  height: integer('height'),
  fileSize: integer('file_size'),
  quality: text('quality'),
  displayOrder: integer('display_order').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    vendorIdIdx: index('vendor_portfolio_vendor_id_idx').on(table.vendorId),
    categoryIdx: index('vendor_portfolio_category_idx').on(table.category),
  };
});

/* ===================== VENDOR VIDEOS ===================== */
export const vendorVideos = pgTable('vendor_videos', {
  id: serial('id').primaryKey(),

  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendorProfiles.id, { onDelete: 'cascade' }),

  videoUrl: text('video_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  title: text('title'),
  description: text('description'),

  duration: integer('duration'),
  fileSize: integer('file_size'),
  width: integer('width'),
  height: integer('height'),
  quality: text('quality'),
  displayOrder: integer('display_order').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    vendorIdIdx: index('vendor_videos_vendor_id_idx').on(table.vendorId),
  };
});

/* ===================== CANCELLATION POLICIES ===================== */
export const cancellationPolicies = pgTable('cancellation_policies', {
  id: serial('id').primaryKey(),

  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendorProfiles.id, { onDelete: 'cascade' }),

  policyText: text('policy_text').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    vendorIdIdx: index('cancellation_policies_vendor_id_idx').on(table.vendorId),
  };
});

/* ===================== VENDOR DISCOUNTS ===================== */
export const vendorDiscounts = pgTable('vendor_discounts', {
  id: serial('id').primaryKey(),

  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendorProfiles.id, { onDelete: 'cascade' }),

  code: text('code').unique(),
  name: text('name').notNull(),
  discountType: text('discount_type').notNull(),
  discountValue: integer('discount_value').notNull(),

  validFrom: timestamp('valid_from').notNull(),
  validUntil: timestamp('valid_until').notNull(),

  maxUses: integer('max_uses'),
  currentUses: integer('current_uses').default(0),
  minimumBookingAmount: integer('minimum_booking_amount'),

  isActive: boolean('is_active').default(true),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    vendorIdIdx: index('vendor_discounts_vendor_id_idx').on(table.vendorId),
    codeIdx: index('vendor_discounts_code_idx').on(table.code),
    validUntilIdx: index('vendor_discounts_valid_until_idx').on(table.validUntil),
    isActiveIdx: index('vendor_discounts_is_active_idx').on(table.isActive),
  };
});

/* ===================== VERIFICATION DOCUMENTS ===================== */
export const verificationDocuments = pgTable('verification_documents', {
  id: serial('id').primaryKey(),

  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendorProfiles.id, { onDelete: 'cascade' }),

  documentType: text('document_type').notNull(),
  documentUrl: text('document_url').notNull(),
  documentName: text('document_name').notNull(),
  fileSize: integer('file_size'),

  status: text('status').default('pending').notNull(),

  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
}, (table) => {
  return {
    vendorIdIdx: index('verification_documents_vendor_id_idx').on(table.vendorId),
    statusIdx: index('verification_documents_status_idx').on(table.status),
  };
});

/* ===================== ONBOARDING PROGRESS ===================== */
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
}, (table) => {
  return {
    userIdIdx: index('onboarding_progress_user_id_idx').on(table.userId),
    isCompleteIdx: index('onboarding_progress_is_complete_idx').on(table.isComplete),
  };
});

/* ===================== USER UPLOADS ===================== */
export const userUploads = pgTable('user_uploads', {
  id: serial('id').primaryKey(),

  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  fileKey: text('file_key').notNull(),
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),

  uploadType: text('upload_type').notNull(),

  vendorId: integer('vendor_id')
    .references(() => vendorProfiles.id, { onDelete: 'cascade' }),

  width: integer('width'),
  height: integer('height'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('user_uploads_user_id_idx').on(table.userId),
    fileKeyIdx: index('user_uploads_file_key_idx').on(table.fileKey),
    uploadTypeIdx: index('user_uploads_upload_type_idx').on(table.uploadType),
    vendorIdIdx: index('user_uploads_vendor_id_idx').on(table.vendorId),
  };
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

  packageId: integer('package_id')
    .references(() => vendorPackages.id),

  bookingDate: timestamp('booking_date').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),

  status: text('status').default('pending').notNull(),
  paymentStatus: text('payment_status').default('unpaid'),

  totalAmount: integer('total_amount'),
  notes: text('notes'),

  discountCode: text('discount_code'),
  discountAmount: integer('discount_amount').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    eventIdIdx: index('bookings_event_id_idx').on(table.eventId),
    vendorIdIdx: index('bookings_vendor_id_idx').on(table.vendorId),
    clientIdIdx: index('bookings_client_id_idx').on(table.clientId),
    statusIdx: index('bookings_status_idx').on(table.status),
    bookingDateIdx: index('bookings_booking_date_idx').on(table.bookingDate),
  };
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
}, (table) => {
  return {
    bookingIdIdx: index('reviews_booking_id_idx').on(table.bookingId),
    vendorIdIdx: index('reviews_vendor_id_idx').on(table.vendorId),
    clientIdIdx: index('reviews_client_id_idx').on(table.clientId),
    ratingIdx: index('reviews_rating_idx').on(table.rating),
    uniqueBookingReview: unique('reviews_unique_booking_review')
      .on(table.bookingId), // One review per booking
  };
});

/* ===================== MESSAGING & NOTIFICATIONS (Removed due to db constraints) ===================== */
// Tables removed as they cannot be pushed to DB currently.
// Using mock API responses instead.

/* ===================== RELATIONS ===================== */
export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  events: many(events),
  passwordResetTokens: many(passwordResetTokens),
  vendorProfile: one(vendorProfiles),
  clientBookings: many(bookings),
  reviewsGiven: many(reviews),
  onboardingProgress: one(onboardingProgress),
  uploads: many(userUploads),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const userUploadsRelations = relations(userUploads, ({ one }) => ({
  user: one(users, {
    fields: [userUploads.userId],
    references: [users.id],
  }),
  vendor: one(vendorProfiles, {
    fields: [userUploads.vendorId],
    references: [vendorProfiles.id],
  }),
}));

export const vendorProfilesRelations = relations(vendorProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [vendorProfiles.userId],
    references: [users.id],
  }),
  // ✅ ADDED: Category relation
  category: one(eventCategories, {
    fields: [vendorProfiles.categoryId],
    references: [eventCategories.id],
  }),
  availability: one(vendorAvailability),
  services: many(vendorServices),
  packages: many(vendorPackages),
  portfolio: many(vendorPortfolio),
  videos: many(vendorVideos),
  cancellationPolicy: one(cancellationPolicies),
  discounts: many(vendorDiscounts),
  verificationDocuments: many(verificationDocuments),
  bookings: many(bookings),
  reviews: many(reviews),
  uploads: many(userUploads),
}));

// ✅ ADDED: eventCategories relations with vendors
export const eventCategoriesRelations = relations(eventCategories, ({ many }) => ({
  vendors: many(vendorProfiles),
}));

export const vendorServicesRelations = relations(vendorServices, ({ one, many }) => ({
  vendor: one(vendorProfiles, {
    fields: [vendorServices.vendorId],
    references: [vendorProfiles.id],
  }),
  gallery: many(serviceGallery),
}));

export const vendorAvailabilityRelations = relations(vendorAvailability, ({ one }) => ({
  vendor: one(vendorProfiles, {
    fields: [vendorAvailability.vendorId],
    references: [vendorProfiles.id],
  }),
}));

export const vendorPackagesRelations = relations(vendorPackages, ({ one }) => ({
  vendor: one(vendorProfiles, {
    fields: [vendorPackages.vendorId],
    references: [vendorProfiles.id],
  }),
}));

export const vendorPortfolioRelations = relations(vendorPortfolio, ({ one }) => ({
  vendor: one(vendorProfiles, {
    fields: [vendorPortfolio.vendorId],
    references: [vendorProfiles.id],
  }),
}));

export const vendorVideosRelations = relations(vendorVideos, ({ one }) => ({
  vendor: one(vendorProfiles, {
    fields: [vendorVideos.vendorId],
    references: [vendorProfiles.id],
  }),
}));

export const cancellationPoliciesRelations = relations(cancellationPolicies, ({ one }) => ({
  vendor: one(vendorProfiles, {
    fields: [cancellationPolicies.vendorId],
    references: [vendorProfiles.id],
  }),
}));

export const vendorDiscountsRelations = relations(vendorDiscounts, ({ one }) => ({
  vendor: one(vendorProfiles, {
    fields: [vendorDiscounts.vendorId],
    references: [vendorProfiles.id],
  }),
}));

export const verificationDocumentsRelations = relations(verificationDocuments, ({ one }) => ({
  vendor: one(vendorProfiles, {
    fields: [verificationDocuments.vendorId],
    references: [vendorProfiles.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
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
  }),
  service: one(vendorServices, {
    fields: [bookings.serviceId],
    references: [vendorServices.id],
  }),
  package: one(vendorPackages, {
    fields: [bookings.packageId],
    references: [vendorPackages.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  client: one(users, {
    fields: [reviews.clientId],
    references: [users.id],
  }),
  vendor: one(vendorProfiles, {
    fields: [reviews.vendorId],
    references: [vendorProfiles.id],
  }),
}));

// Relations removed
// Relations removed

/* ===================== TYPES ===================== */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;

export type EventCategory = typeof eventCategories.$inferSelect;
export type EventCategoryRelation = typeof eventCategoryRelations.$inferSelect;

export type VendorProfile = typeof vendorProfiles.$inferSelect;
export type NewVendorProfile = typeof vendorProfiles.$inferInsert;

export type VendorAvailability = typeof vendorAvailability.$inferSelect;
export type NewVendorAvailability = typeof vendorAvailability.$inferInsert;

export type VendorService = typeof vendorServices.$inferSelect;
export type NewVendorService = typeof vendorServices.$inferInsert;

export type VendorPackage = typeof vendorPackages.$inferSelect;
export type NewVendorPackage = typeof vendorPackages.$inferInsert;

export type VendorVideo = typeof vendorVideos.$inferSelect;
export type NewVendorVideo = typeof vendorVideos.$inferInsert;

export type VendorPortfolioItem = typeof vendorPortfolio.$inferSelect;
export type NewVendorPortfolioItem = typeof vendorPortfolio.$inferInsert;

export type ServiceGallery = typeof serviceGallery.$inferSelect;
export type NewServiceGallery = typeof serviceGallery.$inferInsert;

export type CancellationPolicy = typeof cancellationPolicies.$inferSelect;
export type NewCancellationPolicy = typeof cancellationPolicies.$inferInsert;

export type VendorDiscount = typeof vendorDiscounts.$inferSelect;
export type NewVendorDiscount = typeof vendorDiscounts.$inferInsert;

export type VerificationDocument = typeof verificationDocuments.$inferSelect;
export type NewVerificationDocument = typeof verificationDocuments.$inferInsert;

export type UserUpload = typeof userUploads.$inferSelect;
export type NewUserUpload = typeof userUploads.$inferInsert;

export type Booking = typeof bookings