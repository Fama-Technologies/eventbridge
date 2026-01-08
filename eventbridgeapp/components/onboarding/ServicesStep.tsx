'use client';

import { useRef, useState } from 'react';
import { Calendar, CloudUpload, Plus, X, Check, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import type { OnboardingStepProps } from './types';
import { PRICING_STRUCTURES } from './types';
import { toast } from 'sonner';

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

    // Validate file types and sizes
    const validFiles: File[] = [];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

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
      // Upload all files
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        return await response.json();
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      // Get URLs from uploaded files
      const newUrls = uploadedFiles.map((file) => file.url);

      // Update data with new URLs
      updateData({
        serviceGallery: [...(data.serviceGallery || []), ...newUrls],
      });

      toast.success(`${validFiles.length} image${validFiles.length > 1 ? 's' : ''} uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setUploadingImages(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = (data.serviceGallery || []).filter((_, i) => i !== index);
    updateData({
      serviceGallery: newGallery,
    });
  };

  const togglePricingStructure = (structure: string) => {
    const current = data.pricingStructure || [];
    if (current.includes(structure)) {
      updateData({ pricingStructure: current.filter((s) => s !== structure) });
    } else {
      updateData({ pricingStructure: [...current, structure] });
    }
  };

  const addCustomPricing = () => {
    if (customPricingInput.trim() && !(data.customPricingStructure || []).includes(customPricingInput.trim())) {
      updateData({
        customPricingStructure: [...(data.customPricingStructure || []), customPricingInput.trim()],
        pricingStructure: [...(data.pricingStructure || []), customPricingInput.trim()],
      });
      setCustomPricingInput('');
      setShowCustomPricingInput(false);
    }
  };

  const removeCustomPricing = (structure: string) => {
    updateData({
      customPricingStructure: (data.customPricingStructure || []).filter((s) => s !== structure),
      pricingStructure: (data.pricingStructure || []).filter((s) => s !== structure),
    });
  };

  const isValid =
    (data.serviceDescription || '').trim().length >= 10 && 
    (data.pricingStructure || []).length > 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-shades-black mb-3">Tell us about your services</h1>
          <p className="text-neutrals-07">
            Provide details that help organizers understand what you offer and match with the right
            events.
          </p>
        </div>
        <button
          type="button"
          onClick={onNext}
          disabled={isLoading}
          className="flex items-center gap-2 text-sm text-neutrals-07 hover:text-primary-01 transition-colors disabled:opacity-50"
        >
          Skip
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Service Description */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-shades-black">Service Description</label>
          <span className="text-xs text-neutrals-06">{(data.serviceDescription || '').length}/500</span>
        </div>
        <textarea
          value={data.serviceDescription || ''}
          onChange={(e) => {
            if (e.target.value.length <= 500) {
              updateData({ serviceDescription: e.target.value });
            }
          }}
          placeholder="Describe what you do, your style, and what makes your service unique..."
          rows={5}
          className="w-full px-4 py-3 rounded-lg bg-neutrals-02 dark:bg-neutrals-03 border border-neutrals-04 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none transition-colors resize-none"
        />
        <p className="text-xs text-neutrals-06 mt-2 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Be descriptive, this is the first thing organizers will read.
        </p>
      </div>

      {/* Pricing Structure & Price Range Row */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Pricing Structure */}
        <div>
          <label className="block text-sm font-semibold text-shades-black mb-2">
            Pricing Structure
          </label>
          <div className="flex flex-wrap gap-2">
            {PRICING_STRUCTURES.slice(0, 3).map((structure) => {
              const isSelected = (data.pricingStructure || []).includes(structure);
              return (
                <button
                  key={structure}
                  type="button"
                  onClick={() => togglePricingStructure(structure)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-primary-01 text-white'
                      : 'bg-neutrals-03 dark:bg-neutrals-02 text-shades-black hover:bg-neutrals-04 border border-neutrals-04'
                  }`}
                >
                  {structure}
                </button>
              );
            })}

            {/* Custom pricing structures */}
            {(data.customPricingStructure || []).map((structure) => (
              <div
                key={structure}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary-01 text-white"
              >
                {structure}
                <button
                  type="button"
                  onClick={() => removeCustomPricing(structure)}
                  className="ml-1 hover:bg-primary-02 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Custom Button */}
          <div className="mt-2">
            {showCustomPricingInput ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customPricingInput}
                  onChange={(e) => setCustomPricingInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomPricing()}
                  placeholder="Custom structure"
                  className="px-3 py-2 rounded-full text-sm bg-neutrals-02 dark:bg-neutrals-03 border border-neutrals-04 focus:border-primary-01 focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={addCustomPricing}
                  className="p-2 rounded-full bg-primary-01 text-white hover:bg-primary-02"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomPricingInput(false);
                    setCustomPricingInput('');
                  }}
                  className="p-2 rounded-full bg-neutrals-04 text-shades-black hover:bg-neutrals-05"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCustomPricingInput(true)}
                className="flex items-center gap-1 text-sm text-neutrals-07 hover:text-primary-01 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Custom
              </button>
            )}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-semibold text-shades-black mb-2">Price Range</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutrals-06 text-sm">
              UGX
            </span>
            <input
              type="text"
              value={data.priceRange || ''}
              onChange={(e) => updateData({ priceRange: e.target.value })}
              placeholder="e.g. 100,000 - 1,000,000"
              className="w-full pl-14 pr-4 py-3 rounded-lg bg-neutrals-02 dark:bg-neutrals-03 border border-neutrals-04 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* General Availability */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-shades-black mb-2">
            General Availability
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutrals-06" />
            <input
              type="text"
              value={data.generalAvailability || ''}
              onChange={(e) => updateData({ generalAvailability: e.target.value })}
              placeholder="e.g. Weekends, Mon-Fri after 5pm, or Specific Dates"
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-neutrals-02 dark:bg-neutrals-03 border border-neutrals-04 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none transition-colors"
            />
          </div>
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-shades-black mb-2">
            Experience
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.experience || ''}
              onChange={(e) => updateData({ experience: e.target.value })}
              placeholder="e.g. 5 years"
              className="w-full px-4 py-3 rounded-lg bg-neutrals-02 dark:bg-neutrals-03 border border-neutrals-04 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Service Gallery */}
      <div className="mb-10">
        <label className="block text-sm font-semibold text-shades-black mb-2">
          Service Gallery {uploadingImages && <span className="text-xs text-neutrals-06">(Uploading...)</span>}
        </label>

        {/* Upload Zone */}
        <div
          onClick={() => !uploadingImages && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-neutrals-05 rounded-lg p-8 text-center cursor-pointer hover:border-primary-01 transition-colors bg-neutrals-02/50 dark:bg-neutrals-03/50 mb-4 ${
            uploadingImages ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploadingImages ? (
            <Loader2 className="w-10 h-10 text-primary-01 mx-auto mb-3 animate-spin" />
          ) : (
            <CloudUpload className="w-10 h-10 text-neutrals-06 mx-auto mb-3" />
          )}
          <p className="text-sm text-shades-black font-medium">
            {uploadingImages ? 'Uploading images...' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-neutrals-06 mt-1">JPG, PNG, WEBP (MAX. 5MB per image, 10 images max)</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleGalleryUpload}
          disabled={uploadingImages}
          className="hidden"
        />

        {/* Gallery Preview */}
        {(data.serviceGallery || []).length > 0 && (
          <div className="flex flex-wrap gap-4">
            {(data.serviceGallery || []).map((url, index) => (
              <div
                key={index}
                className="relative w-28 h-28 rounded-lg overflow-hidden border-2 border-neutrals-04 group"
              >
                <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="absolute top-1 right-1 p-1.5 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-neutrals-04 mb-6" />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading || uploadingImages}
          className="px-6 py-3 text-sm font-medium text-neutrals-07 hover:text-shades-black transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isLoading || uploadingImages}
            className="px-6 py-3 text-sm font-medium text-neutrals-07 hover:text-shades-black transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!isValid || isLoading || uploadingImages}
            className="flex items-center gap-2 px-6 py-3 rounded-[50px] bg-primary-01 text-white font-medium hover:bg-primary-02 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Next Step
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}