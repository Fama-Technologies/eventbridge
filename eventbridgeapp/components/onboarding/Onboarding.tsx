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
     UPLOAD TO CLOUDFLARE R2
  -----------------------------------*/
  const uploadToR2 = async (file: File, type: 'profile' | 'gallery' | 'document'): Promise<string> => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      if (userId) formData.append('userId', userId.toString());

      // Upload to your API endpoint that handles R2 uploads
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      return result.url; // Return the uploaded file URL
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
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

      // 1. Upload Profile Photo to R2
      if (data.profilePhoto) {
        toast.info("Uploading profile photo...");
        try {
          const url = await uploadToR2(data.profilePhoto, 'profile');
          profilePhotoUrl = url;
        } catch (error) {
          toast.error("Failed to upload profile photo");
          setIsLoading(false);
          return;
        }
      }

      // 2. Upload Gallery Images to R2
      if (data.serviceGallery.length > 0) {
        toast.info("Uploading gallery images...");
        const uploadPromises = data.serviceGallery.map(file => 
          uploadToR2(file, 'gallery').catch(err => {
            console.error('Gallery upload failed:', err);
            return null;
          })
        );
        
        const galleryUrls = await Promise.all(uploadPromises);
        const validUrls = galleryUrls.filter(url => url !== null) as string[];
        galleryImageUrls = [...galleryImageUrls, ...validUrls];
      }

      // 3. Upload Documents to R2
      if (data.verificationDocuments.length > 0) {
        toast.info("Uploading documents...");
        const uploadPromises = data.verificationDocuments.map(file => 
          uploadToR2(file, 'document').catch(err => {
            console.error('Document upload failed:', err);
            return null;
          })
        );
        
        const documentUploadUrls = await Promise.all(uploadPromises);
        const validDocUrls = documentUploadUrls.filter(url => url !== null) as string[];
        documentUrls = [...documentUrls, ...validDocUrls];
      }

      toast.info("Submitting application...");

      // Submit onboarding data to your API
      const response = await fetch('/api/vendor/onboarding', {
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
      
      // Redirect to vendor dashboard
      router.push('/vendor');
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