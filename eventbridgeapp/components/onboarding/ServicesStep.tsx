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

  /* =========================
  SERVICE GALLERY HANDLING
     ========================= */

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const previews = files.map((file) => URL.createObjectURL(file));

    updateData({
      serviceGallery: [...data.serviceGallery, ...files],
      serviceGalleryPreviews: [
        ...data.serviceGalleryPreviews,
        ...previews,
      ],
    });

    // Reset input so same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeGalleryImage = (index: number) => {
    URL.revokeObjectURL(data.serviceGalleryPreviews[index]);

    updateData({
      serviceGallery: data.serviceGallery.filter((_, i) => i !== index),
      serviceGalleryPreviews: data.serviceGalleryPreviews.filter(
        (_, i) => i !== index
      ),
    });
  };

  /* =========================
  PRICING STRUCTURE
     ========================= */

  const togglePricingStructure = (structure: string) => {
    const current = data.pricingStructure;
    if (current.includes(structure)) {
      updateData({
        pricingStructure: current.filter((s) => s !== structure),
      });
    } else {
      updateData({
        pricingStructure: [...current, structure],
      });
    }
  };

  const addCustomPricing = () => {
    if (
      customPricingInput.trim() &&
      !data.customPricingStructure.includes(customPricingInput.trim())
    ) {
      updateData({
        customPricingStructure: [
          ...data.customPricingStructure,
          customPricingInput.trim(),
        ],
        pricingStructure: [
          ...data.pricingStructure,
          customPricingInput.trim(),
        ],
      });
      setCustomPricingInput('');
      setShowCustomPricingInput(false);
    }
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
      {/* Header */}
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-shades-black mb-3">
            Tell us about your services
          </h1>
          <p className="text-neutrals-07">
            Provide details that help organizers understand what you offer and
            match with the right events.
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
          <label className="text-sm font-semibold text-shades-black">
            Service Description
          </label>
          <span className="text-xs text-neutrals-06">
            {data.serviceDescription.length}/500
          </span>
        </div>
        <textarea
          value={data.serviceDescription}
          onChange={(e) => {
            if (e.target.value.length <= 500) {
              updateData({ serviceDescription: e.target.value });
            }
          }}
          rows={5}
          placeholder="Describe what you do, your style, and what makes your service unique..."
          className="w-full px-4 py-3 rounded-lg bg-neutrals-02 border border-neutrals-04 focus:border-primary-01 focus:outline-none resize-none"
        />
      </div>

      {/* Pricing & Price Range */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-semibold mb-2">
            Pricing Structure
          </label>
          <div className="flex flex-wrap gap-2">
            {PRICING_STRUCTURES.slice(0, 3).map((structure) => {
              const isSelected =
                data.pricingStructure.includes(structure);
              return (
                <button
                  key={structure}
                  type="button"
                  onClick={() => togglePricingStructure(structure)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    isSelected
                      ? 'bg-primary-01 text-white'
                      : 'bg-neutrals-03 border border-neutrals-04'
                  }`}
                >
                  {structure}
                </button>
              );
            })}

            {data.customPricingStructure.map((structure) => (
              <div
                key={structure}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-01 text-white text-sm"
              >
                {structure}
                <button
                  type="button"
                  onClick={() => removeCustomPricing(structure)}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-2">
            {showCustomPricingInput ? (
              <div className="flex gap-2">
                <input
                  value={customPricingInput}
                  onChange={(e) =>
                    setCustomPricingInput(e.target.value)
                  }
                  onKeyDown={(e) =>
                    e.key === 'Enter' && addCustomPricing()
                  }
                  className="px-3 py-2 rounded-full border"
                  placeholder="Custom pricing"
                  autoFocus
                />
                <button onClick={addCustomPricing}>
                  <Check />
                </button>
                <button
                  onClick={() => setShowCustomPricingInput(false)}
                >
                  <X />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCustomPricingInput(true)}
                className="text-sm text-neutrals-07"
              >
                <Plus className="inline w-4 h-4" /> Add Custom
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Price Range
          </label>
          <input
            value={data.priceRange}
            onChange={(e) =>
              updateData({ priceRange: e.target.value })
            }
            placeholder="e.g. 100,000 - 1,000,000"
            className="w-full px-4 py-3 rounded-lg border"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2">
          <label className="block text-sm font-semibold mb-2">
            General Availability
          </label>
          <input
            value={data.generalAvailability}
            onChange={(e) =>
              updateData({ generalAvailability: e.target.value })
            }
            placeholder="Weekends, weekdays, etc"
            className="w-full px-4 py-3 rounded-lg border"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">
            Experience
          </label>
          <input
            value={data.experience}
            onChange={(e) =>
              updateData({ experience: e.target.value })
            }
            placeholder="e.g. 5 years"
            className="w-full px-4 py-3 rounded-lg border"
          />
        </div>
      </div>

      {/* Service Gallery */}
      <div className="mb-10">
        <label className="block text-sm font-semibold mb-2">
          Service Gallery (Images & Videos)
        </label>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer mb-4"
        >
          <CloudUpload className="mx-auto mb-2" />
          <p>Click to upload images or videos</p>
          <p className="text-xs text-neutrals-06">
            Images or MP4 videos supported
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleGalleryUpload}
          className="hidden"
        />

        {data.serviceGalleryPreviews.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {data.serviceGalleryPreviews.map((preview, index) => (
              <div
                key={index}
                className="relative w-28 h-28 rounded-lg overflow-hidden border group"
              >
                {data.serviceGallery[index]?.type.startsWith(
                  'video/'
                ) ? (
                  <video
                    src={preview}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={preview}
                    className="w-full h-full object-cover"
                  />
                )}

                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button onClick={onBack}>Back</button>
        <div className="flex gap-4">
          <button onClick={onSaveDraft}>Save Draft</button>
          <button
            onClick={onNext}
            disabled={!isValid || isLoading}
            className="bg-primary-01 text-white px-6 py-3 rounded-full"
          >
            Next Step <ArrowRight className="inline w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
