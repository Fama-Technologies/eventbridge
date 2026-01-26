// Types for Vendor Onboarding

export interface OnboardingData {
  // Uploaded file URLs (set after UploadThing uploads)
  profilePhotoUrl: string | null;
  galleryImageUrls: string[];
  verificationDocumentUrls: string[];

  website: string;
  phone: string;

  // Step 1: Profile Setup
  profilePhoto: File | null;
  profilePhotoPreview: string;
  businessName: string;
  eventTypes: string[];
  customEventTypes: string[];
  primaryLocation: string;

  // Step 2: Services
  serviceCategories: string[];
  customServiceCategories: string[];
  serviceDescription: string;
  pricingStructure: string[];
  customPricingStructure: string[];
  priceRange: string;
  generalAvailability: string;
  workingDays: string[];
  experience: string;
  serviceGallery: string[];
  serviceGalleryPreviews: string[];

  // Step 4: Verification
  verificationDocuments: File[];
  agreedToTerms: boolean;
}

export interface OnboardingStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => void;
  isLoading: boolean;
}

export type OnboardingStep = 'profile' | 'services' | 'verify';

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
  // Uploaded URLs (must exist to satisfy type)
  profilePhotoUrl: null,
  galleryImageUrls: [],
  verificationDocumentUrls: [],

  website: '',
  phone: '',

  // Step 1
  profilePhoto: null,
  profilePhotoPreview: '',
  businessName: '',
  eventTypes: [],
  customEventTypes: [],
  primaryLocation: '',

  // Step 2
  serviceCategories: [],
  customServiceCategories: [],
  serviceDescription: '',
  pricingStructure: [],
  customPricingStructure: [],
  priceRange: '',
  generalAvailability: '',
  workingDays: [],
  experience: '',
  serviceGallery: [],
  serviceGalleryPreviews: [],

  // Step 4
  verificationDocuments: [],
  agreedToTerms: false,
};

export const EVENT_TYPES = [
  'Weddings, Birthdays & Parties',
  'Corporate Events & Product Launches',
  'Funerals & Memorials',
  'Travel & Honeymoon Planning',
];

export const SERVICE_CATEGORIES_BY_EVENT: Record<string, string[]> = {
  'Weddings, Birthdays & Parties': [
    'Venue(s)',
    'Officiant',
    'Wedding Photographer',
    'Wedding Videographer',
    'DJ or Band',
    'Ceremony Musicians',
    'Caterer',
    'Baker / Cake Designer',
    'Bar Service / Bartender',
    'Florist',
    'Decorator / Stylist',
    'Hair Stylist',
    'Makeup Artist',
    'Bridal Boutique',
    "Men’s Formalwear",
    'Bridesmaids/Flower Girl Dresses',
    'Groom/Groomsmen Attire',
    'Jeweler',
    'Wedding Planner',
    'Day-of Coordinator',
    'Transportation',
    'Valet / Parking Attendant',
    'Stationer',
    'Off-Site Rentals',
    'Photo Booth',
    'Ushers',
    'MC / Host',
    'Dancers / Performers',
    'Live Painter / Caricature Artist',
    'Childcare / Kids’ Entertainers',
    'Restroom Trailer / Attendant',
    'Security',
    'Honeymoon Planner / Travel Agent',
  ],
  'Corporate Events & Product Launches': [
    'Venue Rental',
    'Event Planner / Coordinator',
    'AV Provider',
    'Projectors & Large Screens',
    'Speakers & Microphones',
    'Mixers & Sound Systems',
  ],
  'Funerals & Memorials': [
    'Funeral Home / Director',
    'Embalming & Preparation Technician',
    'Cosmetologist / Hair & Makeup',
    'Dressing & Casketing Service',
    'Cemetery / Burial Plot Provider',
    'Crematorium',
    'Grave Marker / Headstone Supplier',
    'Urn / Keepsake Supplier',
    'Grave Opening / Closing Crew',
    'Florist',
    'Memorial Décor Provider',
    'Photographer / Videographer',
    'Live-Streaming / Video Tribute Provider',
    'Memorial Slideshow / Tribute Video Producer',
    'Memory Book / Keepsake Provider',
    'Transportation',
    'Officiant / Celebrant',
    'Musicians / Soloists',
    'Audio System / PA Rental',
    'Ushers / Greeters',
    'Caterer',
    'Beverage Service',
    'Memorial Stationery',
    'Custom Memorial Items',
  ],
  'Travel & Honeymoon Planning': [
    'Travel Agent / Honeymoon Planner',
    'Airline / Flight Booking Partner',
    'Accommodation Providers',
    'Travel Insurance Provider',
    'Tour & Activity Operators',
    'Spa & Wellness Services',
    'Romantic Experience Providers',
    'Airport Transfers & Local Transport',
    'Forex / Payment Services',
    'Photographer / Videographer',
    'Fashion & Styling Vendors',
    'Gift & Surprise Vendors',
  ],
};

export const ALL_SERVICE_CATEGORIES = Array.from(
  new Set(Object.values(SERVICE_CATEGORIES_BY_EVENT).flat())
);

export const PRICING_STRUCTURES = [
  'Per event',
  'Per day',
  'Per plate',
  'Per hour',
  'Per person',
];
