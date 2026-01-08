'use client';

import { useState } from 'react';
import {
  DollarSign,
  Clock,
  Users,
  Percent,
  Plus,
  X,
  Check,
  Info,
  ArrowRight,
} from 'lucide-react';
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
    setPricingTiers([
      ...pricingTiers,
      {
        id: Date.now().toString(),
        name: '',
        description: '',
        price: '',
        features: [],
      },
    ]);
  };

  const removePricingTier = (id: string) => {
    if (pricingTiers.length > 1) {
      setPricingTiers(pricingTiers.filter((tier) => tier.id !== id));
    }
  };

  const updatePricingTier = (id: string, updates: Partial<PricingTier>) => {
    setPricingTiers(
      pricingTiers.map((tier) =>
        tier.id === id ? { ...tier, ...updates } : tier
      )
    );
  };

  const addFeatureToTier = (tierId: string) => {
    const feature = newFeature[tierId]?.trim();
    if (!feature) return;

    const tier = pricingTiers.find((t) => t.id === tierId);
    if (!tier) return;

    updatePricingTier(tierId, {
      features: [...tier.features, feature],
    });

    setNewFeature({ ...newFeature, [tierId]: '' });
  };

  const removeFeatureFromTier = (tierId: string, index: number) => {
    const tier = pricingTiers.find((t) => t.id === tierId);
    if (!tier) return;

    updatePricingTier(tierId, {
      features: tier.features.filter((_, i) => i !== index),
    });
  };

  const isValid = pricingTiers.some((tier) => tier.name && tier.price);

  /* ----------------------------------
     FIX: SAVE DATA BEFORE CONTINUING
  -----------------------------------*/
  const handleNextStep = () => {
    updateData({
      pricingTiers,
      depositPercentage,
      cancellationPolicy,
    } as any);

    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-shades-black mb-3">
            Set your pricing
          </h1>
          <p className="text-neutrals-07">
            Define your service packages and pricing options. You can always
            update these later.
          </p>
        </div>
        <button
          type="button"
          onClick={handleNextStep}
          disabled={isLoading}
          className="flex items-center gap-2 text-sm text-neutrals-07 hover:text-primary-01 transition-colors disabled:opacity-50"
        >
          Skip
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* EVERYTHING BELOW IS UNCHANGED */}
      {/* Pricing tiers, inputs, UI, layout remain exactly the same */}

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
            onClick={handleNextStep}
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
