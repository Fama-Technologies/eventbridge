'use client';

import { X, ShieldCheck, Building2, MessageSquareText, Star, Heart, Wallet, Users, Clock, CheckSquare, Lock } from 'lucide-react';
import { useTheme } from '@/providers/theme-provider';

interface FeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FREE_FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Verified Vendors',
    description: 'Trusted, vetted providers only to ensure quality service.',
  },
  {
    icon: Building2,
    title: 'Rich Profiles',
    description: 'Detailed photos, videos, reviews, and package options.',
  },
  {
    icon: MessageSquareText,
    title: 'Direct Chat & Quotes',
    description: 'Instant messaging and request custom quotes directly.',
  },
  {
    icon: Star,
    title: 'Ratings & Reviews',
    description: 'Read real feedback from verified past users.',
  },
  {
    icon: Heart,
    title: 'Mood Board',
    description: 'Save your favorites to organize your vision easily.',
  },
];

const PREMIUM_FEATURES = [
  {
    icon: Wallet,
    title: 'Budget Tracker',
    description: 'AI recommendations & payment tracking.',
  },
  {
    icon: Users,
    title: 'Joint Collaboration Board',
    description: 'Manage shared tasks, status updates, schedules, and deadlines collaboratively with clients.',
  },
  {
    icon: Clock,
    title: 'Auto Reminders',
    description: 'Never miss a payment or appointment.',
  },
  {
    icon: CheckSquare,
    title: 'Checklist & Cal',
    description: 'Comprehensive task management.',
  },
];

export default function FeaturesModal({ isOpen, onClose }: FeaturesModalProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-5xl rounded-3xl p-6 md:p-10 shadow-2xl max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-[#1a1a1a]' : 'bg-white'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-6 right-6 transition-colors ${
            isDark ? 'text-neutrals-06 hover:text-white' : 'text-neutrals-07 hover:text-shades-black'
          }`}
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${
            isDark ? 'text-white' : 'text-shades-black'
          }`}>
            Powerful Features & Tools
          </h2>
          <p className="text-neutrals-06">
            Connect for free. Unlock advanced tools to plan and manage like a pro.
          </p>
        </div>

        {/* Free Plan Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-shades-black'}`}>Included in Free Plan</h3>
            <span className="px-3 py-1 bg-accents-discount/20 text-accents-discount text-xs font-bold rounded-full uppercase">
              Free Forever
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {FREE_FEATURES.map((feature, index) => (
              <div 
                key={index} 
                className={`rounded-xl p-4 border ${
                  isDark 
                    ? 'bg-neutrals-02 border-neutrals-04' 
                    : 'bg-neutrals-01 border-neutrals-03'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-primary-01/20 flex items-center justify-center mb-3">
                  <feature.icon size={20} className="text-primary-01" />
                </div>
                <h4 className={`font-semibold text-sm mb-1 ${
                  isDark ? 'text-white' : 'text-shades-black'
                }`}>
                  {feature.title}
                </h4>
                <p className="text-neutrals-06 text-xs leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-shades-black'}`}>Premium Features for Organisers</h3>
            <span className="px-3 py-1 bg-primary-01/20 text-primary-01 text-xs font-bold rounded-full uppercase flex items-center gap-1">
              <Lock size={10} />
              Premium
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PREMIUM_FEATURES.map((feature, index) => (
              <div 
                key={index} 
                className={`rounded-xl p-4 border relative ${
                  isDark 
                    ? 'bg-neutrals-02 border-neutrals-04' 
                    : 'bg-neutrals-01 border-neutrals-03'
                }`}
              >
                {/* Lock indicator */}
                <div className="absolute top-4 right-4">
                  <Lock size={14} className="text-neutrals-06" />
                </div>
                
                <div className="w-10 h-10 rounded-lg bg-primary-01/20 flex items-center justify-center mb-3">
                  <feature.icon size={20} className="text-primary-01" />
                </div>
                <h4 className={`font-semibold text-sm mb-1 ${
                  isDark ? 'text-white' : 'text-shades-black'
                }`}>
                  {feature.title}
                </h4>
                <p className="text-neutrals-06 text-xs leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`flex items-center justify-between pt-4 border-t ${
          isDark ? 'border-neutrals-04' : 'border-neutrals-03'
        }`}>
          <button
            onClick={onClose}
            className={`transition-colors text-sm ${
              isDark ? 'text-neutrals-06 hover:text-white' : 'text-neutrals-07 hover:text-shades-black'
            }`}
          >
            Maybe later
          </button>
          
          <div className="flex items-center gap-3">
            <button
              className={`font-medium px-6 py-3 rounded-xl transition-colors text-sm ${
                isDark 
                  ? 'bg-neutrals-03 hover:bg-neutrals-04 text-white' 
                  : 'bg-neutrals-02 hover:bg-neutrals-03 text-shades-black'
              }`}
            >
              Unlock Premium
            </button>
            <button
              className="bg-primary-01 hover:bg-primary-02 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
