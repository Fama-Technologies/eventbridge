'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { put } from '@vercel/blob';

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
     UPLOAD TO VERCEL BLOB - CORRECT METHOD
  -----------------------------------*/
  const uploadToBlob = async (file: File, type: 'profile' | 'gallery' | 'document'): Promise<string> => {
    try {
      // Generate a unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${timestamp}-${random}.${fileExtension}`;
      
      // Determine folder based on type
      let folder = 'uploads';
      if (type === 'profile') folder = 'profiles';
      if (type === 'gallery') folder = 'gallery';
      if (type === 'document') folder = 'documents';
      
      const pathname = `${folder}/${fileName}`;

      // Upload to Vercel Blob - CORRECT METHOD
      const blob = await put(pathname, file, {
        access: 'public',
        // Add token from your API route
      });

      return blob.url;
    } catch (error) {
      console.error('Vercel Blob upload error:', error);
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

      // 1. Upload Profile Photo to Vercel Blob
      if (data.profilePhoto) {
        toast.info("Uploading profile photo...");
        try {
          const url = await uploadToBlob(data.profilePhoto, 'profile');
          profilePhotoUrl = url;
          console.log('Profile photo uploaded:', url);
        } catch (error) {
          toast.error("Failed to upload profile photo");
          setIsLoading(false);
          return;
        }
      }

      // 2. Upload Gallery Images to Vercel Blob
      if (data.serviceGallery.length > 0) {
        toast.info("Uploading gallery images...");
        const uploadPromises = data.serviceGallery.map(file => 
          uploadToBlob(file, 'gallery').catch(err => {
            console.error('Gallery upload failed:', err);
            return null;
          })
        );
        
        const galleryUrls = await Promise.all(uploadPromises);
        const validUrls = galleryUrls.filter(url => url !== null) as string[];
        galleryImageUrls = [...galleryImageUrls, ...validUrls];
        console.log('Gallery images uploaded:', validUrls.length);
      }

      // 3. Upload Documents to Vercel Blob
      if (data.verificationDocuments.length > 0) {
        toast.info("Uploading documents...");
        const uploadPromises = data.verificationDocuments.map(file => 
          uploadToBlob(file, 'document').catch(err => {
            console.error('Document upload failed:', err);
            return null;
          })
        );
        
        const documentUploadUrls = await Promise.all(uploadPromises);
        const validDocUrls = documentUploadUrls.filter(url => url !== null) as string[];
        documentUrls = [...documentUrls, ...validDocUrls];
        console.log('Documents uploaded:', validDocUrls.length);
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