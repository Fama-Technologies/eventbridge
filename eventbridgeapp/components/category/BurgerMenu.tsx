'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import HowItWorksModal from './HowItWorksModal';
import FeaturesModal from './FeaturesModal';

interface BurgerMenuProps {
  className?: string;
}

export default function BurgerMenu({ className }: BurgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

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
        className={`w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white/40 transition-all ${className}`}
        aria-label="Menu"
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
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
          <div className="absolute top-full right-0 mt-2 w-72 bg-[#1a1a1a] rounded-2xl shadow-2xl z-50 overflow-hidden border border-neutrals-04">
            <nav className="py-2">
              {/* Help and FAQs */}
              <Link
                href="/help"
                onClick={() => setIsOpen(false)}
                className="block px-6 py-4 text-white hover:bg-neutrals-03 transition-colors font-medium"
              >
                Help and FAQs
              </Link>
              
              <div className="border-t border-neutrals-04" />
              
              {/* Plan an Event */}
              <div className="px-6 py-4 hover:bg-neutrals-03 transition-colors cursor-pointer">
                <Link href="/plan-event" onClick={() => setIsOpen(false)}>
                  <h4 className="text-white font-semibold mb-1">Plan an Event</h4>
                  <p className="text-neutrals-06 text-sm leading-relaxed">
                    Access top Tier Event Management tools the will help you create a great event easily
                  </p>
                </Link>
              </div>
              
              <div className="border-t border-neutrals-04" />
              
              {/* How Event Bridge works */}
              <button
                onClick={() => handleMenuItemClick('how-it-works')}
                className="w-full text-left px-6 py-4 text-white hover:bg-neutrals-03 transition-colors font-medium"
              >
                How Event Bridge works
              </button>
              
              <div className="border-t border-neutrals-04" />
              
              {/* Tools and Features */}
              <button
                onClick={() => handleMenuItemClick('features')}
                className="w-full text-left px-6 py-4 text-white hover:bg-neutrals-03 transition-colors font-medium"
              >
                Tools and Features
              </button>
              
              <div className="border-t border-neutrals-04" />
              
              {/* Log in or Sign up */}
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block px-6 py-4 text-primary-01 hover:bg-neutrals-03 transition-colors font-medium"
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
