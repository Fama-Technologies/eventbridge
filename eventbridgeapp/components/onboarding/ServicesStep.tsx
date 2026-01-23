'use client';

import { useRef, useState } from 'react';
import {
  CloudUpload,
  Plus,
  X,
  Check,
  Trash2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import type { OnboardingStepProps } from './types';
import { PRICING_STRUCTURES, SERVICE_CATEGORIES } from './types';
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
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

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
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'gallery');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const result = await response.json();
        return result.url;
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

  const toggleCategory = (category: string) => {
    const current = data.serviceCategories;
    if (current.includes(category)) {
      updateData({ serviceCategories: current.filter((c) => c !== category) });
    } else {
      updateData({ serviceCategories: [...current, category] });
    }
  };

  const addCustomCategory = () => {
    const value = customCategoryInput.trim();
    if (!value || data.customServiceCategories.includes(value)) return;

    updateData({
      customServiceCategories: [...data.customServiceCategories, value],
      serviceCategories: [...data.serviceCategories, value],
    });
    setCustomCategoryInput('');
    setShowCustomInput(false);
  };

  const removeCustomCategory = (category: string) => {
    updateData({
      customServiceCategories: data.customServiceCategories.filter((c) => c !== category),
      serviceCategories: data.serviceCategories.filter((c) => c !== category),
    });
  };

  const displayedCategories = showAllCategories
    ? SERVICE_CATEGORIES
    : SERVICE_CATEGORIES.slice(0, 5);

  const isValid =
    data.serviceCategories.length > 0 &&
    (data.pricingStructure || []).length > 0 &&
    (data.workingDays || []).length > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-shades-black mb-3">Tell us about your services</h1>
          <p className="text-neutrals-07">
            Tell us which services you offer for the event types you selected so organizers can
            match with the right providers.
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

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-shades-black">Services You Offer</label>
          <button
            type="button"
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="text-sm text-primary-01 hover:text-primary-02 transition-colors"
          >
            {showAllCategories ? 'Show less' : 'View all'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {displayedCategories.map((category) => {
            const isSelected = data.serviceCategories.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-primary-01 text-white'
                    : 'bg-neutrals-03 text-shades-black border border-neutrals-04 hover:bg-neutrals-04'
                }`}
              >
                {isSelected && <Check className="w-4 h-4" />}
                {category}
              </button>
            );
          })}

          {data.customServiceCategories.map((category) => (
            <div
              key={category}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary-01 text-white"
            >
              <Check className="w-4 h-4" />
              {category}
              <button
                type="button"
                onClick={() => removeCustomCategory(category)}
                className="ml-1 hover:bg-primary-02 rounded-full p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {showCustomInput ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customCategoryInput}
                onChange={(e) => setCustomCategoryInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomCategory()}
                placeholder="Custom service"
                className="px-3 py-2 rounded-full text-sm bg-neutrals-02 border border-neutrals-04"
                autoFocus
              />
              <button
                type="button"
                onClick={addCustomCategory}
                className="p-2 rounded-full bg-primary-01 text-white hover:bg-primary-02"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomCategoryInput('');
                }}
                className="p-2 rounded-full bg-neutrals-04 text-shades-black hover:bg-neutrals-05"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-neutrals-02 border border-dashed border-neutrals-05 text-neutrals-07 hover:border-primary-01 hover:text-primary-01 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Custom
            </button>
          )}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-shades-black">Service Description</label>
          <span className="text-xs text-neutrals-06">{(data.serviceDescription || '').length}/500</span>
        </div>
        <textarea
          value={data.serviceDescription}
          onChange={(e) => {
            if (e.target.value.length <= 500) {
              updateData({ serviceDescription: e.target.value });
            }
          }}
          placeholder="Describe what you do... (optional)"
          rows={5}
          className="w-full px-4 py-3 rounded-lg bg-neutrals-02 border border-neutrals-04"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
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
                      ? 'bg-primary-01 text-shades-white'
                      : 'bg-neutrals-03 text-shades-black border border-neutrals-07'
                  }`}
                >
                  {structure}
                </button>
              );
            })}

            {(data.customPricingStructure || []).map((structure) => (
              <div
                key={structure}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary-01 text-white"
              >
                {structure}
                <button
                  type="button"
                  onClick={() => removeCustomPricing(structure)}
                  className="ml-1 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-2">
            {showCustomPricingInput ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customPricingInput}
                  onChange={(e) => setCustomPricingInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomPricing()}
                  placeholder="Custom structure"
                  className="px-3 py-2 rounded-full text-sm bg-neutrals-02 border border-neutrals-04"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={addCustomPricing}
                  className="p-2 rounded-full bg-primary-01 text-white"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomPricingInput(false);
                    setCustomPricingInput('');
                  }}
                  className="p-2 rounded-full bg-neutrals-04 text-shades-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCustomPricingInput(true)}
                className="flex items-center gap-1 text-sm text-neutrals-07"
              >
                <Plus className="w-4 h-4" />
                Add Custom
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-shades-black mb-2">Price Range</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutrals-06 text-sm">
              UGX
            </span>
            <input
              type="text"
              value={data.priceRange}
              onChange={(e) => updateData({ priceRange: e.target.value })}
              placeholder="100,000 - 1,000,000"
              className="w-full pl-14 pr-4 py-3 rounded-lg bg-neutrals-02 border border-neutrals-04"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-6 mb-8">
        <div className="col-span-7">
          <label className="block text-sm font-semibold text-shades-black mb-2">
            Working Hours
          </label>
          <div className="flex gap-2 flex-wrap">
            {['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'].map((day) => {
              const isSelected = (data.workingDays || []).includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    const currentDays = data.workingDays || [];
                    if (isSelected) {
                      updateData({ 
                        workingDays: currentDays.filter((d) => d !== day) 
                      });
                    } else {
                      updateData({ 
                        workingDays: [...currentDays, day] 
                      });
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all  ${
                    isSelected
                      ? 'bg-primary-01 text-shades-white'
                      : 'bg-neutrals-03 text-shades-black hover:bg-neutrals-04 border border-neutrals-07'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="col-span-3">
          <label className="block text-sm font-semibold text-shades-black mb-2">Experience</label>
          <input
            type="text"
            value={data.experience}
            onChange={(e) => updateData({ experience: e.target.value })}
            placeholder="e.g 5 years"
            className="w-full px-4 py-3 rounded-lg bg-neutrals-02 border border-neutrals-04"
          />
        </div>
      </div>

      <div className="mb-10">
        <label className="block text-sm font-semibold text-shades-black mb-2">Service Gallery</label>

        <div
          onClick={() => !uploadingImages && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-neutrals-05 rounded-lg p-8 text-center ${
            uploadingImages ? 'cursor-wait opacity-50' : 'cursor-pointer hover:border-primary-01'
          } bg-neutrals-02/50 mb-4`}
        >
          <CloudUpload className="w-10 h-10 text-neutrals-06 mx-auto mb-3" />
          <p className="text-sm font-medium text-shades-black">
            {uploadingImages ? 'Uploading...' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-neutrals-06 mt-1">PNG, JPG, SVG, GIF</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryUpload}
          className="hidden"
          disabled={uploadingImages}
        />

        {(data.serviceGallery || []).length > 0 && (
          <div className="flex flex-wrap gap-4">
            {data.serviceGallery?.map((url, index) => (
              <div
                key={index}
                className="relative w-28 h-28 rounded-lg overflow-hidden border-2 border-neutrals-04 group"
              >
                <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="absolute top-1 right-1 p-1.5 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-neutrals-04 mb-6" />

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="px-6 py-3 text-sm font-medium text-neutrals-07 hover:text-shades-black"
        >
          Back
        </button>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isLoading}
            className="px-6 py-3 text-sm font-medium text-neutrals-07 hover:text-shades-black"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!isValid || isLoading || uploadingImages}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary-01 text-white font-medium hover:bg-primary-02 disabled:opacity-50"
            style={{
              boxShadow: '0px 4px 6px -4px var(--primary012), 0px 10px 15px -3px var(--primary012)'
            }}
          >
            Next Step
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
