'use client';

import { useRef, useState } from 'react';
import { Upload, FileText, Check, Shield, AlertCircle, Loader2 } from 'lucide-react';
import type { OnboardingStepProps } from './types';

export default function VerifyStep({
  data,
  updateData,
  onNext,
  onBack,
  onSaveDraft,
  isLoading,
}: OnboardingStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedDocs, setUploadedDocs] = useState<
    { name: string; size: string; status: 'uploaded' | 'pending' | 'verified' }[]
  >([]);

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newDocs = Array.from(files).map((file) => ({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        status: 'uploaded' as const,
      }));
      setUploadedDocs([...uploadedDocs, ...newDocs]);
      updateData({
        verificationDocuments: [...data.verificationDocuments, ...Array.from(files)],
      });
    }
  };

  const removeDocument = (index: number) => {
    setUploadedDocs(uploadedDocs.filter((_, i) => i !== index));
    updateData({
      verificationDocuments: data.verificationDocuments.filter((_, i) => i !== index),
    });
  };

  const isValid = data.agreedToTerms;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-shades-black mb-3">
          Verify your business
        </h1>
        <p className="text-neutrals-07">
          Complete verification to build trust with organizers and get priority in search results.
        </p>
      </div>

      {/* Verification Benefits */}
      <div className="bg-gradient-to-r from-primary-01/10 to-accents-peach/30 dark:from-primary-01/20 dark:to-accents-peach/10 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary-01 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-shades-black">Why get verified?</h3>
            <p className="text-xs text-neutrals-07">Stand out from the competition</p>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-3 text-sm">
          <li className="flex items-center gap-2 text-shades-black">
            <Check className="w-4 h-4 text-accents-discount" />
            Verified badge on profile
          </li>
          <li className="flex items-center gap-2 text-shades-black">
            <Check className="w-4 h-4 text-accents-discount" />
            Higher search ranking
          </li>
          <li className="flex items-center gap-2 text-shades-black">
            <Check className="w-4 h-4 text-accents-discount" />
            Priority support
          </li>
          <li className="flex items-center gap-2 text-shades-black">
            <Check className="w-4 h-4 text-accents-discount" />
            Increased trust
          </li>
        </ul>
      </div>

      {/* Document Upload */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-shades-black mb-2">
          Upload Verification Documents
        </label>
        <p className="text-xs text-neutrals-07 mb-4">
          Please upload any of the following: Business registration, Tax ID, Professional license,
          or Government-issued ID.
        </p>

        {/* Upload Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-neutrals-05 rounded-lg p-8 text-center cursor-pointer hover:border-primary-01 transition-colors bg-neutrals-02/50 dark:bg-neutrals-03/50 mb-4"
        >
          <Upload className="w-10 h-10 text-neutrals-06 mx-auto mb-3" />
          <p className="text-sm text-shades-black font-medium">Click to upload documents</p>
          <p className="text-xs text-neutrals-06 mt-1">PDF, JPG, PNG up to 10MB each</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          onChange={handleDocumentUpload}
          className="hidden"
        />

        {/* Uploaded Documents List */}
        {uploadedDocs.length > 0 && (
          <div className="space-y-2">
            {uploadedDocs.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-neutrals-02 dark:bg-neutrals-03 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutrals-03 dark:bg-neutrals-04 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-neutrals-07" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-shades-black">{doc.name}</p>
                    <p className="text-xs text-neutrals-06">{doc.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${doc.status === 'verified'
                        ? 'bg-accents-discount/10 text-accents-discount'
                        : doc.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-600'
                          : 'bg-neutrals-04 text-neutrals-07'
                      }`}
                  >
                    {doc.status === 'verified'
                      ? 'Verified'
                      : doc.status === 'pending'
                        ? 'Pending Review'
                        : 'Uploaded'}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="text-neutrals-06 hover:text-errors-main transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Summary */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-shades-black mb-4">Profile Summary</h3>
        <div className="bg-neutrals-02 dark:bg-neutrals-03 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-neutrals-07">Business Name</p>
              <p className="font-medium text-shades-black">
                {data.businessName || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-neutrals-07">Location</p>
              <p className="font-medium text-shades-black">
                {data.primaryLocation || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-neutrals-07">Categories</p>
              <p className="font-medium text-shades-black">
                {data.serviceCategories.slice(0, 2).join(', ')}
                {data.serviceCategories.length > 2 &&
                  ` +${data.serviceCategories.length - 2} more`}
              </p>
            </div>
            <div>
              <p className="text-neutrals-07">Price Range</p>
              <p className="font-medium text-shades-black">
                UGX {data.priceRange || 'Not set'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Agreement */}
      <div className="mb-10">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.agreedToTerms}
            onChange={(e) => updateData({ agreedToTerms: e.target.checked })}
            className="mt-1 h-5 w-5 rounded border-neutrals-04 bg-transparent text-primary-01 focus:ring-primary-01"
          />
          <span className="text-sm text-shades-black">
            I confirm that all information provided is accurate and I agree to the{' '}
            <a href="/terms" className="text-accents-link hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-accents-link hover:underline">
              Privacy Policy
            </a>
            . I understand that providing false information may result in account suspension.
          </span>
        </label>
      </div>

      {/* Info Alert */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-10 border border-blue-200 dark:border-blue-800">
        <AlertCircle className="w-5 h-5 text-accents-link flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-shades-black font-medium">What happens next?</p>
          <p className="text-xs text-neutrals-07 mt-1">
            After submitting, our team will review your profile and documents within 24-48 hours.
            You'll receive an email notification once your profile is approved.
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
            disabled={!isValid || isLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-01 text-white font-medium hover:bg-primary-02 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Complete Setup
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
