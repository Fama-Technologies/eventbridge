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
  'Wedding',
  'Birthday',
  'Corporate',
  'Engagement',
  'Baby Shower',
  'Graduation',
  'Conference',
  'Funeral',
  'Party',
  'Product Launch',
  'Workshop',
];

export const SERVICE_CATEGORIES = [
  'DJ & Music',
  'Photographer',
  'Catering',
  'Florist',
  'Event Planner',
  'Videographer',
  'Decorator',
  'MC/Host',
  'Security',
  'Transportation',
  'Honeymoon packages',
];

export const PRICING_STRUCTURES = [
  'Per event',
  'Per day',
  'Per plate',
  'Per hour',
  'Per person',
];
