'use client';

import { useEffect, useState } from 'react';
import { Inbox, ArrowUp } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title = 'Successfully',
  subtitle = 'Your Email has been sent',
  buttonText = 'Continue',
  onButtonClick,
}: SuccessModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Trigger animation after mount
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    }
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isAnimating ? 'bg-shades-black-30 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={onClose}
    >
      <div
        className={`
          bg-shades-white rounded-2xl shadow-2xl p-8 max-w-sm w-full
          transition-all duration-300 ease-out
          ${isAnimating 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
          }
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon Container */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Background circle */}
            <div 
              className={`
                w-40 h-40 rounded-full bg-neutrals-02 flex items-center justify-center
                transition-all duration-500 delay-100
                ${isAnimating ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
              `}
            >
              {/* Inbox icon container */}
              <div className="relative">
                {/* Arrow animation */}
                <div 
                  className={`
                    absolute -top-6 left-1/2 -translate-x-1/2
                    transition-all duration-700 delay-300
                    ${isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}
                  `}
                >
                  <ArrowUp className="w-8 h-8 text-accents-peach" strokeWidth={2.5} />
                </div>
                
                {/* Top part of inbox */}
                <div 
                  className={`
                    w-20 h-6 bg-accents-peach rounded-t-lg mb-1
                    transition-all duration-500 delay-200
                    ${isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
                  `}
                />
                
                {/* Bottom part of inbox */}
                <div 
                  className={`
                    w-24 h-14 bg-primary-01 rounded-xl flex items-center justify-center
                    transition-all duration-500 delay-300
                    ${isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
                  `}
                >
                  <div className="w-8 h-1 bg-shades-white rounded-full opacity-80" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div 
          className={`
            text-center mb-8
            transition-all duration-500 delay-400
            ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          `}
        >
          <p className="text-neutrals-07 text-lg mb-2">{subtitle}</p>
          <h2 className="text-primary-01 text-4xl font-bold">{title}</h2>
        </div>

        {/* Button */}
        <button
          onClick={handleButtonClick}
          className={`
            w-full py-4 rounded-xl bg-primary-01 text-shades-white font-semibold text-lg
            hover:bg-primary-02 active:scale-[0.98]
            transition-all duration-300 delay-500
            ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          `}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
