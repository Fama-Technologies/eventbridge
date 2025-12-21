'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingSidebar from './OnboardingSidebar';
import ProfileSetupStep from './ProfileSetupStep';
import ServicesStep from './ServicesStep';
import PricingStep from './PricingStep';
import VerifyStep from './VerifyStep';
import type {
  OnboardingData,
  OnboardingStep,
} from './types';
import { INITIAL_ONBOARDING_DATA } from './types';

interface OnboardingProps {
  userId?: number;
  userEmail?: string;
}

export default function Onboarding({ userId, userEmail }: OnboardingProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('profile');
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>(INITIAL_ONBOARDING_DATA);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('vendorOnboardingDraft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        // Restore text data (not files)
        setData((prev) => ({
          ...prev,
          businessName: parsed.businessName || '',
          serviceCategories: parsed.serviceCategories || [],
          customCategories: parsed.customCategories || [],
          primaryLocation: parsed.primaryLocation || '',
          serviceDescription: parsed.serviceDescription || '',
          pricingStructure: parsed.pricingStructure || [],
          customPricingStructure: parsed.customPricingStructure || [],
          priceRange: parsed.priceRange || '',
          generalAvailability: parsed.generalAvailability || '',
          experience: parsed.experience || '',
          agreedToTerms: parsed.agreedToTerms || false,
        }));
        if (parsed.currentStep) {
          setCurrentStep(parsed.currentStep);
        }
        if (parsed.completedSteps) {
          setCompletedSteps(parsed.completedSteps);
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const saveDraft = () => {
    const draftData = {
      businessName: data.businessName,
      serviceCategories: data.serviceCategories,
      customCategories: data.customCategories,
      primaryLocation: data.primaryLocation,
      serviceDescription: data.serviceDescription,
      pricingStructure: data.pricingStructure,
      customPricingStructure: data.customPricingStructure,
      priceRange: data.priceRange,
      generalAvailability: data.generalAvailability,
      experience: data.experience,
      agreedToTerms: data.agreedToTerms,
      currentStep,
      completedSteps,
    };
    localStorage.setItem('vendorOnboardingDraft', JSON.stringify(draftData));
    // Show toast or notification
    alert('Draft saved!');
  };

  const handleNext = () => {
    const stepOrder: OnboardingStep[] = ['profile', 'services', 'pricing', 'verify'];
    const currentIndex = stepOrder.indexOf(currentStep);

    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }

    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    } else {
      // Final step - submit onboarding
      handleSubmit();
    }
  };

  const handleBack = () => {
    const stepOrder: OnboardingStep[] = ['profile', 'services', 'pricing', 'verify'];
    const currentIndex = stepOrder.indexOf(currentStep);

    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Create FormData for file uploads
      const formData = new FormData();

      // Add text data
      formData.append('businessName', data.businessName);
      formData.append('serviceCategories', JSON.stringify(data.serviceCategories));
      formData.append('primaryLocation', data.primaryLocation);
      formData.append('serviceDescription', data.serviceDescription);
      formData.append('pricingStructure', JSON.stringify(data.pricingStructure));
      formData.append('priceRange', data.priceRange);
      formData.append('generalAvailability', data.generalAvailability);

      // Add profile photo
      if (data.profilePhoto) {
        formData.append('profilePhoto', data.profilePhoto);
      }

      // Add gallery images
      data.serviceGallery.forEach((file, index) => {
        formData.append(`galleryImage_${index}`, file);
      });

      // Add verification documents
      data.verificationDocuments.forEach((file, index) => {
        formData.append(`document_${index}`, file);
      });

      const response = await fetch('/api/vendor/onboarding', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit onboarding');
      }

      // Clear draft
      localStorage.removeItem('vendorOnboardingDraft');

      // Redirect to vendor dashboard with success state
      window.location.href = '/vendor/dashboard?onboarding=complete';
    } catch (error) {
      console.error('Onboarding submission error:', error);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepProps = {
    data,
    updateData,
    onNext: handleNext,
    onBack: handleBack,
    onSaveDraft: saveDraft,
    isLoading,
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'profile':
        return <ProfileSetupStep {...stepProps} />;
      case 'services':
        return <ServicesStep {...stepProps} />;
      case 'pricing':
        return <PricingStep {...stepProps} />;
      case 'verify':
        return <VerifyStep {...stepProps} />;
      default:
        return <ProfileSetupStep {...stepProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutrals-01 dark:bg-shades-black">
      {/* Sidebar */}
      <OnboardingSidebar currentStep={currentStep} completedSteps={completedSteps} />

      {/* Main Content */}
      <main className="ml-64 min-h-screen p-8 lg:p-12 bg-shades-white dark:bg-neutrals-02">
        <div className="max-w-3xl mx-auto py-8">
          {renderStep()}
        </div>
      </main>
    </div>
  );
}
