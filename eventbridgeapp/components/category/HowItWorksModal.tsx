'use client';

import { X, Calendar, Search, MessageSquare, ShieldCheck } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    number: 1,
    icon: Calendar,
    title: 'Create your event',
    description: 'Add details like date, location, and guest count to get personalized recommendations.',
  },
  {
    number: 2,
    icon: Search,
    title: 'Browse & compare',
    description: 'Discover verified vendors in categories like venues, caterers, DJs, and more.',
  },
  {
    number: 3,
    icon: MessageSquare,
    title: 'Chat & book directly',
    description: 'Request quotes, message vendors, and negotiate seamlessly within the platform.',
  },
  {
    number: 4,
    icon: ShieldCheck,
    title: 'Pay safely & track',
    description: 'Secure payments, manage bookings, and use tools like budget tracker.',
  },
];

export default function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-[#1a1a1a] rounded-3xl p-8 md:p-12 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-neutrals-06 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            How EventBridge Works
          </h2>
          <p className="text-neutrals-06 text-lg">
            Plan your perfect event in just a few steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {STEPS.map((step) => (
            <div key={step.number} className="text-left">
              {/* Step Number & Icon */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary-01 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {step.number}
                </div>
                <div className="w-10 h-10 rounded-lg bg-neutrals-03 flex items-center justify-center">
                  <step.icon size={20} className="text-neutrals-06" />
                </div>
              </div>
              
              {/* Content */}
              <h3 className="text-white font-semibold text-lg mb-2">
                {step.title}
              </h3>
              <p className="text-neutrals-06 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 bg-primary-01 hover:bg-primary-02 text-white font-semibold px-8 py-4 rounded-xl transition-colors"
          >
            Get Started
            <span className="text-xl">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
