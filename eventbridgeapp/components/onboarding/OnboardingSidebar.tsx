'use client';

import { Check } from 'lucide-react';
import type { OnboardingStep } from './types';
import Image from 'next/image';

interface OnboardingSidebarProps {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
}

const steps: { id: OnboardingStep; label: string; number: number }[] = [
  { id: 'profile', label: 'Profile Setup', number: 1 },
  { id: 'services', label: 'Services', number: 2 },
  { id: 'pricing', label: 'Pricing', number: 3 },
  { id: 'verify', label: 'Verify', number: 4 },
];

export default function OnboardingSidebar({ currentStep, completedSteps }: OnboardingSidebarProps) {
  const getStepStatus = (stepId: OnboardingStep) => {
    if (completedSteps.includes(stepId)) return 'complete';
    if (currentStep === stepId) return 'in-progress';
    return 'pending';
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-neutrals-02 dark:bg-neutrals-01 p-6 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-12">
        <div className="w-8 h-8 relative">
          <Image src="/logo.svg" alt="Event Bridge" fill />
        </div>
        <div>
          <span className="text-lg font-semibold text-shades-black">Event Bridge</span>
          <p className="text-xs text-neutrals-07">Vendor Portal</p>
        </div>
      </div>

      {/* Steps */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {steps.map((step) => {
            const status = getStepStatus(step.id);

            return (
              <li key={step.id}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-[50px] transition-all ${status === 'in-progress'
                    ? 'bg-neutrals-03 dark:bg-neutrals-02'
                    : ''
                    }`}
                >
                  {/* Step indicator */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${status === 'complete'
                      ? 'bg-primary-01 text-white'
                      : status === 'in-progress'
                        ? 'bg-primary-01 text-white'
                        : 'bg-neutrals-04 dark:bg-neutrals-03 text-neutrals-07'
                      }`}
                  >
                    {status === 'complete' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.number
                    )}
                  </div>

                  {/* Step label */}
                  <div>
                    <p
                      className={`text-sm font-medium ${status === 'in-progress'
                        ? 'text-shades-black'
                        : status === 'complete'
                          ? 'text-shades-black'
                          : 'text-neutrals-07'
                        }`}
                    >
                      {step.label}
                    </p>
                    {status === 'in-progress' && (
                      <p className="text-xs text-primary-01">In Progress</p>
                    )}
                    {status === 'complete' && (
                      <p className="text-xs text-accents-discount">Complete</p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Help */}
      <div className="mt-auto pt-6 border-t border-neutrals-04">
        <button className="flex items-center gap-3 text-neutrals-07 hover:text-shades-black transition-colors">
          <div className="w-10 h-10 rounded-full bg-neutrals-03 dark:bg-neutrals-02 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-shades-black">Need Help?</p>
            <p className="text-xs text-neutrals-07">Contact support</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
