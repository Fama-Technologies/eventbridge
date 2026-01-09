'use client';

import { useState } from 'react';
import { Menu, Sheet, X } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/providers/theme-provider';
import HowItWorksModal from './HowItWorksModal';
import FeaturesModal from './FeaturesModal';

interface BurgerMenuProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export default function BurgerMenu({ className, variant }: BurgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const { resolvedTheme } = useTheme();

  // Determine styling based on variant or auto-detect from theme
  const isDarkHeader = variant === 'dark' || (variant === undefined && resolvedTheme === 'dark');
  const isDarkDropdown = resolvedTheme === 'dark';

  const handleMenuItemClick = (action: string) => {
    setIsOpen(false);
    if (action === 'how-it-works') {
      setShowHowItWorks(true);
    } else if (action === 'features') {
      setShowFeatures(true);
    }
  };

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
          isDarkHeader
            ? 'border-white/20 text-white/70 hover:text-white hover:border-white/40'
            : 'border-neutrals-04 text-shades-black hover:text-primary-01 hover:border-primary-01'
        } ${className}`}
        aria-label="Menu"
      >
        {isOpen ? <X size={20} /> : <Sheet size={20} />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className={`absolute top-full right-0 mt-2 w-72 rounded-2xl shadow-2xl z-50 overflow-hidden border ${
            isDarkDropdown 
              ? 'bg-[#1a1a1a] border-neutrals-04' 
              : 'bg-white border-neutrals-03'
          }`}>
            <nav className="py-2">
              {/* Help and FAQs */}
              <Link
                href="/help"
                onClick={() => setIsOpen(false)}
                className={`block px-6 py-4 transition-colors font-medium ${
                  isDarkDropdown 
                    ? 'text-white hover:bg-neutrals-03' 
                    : 'text-shades-black hover:bg-neutrals-01'
                }`}
              >
                Help and FAQs
              </Link>
              
              <div className={isDarkDropdown ? 'border-t border-neutrals-04' : 'border-t border-neutrals-03'} />
              
              {/* Plan an Event */}
              <div className={`px-6 py-4 transition-colors cursor-pointer ${
                isDarkDropdown ? 'hover:bg-neutrals-03' : 'hover:bg-neutrals-01'
              }`}>
                <Link href="/plan-event" onClick={() => setIsOpen(false)}>
                  <h4 className={`font-semibold mb-1 ${
                    isDarkDropdown ? 'text-white' : 'text-shades-black'
                  }`}>Plan an Event</h4>
                  <p className="text-neutrals-06 text-sm leading-relaxed">
                    Access top Tier Event Management tools the will help you create a great event easily
                  </p>
                </Link>
              </div>
              
              <div className={isDarkDropdown ? 'border-t border-neutrals-04' : 'border-t border-neutrals-03'} />
              
              {/* How Event Bridge works */}
              <button
                onClick={() => handleMenuItemClick('how-it-works')}
                className={`w-full text-left px-6 py-4 transition-colors font-medium ${
                  isDarkDropdown 
                    ? 'text-white hover:bg-neutrals-03' 
                    : 'text-shades-black hover:bg-neutrals-01'
                }`}
              >
                How Event Bridge works
              </button>
              
              <div className={isDarkDropdown ? 'border-t border-neutrals-04' : 'border-t border-neutrals-03'} />
              
              {/* Tools and Features */}
              <button
                onClick={() => handleMenuItemClick('features')}
                className={`w-full text-left px-6 py-4 transition-colors font-medium ${
                  isDarkDropdown 
                    ? 'text-white hover:bg-neutrals-03' 
                    : 'text-shades-black hover:bg-neutrals-01'
                }`}
              >
                Tools and Features
              </button>
              
              <div className={isDarkDropdown ? 'border-t border-neutrals-04' : 'border-t border-neutrals-03'} />
              
              {/* Log in or Sign up */}
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className={`block px-6 py-4 text-primary-01 transition-colors font-medium ${
                  isDarkDropdown ? 'hover:bg-neutrals-03' : 'hover:bg-neutrals-01'
                }`}
              >
                Log in or Sign up
              </Link>
            </nav>
          </div>
        </>
      )}

      {/* Modals */}
      <HowItWorksModal 
        isOpen={showHowItWorks} 
        onClose={() => setShowHowItWorks(false)} 
      />
      <FeaturesModal 
        isOpen={showFeatures} 
        onClose={() => setShowFeatures(false)} 
      />
    </>
  );
}
