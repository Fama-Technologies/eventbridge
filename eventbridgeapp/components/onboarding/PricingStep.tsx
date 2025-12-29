'use client';

import { useState } from 'react';
import { DollarSign, Clock, Users, Percent, Plus, X, Check, Info, ArrowRight } from 'lucide-react';
import type { OnboardingStepProps } from './types';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: string;
  features: string[];
}

export default function PricingStep({
  data,
  updateData,
  onNext,
  onBack,
  onSaveDraft,
  isLoading,
}: OnboardingStepProps) {
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([
    {
      id: '1',
      name: 'Basic',
      description: 'Essential service package',
      price: '',
      features: [],
    },
  ]);
  const [newFeature, setNewFeature] = useState<{ [key: string]: string }>({});
  const [depositPercentage, setDepositPercentage] = useState('50');
  const [cancellationPolicy, setCancellationPolicy] = useState('flexible');

  const addPricingTier = () => {
    const newTier: PricingTier = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: '',
      features: [],
    };
    setPricingTiers([...pricingTiers, newTier]);
  };

  const removePricingTier = (id: string) => {
    if (pricingTiers.length > 1) {
      setPricingTiers(pricingTiers.filter((tier) => tier.id !== id));
    }
  };

  const updatePricingTier = (id: string, updates: Partial<PricingTier>) => {
    setPricingTiers(
      pricingTiers.map((tier) => (tier.id === id ? { ...tier, ...updates } : tier))
    );
  };

  const addFeatureToTier = (tierId: string) => {
    const feature = newFeature[tierId]?.trim();
    if (feature) {
      const tier = pricingTiers.find((t) => t.id === tierId);
      if (tier) {
        updatePricingTier(tierId, { features: [...tier.features, feature] });
        setNewFeature({ ...newFeature, [tierId]: '' });
      }
    }
  };

  const removeFeatureFromTier = (tierId: string, featureIndex: number) => {
    const tier = pricingTiers.find((t) => t.id === tierId);
    if (tier) {
      updatePricingTier(tierId, {
        features: tier.features.filter((_, i) => i !== featureIndex),
      });
    }
  };

  const isValid = pricingTiers.some((tier) => tier.name && tier.price);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-shades-black mb-3">Set your pricing</h1>
          <p className="text-neutrals-07">
            Define your service packages and pricing options. You can always update these later.
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

      {/* Summary from previous steps */}
      <div className="bg-neutrals-02 dark:bg-neutrals-03 rounded-lg p-4 mb-8">
        <h3 className="text-sm font-semibold text-shades-black mb-2">Pricing Summary</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-neutrals-07">
            <DollarSign className="w-4 h-4" />
            <span>
              Structure:{' '}
              <span className="text-shades-black">
                {data.pricingStructure.join(', ') || 'Not set'}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-neutrals-07">
            <span>
              Range:{' '}
              <span className="text-shades-black">
                UGX {data.priceRange || 'Not set'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-shades-black">Service Packages</label>
          <button
            type="button"
            onClick={addPricingTier}
            className="flex items-center gap-1 text-sm text-primary-01 hover:text-primary-02 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Package
          </button>
        </div>

        <div className="space-y-4">
          {pricingTiers.map((tier, index) => (
            <div
              key={tier.id}
              className="bg-neutrals-02 dark:bg-neutrals-03 rounded-lg p-4 border border-neutrals-04"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-medium text-primary-01 bg-primary-01/10 px-2 py-1 rounded">
                  Package {index + 1}
                </span>
                {pricingTiers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePricingTier(tier.id)}
                    className="text-neutrals-06 hover:text-errors-main transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-neutrals-07 mb-1">Package Name</label>
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => updatePricingTier(tier.id, { name: e.target.value })}
                    placeholder="e.g. Basic, Premium"
                    className="w-full px-3 py-2 rounded-lg bg-shades-white dark:bg-neutrals-02 border border-neutrals-04 text-sm text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutrals-07 mb-1">Price (UGX)</label>
                  <input
                    type="text"
                    value={tier.price}
                    onChange={(e) => updatePricingTier(tier.id, { price: e.target.value })}
                    placeholder="e.g. 500,000"
                    className="w-full px-3 py-2 rounded-lg bg-shades-white dark:bg-neutrals-02 border border-neutrals-04 text-sm text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-neutrals-07 mb-1">Description</label>
                <input
                  type="text"
                  value={tier.description}
                  onChange={(e) => updatePricingTier(tier.id, { description: e.target.value })}
                  placeholder="Brief description of what's included"
                  className="w-full px-3 py-2 rounded-lg bg-shades-white dark:bg-neutrals-02 border border-neutrals-04 text-sm text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none"
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-xs text-neutrals-07 mb-2">What's Included</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tier.features.map((feature, featureIndex) => (
                    <span
                      key={featureIndex}
                      className="flex items-center gap-1 px-3 py-1 bg-shades-white dark:bg-neutrals-02 rounded-full text-xs text-shades-black"
                    >
                      <Check className="w-3 h-3 text-accents-discount" />
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeatureFromTier(tier.id, featureIndex)}
                        className="ml-1 text-neutrals-06 hover:text-errors-main"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFeature[tier.id] || ''}
                    onChange={(e) =>
                      setNewFeature({ ...newFeature, [tier.id]: e.target.value })
                    }
                    onKeyPress={(e) => e.key === 'Enter' && addFeatureToTier(tier.id)}
                    placeholder="Add a feature..."
                    className="flex-1 px-3 py-2 rounded-lg bg-shades-white dark:bg-neutrals-02 border border-neutrals-04 text-xs text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addFeatureToTier(tier.id)}
                    className="p-2 rounded-lg bg-primary-01 text-white hover:bg-primary-02"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deposit & Cancellation */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-semibold text-shades-black mb-2">
            Deposit Required
          </label>
          <div className="relative">
            <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutrals-06" />
            <input
              type="number"
              min="0"
              max="100"
              value={depositPercentage}
              onChange={(e) => setDepositPercentage(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-neutrals-02 dark:bg-neutrals-03 border border-neutrals-04 text-shades-black focus:border-primary-01 focus:outline-none"
            />
          </div>
          <p className="text-xs text-neutrals-06 mt-1">Percentage of total upfront</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-shades-black mb-2">
            Cancellation Policy
          </label>
          <textarea
            value={cancellationPolicy}
            onChange={(e) => setCancellationPolicy(e.target.value)}
            placeholder="Describe your cancellation and refund policy..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg bg-neutrals-02 dark:bg-neutrals-03 border border-neutrals-04 text-shades-black focus:border-primary-01 focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="flex items-start gap-3 p-4 bg-accents-peach/30 dark:bg-accents-peach/10 rounded-lg mb-10">
        <Info className="w-5 h-5 text-primary-01 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-shades-black font-medium">Pricing Tips</p>
          <p className="text-xs text-neutrals-07 mt-1">
            Be transparent about your pricing. Organizers appreciate clear pricing information.
            You can always negotiate final prices based on specific event requirements.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-neutrals-04 mb-6" />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="px-6 py-3 text-sm font-medium text-neutrals-07 hover:text-shades-black transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isLoading}
            className="px-6 py-3 text-sm font-medium text-neutrals-07 hover:text-shades-black transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={isLoading}
            className="px-6 py-3 text-sm font-medium text-neutrals-07 hover:text-shades-black transition-colors disabled:opacity-50"
          >
            Skip for Now
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!isValid || isLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-[50px] bg-primary-01 text-white font-medium hover:bg-primary-02 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Step
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
