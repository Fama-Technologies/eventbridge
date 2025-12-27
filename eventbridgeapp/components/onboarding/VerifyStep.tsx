'use client';

import { useRef, useState, useEffect } from 'react';
import { Shield, Clock, FileText, ArrowRight, X, Upload } from 'lucide-react';
import type { OnboardingStepProps } from './types';
import Image from 'next/image';
import PDFPreview from './PDFPreview';

export default function VerifyStep({
  data,
  updateData,
  onNext,
  onBack,
  onSaveDraft,
  isLoading,
}: OnboardingStepProps) {
  const businessLicenseRef = useRef<HTMLInputElement>(null);
  const tinDocumentRef = useRef<HTMLInputElement>(null);
  const locationProofRef = useRef<HTMLInputElement>(null);

  const [businessLicenseFiles, setBusinessLicenseFiles] = useState<File[]>([]);
  const [tinDocumentFiles, setTinDocumentFiles] = useState<File[]>([]);
  const [locationProofFiles, setLocationProofFiles] = useState<File[]>([]);

  const [businessLicensePreviews, setBusinessLicensePreviews] = useState<string[]>([]);
  const [tinDocumentPreviews, setTinDocumentPreviews] = useState<string[]>([]);
  const [locationProofPreviews, setLocationProofPreviews] = useState<string[]>([]);

  const [dragActive, setDragActive] = useState<{
    businessLicense: boolean;
    tinDocument: boolean;
    locationProof: boolean;
  }>({
    businessLicense: false,
    tinDocument: false,
    locationProof: false,
  });

  const createPreviewUrl = (file: File): string | null => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const updateAllDocuments = (
    business: File[],
    tin: File[],
    location: File[]
  ) => {
    const allFiles = [...business, ...tin, ...location];
    updateData({
      verificationDocuments: allFiles,
    });
  };

  const handleFileUpload = (
    files: FileList | null,
    fileType: 'businessLicense' | 'tinDocument' | 'locationProof'
  ) => {
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map(file => createPreviewUrl(file) || '');

      if (fileType === 'businessLicense') {
        const updatedFiles = [...businessLicenseFiles, ...newFiles];
        setBusinessLicenseFiles(updatedFiles);
        setBusinessLicensePreviews([...businessLicensePreviews, ...newPreviews]);
        updateAllDocuments(updatedFiles, tinDocumentFiles, locationProofFiles);
      } else if (fileType === 'tinDocument') {
        const updatedFiles = [...tinDocumentFiles, ...newFiles];
        setTinDocumentFiles(updatedFiles);
        setTinDocumentPreviews([...tinDocumentPreviews, ...newPreviews]);
        updateAllDocuments(businessLicenseFiles, updatedFiles, locationProofFiles);
      } else if (fileType === 'locationProof') {
        const updatedFiles = [...locationProofFiles, ...newFiles];
        setLocationProofFiles(updatedFiles);
        setLocationProofPreviews([...locationProofPreviews, ...newPreviews]);
        updateAllDocuments(businessLicenseFiles, tinDocumentFiles, updatedFiles);
      }
    }
  };

  useEffect(() => {
    return () => {
      businessLicensePreviews.forEach(url => url && URL.revokeObjectURL(url));
      tinDocumentPreviews.forEach(url => url && URL.revokeObjectURL(url));
      locationProofPreviews.forEach(url => url && URL.revokeObjectURL(url));
    };
  }, [businessLicensePreviews, tinDocumentPreviews, locationProofPreviews]);

  const handleDrag = (
    e: React.DragEvent<HTMLDivElement>,
    fileType: 'businessLicense' | 'tinDocument' | 'locationProof'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(prev => ({ ...prev, [fileType]: true }));
    } else if (e.type === 'dragleave') {
      setDragActive(prev => ({ ...prev, [fileType]: false }));
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    fileType: 'businessLicense' | 'tinDocument' | 'locationProof'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [fileType]: false }));

    handleFileUpload(e.dataTransfer.files, fileType);
  };

  const handleBoxClick = (
    fileType: 'businessLicense' | 'tinDocument' | 'locationProof'
  ) => {
    if (fileType === 'businessLicense') {
      businessLicenseRef.current?.click();
    } else if (fileType === 'tinDocument') {
      tinDocumentRef.current?.click();
    } else if (fileType === 'locationProof') {
      locationProofRef.current?.click();
    }
  };

  const removeFile = (
    fileType: 'businessLicense' | 'tinDocument' | 'locationProof',
    index: number
  ) => {
    if (fileType === 'businessLicense') {
      const previewUrl = businessLicensePreviews[index];
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      const updatedFiles = businessLicenseFiles.filter((_, i) => i !== index);
      const updatedPreviews = businessLicensePreviews.filter((_, i) => i !== index);
      setBusinessLicenseFiles(updatedFiles);
      setBusinessLicensePreviews(updatedPreviews);
      updateAllDocuments(updatedFiles, tinDocumentFiles, locationProofFiles);
    } else if (fileType === 'tinDocument') {
      const previewUrl = tinDocumentPreviews[index];
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      const updatedFiles = tinDocumentFiles.filter((_, i) => i !== index);
      const updatedPreviews = tinDocumentPreviews.filter((_, i) => i !== index);
      setTinDocumentFiles(updatedFiles);
      setTinDocumentPreviews(updatedPreviews);
      updateAllDocuments(businessLicenseFiles, updatedFiles, locationProofFiles);
    } else if (fileType === 'locationProof') {
      const previewUrl = locationProofPreviews[index];
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      const updatedFiles = locationProofFiles.filter((_, i) => i !== index);
      const updatedPreviews = locationProofPreviews.filter((_, i) => i !== index);
      setLocationProofFiles(updatedFiles);
      setLocationProofPreviews(updatedPreviews);
      updateAllDocuments(businessLicenseFiles, tinDocumentFiles, updatedFiles);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-shades-black mb-3">
            Boost trust with verification{' '}
            <span className="text-neutrals-06">(optional)</span>
          </h1>
          <div className="flex items-start gap-2 text-neutrals-07">
            <Shield className="w-5 h-5 text-primary-01 flex-shrink-0 mt-0.5" />
            <p>
              Verified vendors get{' '}
              <span className="text-primary-01 font-semibold">2x more leads</span> and a
              'Trusted' badge on their profile. You can do this later, but we recommend
              starting now to rank higher in search results.
            </p>
          </div>
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

      <div className="flex items-start gap-3 p-4 bg-accents-peach/30 dark:bg-accents-peach/10 rounded-lg mb-8 border border-primary-01/20">
        <Image src="/icons/vector.svg" alt="Clock" width={20} height={20} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-shades-black">
            Review Process: 24-48 Hours
          </p>
          <p className="text-xs text-neutrals-07 mt-1">
            Once submitted, our team will review your documents manually to ensure compliance
            with local regulations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="space-y-3">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${dragActive.businessLicense
              ? 'border-primary-01 bg-primary-01/5'
              : 'border-neutrals-04 hover:border-primary-01 hover:bg-neutrals-02/50'
              }`}
            onClick={() => handleBoxClick('businessLicense')}
            onDragEnter={(e) => handleDrag(e, 'businessLicense')}
            onDragLeave={(e) => handleDrag(e, 'businessLicense')}
            onDragOver={(e) => handleDrag(e, 'businessLicense')}
            onDrop={(e) => handleDrop(e, 'businessLicense')}
          >
            <div className="w-16 h-16 rounded-full bg-neutrals-03 dark:bg-neutrals-02 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-neutrals-07" />
            </div>
            <h3 className="text-base font-semibold text-shades-black mb-2">Business License</h3>
            <p className="text-xs text-neutrals-07 mb-4">
              {dragActive.businessLicense
                ? 'Drop files here...'
                : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-neutrals-06">PDF or JPG (max. 10MB each)</p>
            <input
              ref={businessLicenseRef}
              type="file"
              accept=".pdf,.jpg,.jpeg"
              multiple
              onChange={(e) => handleFileUpload(e.target.files, 'businessLicense')}
              className="hidden"
            />
          </div>
          {businessLicenseFiles.length > 0 && (
            <div className="space-y-2">
              {businessLicenseFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-neutrals-02 rounded-lg group">
                  <div className="w-16 h-16 rounded-lg bg-neutrals-03 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {file.type === 'application/pdf' ? (
                      <PDFPreview file={file} className="w-full h-full" />
                    ) : businessLicensePreviews[index] ? (
                      <img
                        src={businessLicensePreviews[index]}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-6 h-6 text-neutrals-07" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-shades-black truncate">{file.name}</p>
                    <p className="text-xs text-neutrals-06 mt-0.5">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile('businessLicense', index)}
                    className="p-1.5 hover:bg-neutrals-04 rounded-lg transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4 text-neutrals-07" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${dragActive.tinDocument
              ? 'border-primary-01 bg-primary-01/5'
              : 'border-neutrals-04 hover:border-primary-01 hover:bg-neutrals-02/50'
              }`}
            onClick={() => handleBoxClick('tinDocument')}
            onDragEnter={(e) => handleDrag(e, 'tinDocument')}
            onDragLeave={(e) => handleDrag(e, 'tinDocument')}
            onDragOver={(e) => handleDrag(e, 'tinDocument')}
            onDrop={(e) => handleDrop(e, 'tinDocument')}
          >
            <div className="w-16 h-16 rounded-full bg-neutrals-03 dark:bg-neutrals-02 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-neutrals-07" />
            </div>
            <h3 className="text-base font-semibold text-shades-black mb-2">TIN Document</h3>
            <p className="text-xs text-neutrals-07 mb-4">
              {dragActive.tinDocument
                ? 'Drop files here...'
                : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-neutrals-06">PDF or JPG (max. 10MB each)</p>
            <input
              ref={tinDocumentRef}
              type="file"
              accept=".pdf,.jpg,.jpeg"
              multiple
              onChange={(e) => handleFileUpload(e.target.files, 'tinDocument')}
              className="hidden"
            />
          </div>
          {tinDocumentFiles.length > 0 && (
            <div className="space-y-2">
              {tinDocumentFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-neutrals-02 rounded-lg group">
                  <div className="w-16 h-16 rounded-lg bg-neutrals-03 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {file.type === 'application/pdf' ? (
                      <PDFPreview file={file} className="w-full h-full" />
                    ) : tinDocumentPreviews[index] ? (
                      <img
                        src={tinDocumentPreviews[index]}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-6 h-6 text-neutrals-07" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-shades-black truncate">{file.name}</p>
                    <p className="text-xs text-neutrals-06 mt-0.5">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile('tinDocument', index)}
                    className="p-1.5 hover:bg-neutrals-04 rounded-lg transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4 text-neutrals-07" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${dragActive.locationProof
              ? 'border-primary-01 bg-primary-01/5'
              : 'border-neutrals-04 hover:border-primary-01 hover:bg-neutrals-02/50'
              }`}
            onClick={() => handleBoxClick('locationProof')}
            onDragEnter={(e) => handleDrag(e, 'locationProof')}
            onDragLeave={(e) => handleDrag(e, 'locationProof')}
            onDragOver={(e) => handleDrag(e, 'locationProof')}
            onDrop={(e) => handleDrop(e, 'locationProof')}
          >
            <div className="w-16 h-16 rounded-full bg-neutrals-03 dark:bg-neutrals-02 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-neutrals-07" />
            </div>
            <h3 className="text-base font-semibold text-shades-black mb-2">Location Proof</h3>
            <p className="text-xs text-neutrals-07 mb-4">
              {dragActive.locationProof
                ? 'Drop files here...'
                : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-neutrals-06">PDF or JPG (max. 10MB each)</p>
            <input
              ref={locationProofRef}
              type="file"
              accept=".pdf,.jpg,.jpeg"
              multiple
              onChange={(e) => handleFileUpload(e.target.files, 'locationProof')}
              className="hidden"
            />
          </div>
          {locationProofFiles.length > 0 && (
            <div className="space-y-2">
              {locationProofFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-neutrals-02 rounded-lg group">
                  <div className="w-16 h-16 rounded-lg bg-neutrals-03 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {file.type === 'application/pdf' ? (
                      <PDFPreview file={file} className="w-full h-full" />
                    ) : locationProofPreviews[index] ? (
                      <img
                        src={locationProofPreviews[index]}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-6 h-6 text-neutrals-07" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-shades-black truncate">{file.name}</p>
                    <p className="text-xs text-neutrals-06 mt-0.5">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile('locationProof', index)}
                    className="p-1.5 hover:bg-neutrals-04 rounded-lg transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4 text-neutrals-07" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-neutrals-04 mb-6" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-neutrals-07">
          <Clock className="w-4 h-4 text-accents-discount" />
          <span>Approval in 24-48 hours</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onNext}
            disabled={isLoading}
            className="px-6 py-3 text-sm font-medium text-neutrals-07 hover:text-shades-black transition-colors disabled:opacity-50"
          >
            Skip & Finish
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-[50px] bg-primary-01 text-white font-medium hover:bg-primary-02 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Submitting...' : 'Submit for Review'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}