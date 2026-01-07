'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import OnboardingSidebar from './OnboardingSidebar';
import { uploadFiles } from '@/lib/uploadthing';
import ProfileSetupStep from './ProfileSetupStep';
import ServicesStep from './ServicesStep';
import PricingStep from './PricingStep';
import VerifyStep from './VerifyStep';

import type { OnboardingData, OnboardingStep } from './types';
import { INITIAL_ONBOARDING_DATA } from './types';

interface OnboardingProps {
  userId?: number;
  userEmail?: string;
  onComplete?: () => void; // Add this prop
}

export default function Onboarding({ userId, userEmail, onComplete }: OnboardingProps) {
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
     FINAL SUBMIT (WITH UPLOADTHING)
  -----------------------------------*/
  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      let profilePhotoUrl = data.profilePhotoUrl;
      let galleryImageUrls = [...data.galleryImageUrls];
      let documentUrls = [...data.verificationDocumentUrls];

      // 1. Upload Profile Photo
      if (data.profilePhoto) {
        toast.info("Uploading profile photo...");
        const res = await uploadFiles("profileImage", {
          files: [data.profilePhoto],
        });
        if (res && res[0]) {
          profilePhotoUrl = res[0].url;
        }
      }

      // 2. Upload Gallery
      if (data.serviceGallery.length > 0) {
        toast.info("Uploading gallery images...");
        const res = await uploadFiles("galleryImages", {
          files: data.serviceGallery,
        });
        if (res) {
          const newUrls = res.map(f => f.url);
          galleryImageUrls = [...galleryImageUrls, ...newUrls];
        }
      }

      // 3. Upload Documents
      if (data.verificationDocuments.length > 0) {
        toast.info("Uploading documents...");
        const res = await uploadFiles("verificationDocuments", {
          files: data.verificationDocuments,
        });
        if (res) {
          const newUrls = res.map(f => f.url);
          documentUrls = [...documentUrls, ...newUrls];
        }
      }

      toast.info("Submitting application...");

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
          profilePhotoUrl,
          galleryImageUrls,
          documentUrls,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Submission failed');
      }

      localStorage.removeItem('vendorOnboardingDraft');

      toast.success('Application submitted successfully!');
      
      // Call onComplete if provided, otherwise use router
      if (onComplete) {
        onComplete();
      } else {
        router.push('/vendor'); // Fallback redirect
      }
    } catch (error) {
      console.error('Onboarding submission error:', error);
      toast.error('Failed to submit onboarding. Please try again.');
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