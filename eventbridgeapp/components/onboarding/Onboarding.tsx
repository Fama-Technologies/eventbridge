'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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

  useEffect(() => {
    const savedDraft = localStorage.getItem('vendorOnboardingDraft');
    if (!savedDraft) return;

    try {
      const parsed = JSON.parse(savedDraft);
      setData((prev) => ({ ...prev, ...parsed }));
      if (parsed.currentStep) setCurrentStep(parsed.currentStep);
      if (parsed.completedSteps) setCompletedSteps(parsed.completedSteps);
    } catch (error) {
      console.error('Failed to load onboarding draft:', error);
    }
  }, []);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const saveDraft = () => {
    localStorage.setItem(
      'vendorOnboardingDraft',
      JSON.stringify({ ...data, currentStep, completedSteps })
    );
    alert('Draft saved!');
  };

  const stepOrder: OnboardingStep[] = ['profile', 'services', 'pricing', 'verify'];

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }

    const index = stepOrder.indexOf(currentStep);
    if (index < stepOrder.length - 1) {
      setCurrentStep(stepOrder[index + 1]);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    const index = stepOrder.indexOf(currentStep);
    if (index > 0) setCurrentStep(stepOrder[index - 1]);
  };

  /* ----------------------------------
     UPLOAD VIA API ROUTE (CORRECT)
  -----------------------------------*/
  const uploadToBlob = async (
    file: File,
    type: 'profile' | 'gallery' | 'document'
  ): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Upload failed');
    }

    return result.url;
  };

  /* ----------------------------------
     FINAL SUBMIT
  -----------------------------------*/
  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      let profilePhotoUrl = data.profilePhotoUrl;
      let galleryImageUrls = [...data.galleryImageUrls];
      let documentUrls = [...data.verificationDocumentUrls];

      if (data.profilePhoto) {
        toast.info('Uploading profile photo...');
        profilePhotoUrl = await uploadToBlob(data.profilePhoto, 'profile');
      }

      if (data.serviceGallery.length > 0) {
        toast.info('Uploading gallery images...');
        const urls = await Promise.all(
          data.serviceGallery.map((file) => uploadToBlob(file, 'gallery'))
        );
        galleryImageUrls.push(...urls);
      }

      if (data.verificationDocuments.length > 0) {
        toast.info('Uploading documents...');
        const urls = await Promise.all(
          data.verificationDocuments.map((file) =>
            uploadToBlob(file, 'document')
          )
        );
        documentUrls.push(...urls);
      }

      toast.info('Submitting application...');

      const response = await fetch('/api/vendor/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      if (!response.ok) throw new Error(result.error);

      localStorage.removeItem('vendorOnboardingDraft');
      toast.success('Application submitted successfully');
      router.push('/vendor');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit onboarding');
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

  return (
    <div className="min-h-screen bg-neutrals-01 dark:bg-shades-black">
      <OnboardingSidebar currentStep={currentStep} completedSteps={completedSteps} />

      <main className="ml-64 min-h-screen p-8 lg:p-12 bg-shades-white dark:bg-neutrals-02">
        <div className="max-w-3xl mx-auto py-8">{renderStep()}</div>
      </main>
    </div>
  );
}