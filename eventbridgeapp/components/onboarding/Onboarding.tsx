'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import OnboardingSidebar from './OnboardingSidebar';
import ProfileSetupStep from './ProfileSetupStep';
import ServicesStep from './ServicesStep';
import PricingStep from './PricingStep';
import VerifyStep from './VerifyStep';

import type { OnboardingData, OnboardingStep } from './types';
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

  /* ----------------------------------
     Load draft from localStorage
  -----------------------------------*/
  useEffect(() => {
    const savedDraft = localStorage.getItem('vendorOnboardingDraft');

    if (!savedDraft) return;

    try {
      const parsed = JSON.parse(savedDraft);

      setData((prev) => ({
        ...prev,
        ...parsed,
      }));

      if (parsed.currentStep) setCurrentStep(parsed.currentStep);
      if (parsed.completedSteps) setCompletedSteps(parsed.completedSteps);
    } catch (error) {
      console.error('Failed to load onboarding draft:', error);
    }
  }, []);

  /* ----------------------------------
     Helpers
  -----------------------------------*/
  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const saveDraft = () => {
    localStorage.setItem(
      'vendorOnboardingDraft',
      JSON.stringify({
        ...data,
        currentStep,
        completedSteps,
      })
    );

    alert('Draft saved!');
  };

  const stepOrder: OnboardingStep[] = [
    'profile',
    'services',
    'pricing',
    'verify',
  ];

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }

    const currentIndex = stepOrder.indexOf(currentStep);

    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  /* ----------------------------------
     FINAL SUBMIT (NO FILE UPLOADS HERE)
  -----------------------------------*/
  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/vendor/onboarding/submit-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
          phone: data.phone || '',
          website: data.website || '',

          // ✅ Uploaded earlier via UploadDropzone
          profilePhotoUrl: data.profilePhotoUrl,
          galleryImageUrls: data.galleryImageUrls,
          documentUrls: data.verificationDocumentUrls,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Submission failed');
      }

      localStorage.removeItem('vendorOnboardingDraft');

      alert('Application submitted successfully!');
      router.push('/');
    } catch (error) {
      console.error('Onboarding submission error:', error);
      alert('Failed to submit onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ----------------------------------
     Step rendering
  -----------------------------------*/
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
        return null;
    }
  };

  /* ----------------------------------
     Layout
  -----------------------------------*/
  return (
    <div className="min-h-screen bg-neutrals-01 dark:bg-shades-black">
      <OnboardingSidebar
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      <main className="ml-64 min-h-screen p-8 lg:p-12 bg-shades-white dark:bg-neutrals-02">
        <div className="max-w-3xl mx-auto py-8">
          {renderStep()}
        </div>
      </main>
    </div>
  );
}
