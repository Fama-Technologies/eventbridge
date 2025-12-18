'use client';

import { Check } from 'lucide-react';
import type { OnboardingStep } from './types';

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
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="16" cy="16" r="6" fill="#FF7043" />
            <g stroke="#FF7043" strokeWidth="2" strokeLinecap="round">
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="16" y1="26" x2="16" y2="30" />
              <line x1="2" y1="16" x2="6" y2="16" />
              <line x1="26" y1="16" x2="30" y2="16" />
              <line x1="5.86" y1="5.86" x2="8.69" y2="8.69" />
              <line x1="23.31" y1="23.31" x2="26.14" y2="26.14" />
              <line x1="5.86" y1="26.14" x2="8.69" y2="23.31" />
              <line x1="23.31" y1="8.69" x2="26.14" y2="5.86" />
            </g>
          </svg>
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${status === 'in-progress'
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
