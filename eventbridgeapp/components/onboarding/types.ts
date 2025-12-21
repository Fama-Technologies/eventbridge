// Types for Vendor Onboarding
export interface OnboardingData {
  // Step 1: Profile Setup
  profilePhoto: File | null;
  profilePhotoPreview: string;
  businessName: string;
  serviceCategories: string[];
  customCategories: string[];
  primaryLocation: string;

  // Step 2: Services
  serviceDescription: string;
  pricingStructure: string[];
  customPricingStructure: string[];
  priceRange: string;
  generalAvailability: string;
  experience: string;
  serviceGallery: File[];
  serviceGalleryPreviews: string[];

  // Step 3: Pricing (Additional pricing details)
  // Uses same data as Step 2 for now

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

export type OnboardingStep = 'profile' | 'services' | 'pricing' | 'verify';

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
  profilePhoto: null,
  profilePhotoPreview: '',
  businessName: '',
  serviceCategories: [],
  customCategories: [],
  primaryLocation: '',
  serviceDescription: '',
  pricingStructure: [],
  customPricingStructure: [],
  priceRange: '',
  generalAvailability: '',
  experience: '',
  serviceGallery: [],
  serviceGalleryPreviews: [],
  verificationDocuments: [],
  agreedToTerms: false,
};

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
];

export const PRICING_STRUCTURES = [
  'Per event',
  'Per day',
  'Per plate',
  'Per hour',
  'Per person',
];
