'use client';

import { useRef, useState } from 'react';
import { Camera, MapPin, Plus, X, Check, ArrowRight, Loader2 } from 'lucide-react';
import type { OnboardingStepProps } from './types';
import { SERVICE_CATEGORIES } from './types';

export default function ProfileSetupStep({
  data,
  updateData,
  onNext,
  onSaveDraft,
  isLoading,
}: OnboardingStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Only preview; no upload in this step
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateData({
          profilePhotoPreview: reader.result as string,
          profilePhoto: file,            // Store file for final submit
          profilePhotoUrl: null,         // Reset url until submit uploads it
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Photo load failed:', error);
      alert('Failed to load photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = () => {
    updateData({
      profilePhoto: null,
      profilePhotoPreview: '',
      profilePhotoUrl: null,
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
    if (customCategoryInput.trim() && !data.customCategories.includes(customCategoryInput.trim())) {
      updateData({
        customCategories: [...data.customCategories, customCategoryInput.trim()],
        serviceCategories: [...data.serviceCategories, customCategoryInput.trim()],
      });
      setCustomCategoryInput('');
      setShowCustomInput(false);
    }
  };

  const removeCustomCategory = (category: string) => {
    updateData({
      customCategories: data.customCategories.filter((c) => c !== category),
      serviceCategories: data.serviceCategories.filter((c) => c !== category),
    });
  };

  const displayedCategories = showAllCategories
    ? SERVICE_CATEGORIES
    : SERVICE_CATEGORIES.slice(0, 5);

  const isValid = data.businessName.trim() && data.serviceCategories.length > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-shades-black mb-3">
          Welcome! Set up your service
          <br />
          provider profile
        </h1>
        <p className="text-neutrals-07">
          Reach more event organizers and grow your business by completing your public profile.
        </p>
      </div>

      {/* Profile Photo */}
      <div className="flex items-center gap-6 mb-8">
        <div className="relative">
          <div
            onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
            className={`w-28 h-28 rounded-full border-2 border-dashed border-neutrals-05 flex flex-col items-center justify-center ${
              uploadingPhoto ? 'cursor-wait opacity-50' : 'cursor-pointer hover:border-primary-01'
            } transition-colors overflow-hidden bg-neutrals-02 dark:bg-neutrals-03`}
          >
            {uploadingPhoto ? (
              <Loader2 className="w-6 h-6 text-neutrals-06 animate-spin" />
            ) : data.profilePhotoPreview ? (
              <img
                src={data.profilePhotoPreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <Camera className="w-6 h-6 text-neutrals-06 mb-1" />
                <span className="text-xs text-neutrals-06">Upload</span>
              </>
            )}
          </div>

          {data.profilePhotoPreview && !uploadingPhoto && (
            <button
              type="button"
              onClick={removePhoto}
              className="absolute -top-1 -right-1 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handlePhotoUpload}
          className="hidden"
          disabled={uploadingPhoto}
        />

        <div>
          <h3 className="font-semibold text-shades-black mb-1">Profile Photo</h3>
          <p className="text-sm text-neutrals-07 max-w-ls">
            Upload your business logo or a professional photo of yourself.
          </p>
          <p className="text-xs text-neutrals-06 mt-1">Supported: JPG, PNG. Max 5MB.</p>
        </div>
      </div>

      {/* Business Name */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-shades-black mb-2">
          Business Name
        </label>
        <input
          type="text"
          value={data.businessName}
          onChange={(e) => updateData({ businessName: e.target.value })}
          placeholder="e.g. Acme Event Solutions"
          className="w-full px-4 py-3 rounded-lg bg-neutrals-02 dark:bg-neutrals-03 border border-neutrals-04 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none transition-colors"
        />
      </div>

      {/* Service Categories */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-shades-black">Service Categories</label>
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
                    : 'bg-neutrals-03 dark:bg-neutrals-02 text-shades-black hover:bg-neutrals-04'
                }`}
              >
                {isSelected && <Check className="w-4 h-4" />}
                {category}
              </button>
            );
          })}

          {data.customCategories.map((category) => (
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
                <X className="w-3 h-3" />
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
                placeholder="Custom category"
                className="px-3 py-2 rounded-full text-sm bg-neutrals-02 dark:bg-neutrals-03 border border-neutrals-04 focus:border-primary-01 focus:outline-none"
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
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-neutrals-02 dark:bg-neutrals-03 border border-dashed border-neutrals-05 text-neutrals-07 hover:border-primary-01 hover:text-primary-01 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Custom
            </button>
          )}
        </div>
      </div>

      {/* Primary Location & Country */}
      <div className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Country */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-shades-black mb-2">
              Country
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutrals-06" />
              <input
                type="text"
                value={(data as any).country || ''}
                onChange={(e) => updateData({ country: e.target.value } as any)}
                placeholder="Enter Country"
                className="w-full pl-12 pr-4 py-3 rounded-[34px] bg-neutrals-02 dark:bg-neutrals-03 border border-neutrals-04 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Primary Location */}
          <div className="md:col-span-4">
            <label className="block text-sm font-semibold text-shades-black mb-2">
              Primary Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutrals-06" />
              <input
                type="text"
                value={data.primaryLocation}
                onChange={(e) => updateData({ primaryLocation: e.target.value })}
                placeholder="Start typing city, state or zip..."
                className="w-full pl-12 pr-4 py-3 rounded-[34px] bg-neutrals-02 dark:bg-neutrals-03 border border-neutrals-04 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-neutrals-06 mt-2">
          We'll use this to match you with local events.
        </p>
      </div>

      <div className="border-t border-neutrals-04 mb-6" />

      {/* Footer Buttons */}
      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isLoading || uploadingPhoto}
            className="px-6 py-3 text-sm font-medium text-neutrals-07 hover:text-shades-black transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!isValid || isLoading || uploadingPhoto}
            className="flex items-center gap-2 px-6 py-3 rounded-[50px] bg-primary-01 text-shades-white font-medium hover:bg-primary-02 transition-colors disabled:opacity-50"
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
