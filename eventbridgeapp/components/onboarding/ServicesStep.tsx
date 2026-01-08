'use client';

import { useRef, useState } from 'react';
import {
  Calendar,
  CloudUpload,
  Plus,
  X,
  Check,
  Trash2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import type { OnboardingStepProps } from './types';
import { PRICING_STRUCTURES } from './types';
import { toast } from 'sonner';
import { upload } from '@vercel/blob/client';

export default function ServicesStep({
  data,
  updateData,
  onNext,
  onBack,
  onSaveDraft,
  isLoading,
}: OnboardingStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customPricingInput, setCustomPricingInput] = useState('');
  const [showCustomPricingInput, setShowCustomPricingInput] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentCount = data.serviceGallery?.length || 0;
    const newFilesCount = files.length;

    if (currentCount + newFilesCount > 10) {
      toast.error('You can only upload a maximum of 10 images.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    const validFiles: File[] = [];

    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image type`);
        return;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Max size is 5MB`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    setUploadingImages(true);

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const blob = await upload(
          `service-gallery/${Date.now()}-${file.name}`,
          file,
          {
            access: 'public',
            contentType: file.type,
            handleUploadUrl: ''
          }
        );

        return blob.url;
      });

      const newUrls = await Promise.all(uploadPromises);

      updateData({
        serviceGallery: [...(data.serviceGallery || []), ...newUrls],
      });

      toast.success(
        `${newUrls.length} image${newUrls.length > 1 ? 's' : ''} uploaded successfully`
      );
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload images'
      );
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    updateData({
      serviceGallery: (data.serviceGallery || []).filter((_, i) => i !== index),
    });
  };

  const togglePricingStructure = (structure: string) => {
    const current = data.pricingStructure || [];
    updateData({
      pricingStructure: current.includes(structure)
        ? current.filter((s) => s !== structure)
        : [...current, structure],
    });
  };

  const addCustomPricing = () => {
    const value = customPricingInput.trim();
    if (!value) return;

    updateData({
      customPricingStructure: [...(data.customPricingStructure || []), value],
      pricingStructure: [...(data.pricingStructure || []), value],
    });

    setCustomPricingInput('');
    setShowCustomPricingInput(false);
  };

  const removeCustomPricing = (structure: string) => {
    updateData({
      customPricingStructure: (data.customPricingStructure || []).filter(
        (s) => s !== structure
      ),
      pricingStructure: (data.pricingStructure || []).filter(
        (s) => s !== structure
      ),
    });
  };

  const isValid =
    (data.serviceDescription || '').trim().length >= 10 &&
    (data.pricingStructure || []).length > 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* UI below is unchanged */}
      {/* Everything else remains exactly as you had it */}
    </div>
  );
}
