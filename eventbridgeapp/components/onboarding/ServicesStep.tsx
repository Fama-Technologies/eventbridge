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
} from 'lucide-react';
import type { OnboardingStepProps } from './types';
import { PRICING_STRUCTURES } from './types';

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

  const uploadImageToBlob = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'gallery');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const text = await response.text();

    let result: any;
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error('Upload failed: invalid server response');
    }

    if (!response.ok) {
      throw new Error(result.error || 'Upload failed');
    }

    return result.url;
  };

  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentCount = data.galleryImageUrls.length;
    if (currentCount + files.length > 10) {
      alert('You can only upload a maximum of 10 images.');
      return;
    }

    setUploadingImages(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const url = await uploadImageToBlob(file);
        uploadedUrls.push(url);
      }

      updateData({
        galleryImageUrls: [...data.galleryImageUrls, ...uploadedUrls],
        serviceGalleryPreviews: [
          ...data.serviceGalleryPreviews,
          ...uploadedUrls,
        ],
      });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeGalleryImage = async (index: number) => {
    const urlToDelete = data.galleryImageUrls[index];

    if (urlToDelete) {
      try {
        await fetch(`/api/upload?url=${encodeURIComponent(urlToDelete)}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }

    updateData({
      galleryImageUrls: data.galleryImageUrls.filter((_, i) => i !== index),
      serviceGalleryPreviews: data.serviceGalleryPreviews.filter(
        (_, i) => i !== index
      ),
    });
  };

  const togglePricingStructure = (structure: string) => {
    if (data.pricingStructure.includes(structure)) {
      updateData({
        pricingStructure: data.pricingStructure.filter(
          (s) => s !== structure
        ),
      });
    } else {
      updateData({
        pricingStructure: [...data.pricingStructure, structure],
      });
    }
  };

  const addCustomPricing = () => {
    const value = customPricingInput.trim();
    if (!value) return;

    if (!data.customPricingStructure.includes(value)) {
      updateData({
        customPricingStructure: [...data.customPricingStructure, value],
        pricingStructure: [...data.pricingStructure, value],
      });
    }

    setCustomPricingInput('');
    setShowCustomPricingInput(false);
  };

  const removeCustomPricing = (structure: string) => {
    updateData({
      customPricingStructure: data.customPricingStructure.filter(
        (s) => s !== structure
      ),
      pricingStructure: data.pricingStructure.filter(
        (s) => s !== structure
      ),
    });
  };

  const isValid =
    data.serviceDescription.trim().length >= 10 &&
    data.pricingStructure.length > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-3">
            Tell us about your services
          </h1>
          <p className="text-neutrals-07">
            Provide details that help organizers understand what you offer.
          </p>
        </div>
        <button
          type="button"
          onClick={onNext}
          disabled={isLoading}
          className="flex items-center gap-2 text-sm"
        >
          Skip <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <textarea
        value={data.serviceDescription}
        onChange={(e) =>
          e.target.value.length <= 500 &&
          updateData({ serviceDescription: e.target.value })
        }
        rows={5}
        className="w-full mb-6 p-4 rounded-lg border"
        placeholder="Describe what you do"
      />

      <div className="mb-6">
        <label className="block mb-2 font-semibold">Pricing Structure</label>
        <div className="flex flex-wrap gap-2">
          {PRICING_STRUCTURES.map((structure) => (
            <button
              key={structure}
              type="button"
              onClick={() => togglePricingStructure(structure)}
              className={`px-4 py-2 rounded-full ${
                data.pricingStructure.includes(structure)
                  ? 'bg-primary-01 text-white'
                  : 'border'
              }`}
            >
              {structure}
            </button>
          ))}
        </div>

        <div className="mt-3">
          {showCustomPricingInput ? (
            <div className="flex gap-2">
              <input
                value={customPricingInput}
                onChange={(e) => setCustomPricingInput(e.target.value)}
                className="border px-3 py-2 rounded-full"
                autoFocus
              />
              <button onClick={addCustomPricing}>
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setShowCustomPricingInput(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowCustomPricingInput(true)}>
              <Plus className="w-4 h-4 inline" /> Add Custom
            </button>
          )}
        </div>
      </div>

      <div
        onClick={() => !uploadingImages && fileInputRef.current?.click()}
        className="border-2 border-dashed p-8 text-center cursor-pointer mb-4"
      >
        <CloudUpload className="mx-auto mb-2" />
        {uploadingImages ? 'Uploading...' : 'Click to upload images'}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleGalleryUpload}
        className="hidden"
      />

      <div className="flex flex-wrap gap-4">
        {data.galleryImageUrls.map((url, index) => (
          <div key={url} className="relative w-28 h-28">
            <img src={url} className="object-cover w-full h-full rounded" />
            <button
              onClick={() => removeGalleryImage(index)}
              className="absolute top-1 right-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-10">
        <button onClick={onBack}>Back</button>
        <div className="flex gap-4">
          <button onClick={onSaveDraft}>Save Draft</button>
          <button
            onClick={onNext}
            disabled={!isValid || isLoading || uploadingImages}
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  );
}
