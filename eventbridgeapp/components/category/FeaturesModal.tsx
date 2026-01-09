"use client";

import { X, ShieldCheck, Building2, MessageSquareText, Star, Heart, Wallet, Users, Clock, CheckSquare, Lock, Receipt, CalendarDays, FileText, ImageIcon, BarChart3, CalendarClock } from 'lucide-react';
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

const PREMIUM_ORGANISER_FEATURES = [
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
  {
    icon: Receipt,
    title: 'E-Receipts',
    description: 'Digital receipt management from vendors.',
  },
];

const PREMIUM_VENDOR_FEATURES = [
  {
    icon: CalendarDays,
    title: 'Bookings Dashboard',
    description: 'Manage appointments and track your busy days directly in one place.',
  },
  {
    icon: FileText,
    title: 'Quote & Receipt Sender',
    description: 'Build and send professional quotations and e-receipts',
  },
  {
    icon: ImageIcon,
    title: 'Enhanced Portfolio',
    description: 'Upgrade to showcase more service packages as well as more media uploads.',
  },
  {
    icon: BarChart3,
    title: 'Leads Inbox & Analytics',
    description: 'View new opportunities, track profile views, get urgent lead alerts instantly.',
  },
  {
    icon: CalendarClock,
    title: 'Availability Management',
    description: 'Block dates, sync external calendars, and update your booking availability easily.',
  },
  {
    icon: Users,
    title: 'Joint Collaboration Board',
    description: 'Manage shared tasks, status updates, schedules, and deadlines collaboratively with clients.',
  },
];

export default function FeaturesModal({ isOpen, onClose }: FeaturesModalProps) {
  // Theme context is optional if not available in all contexts, providing fallback
  let isDark = false;
  try {
    const { resolvedTheme } = useTheme();
    isDark = resolvedTheme === 'dark';
  } catch (e) {
    // Fallback if useTheme is not available
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-6xl rounded-3xl p-6 md:p-10 shadow-2xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'
        }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-6 right-6 transition-colors ${isDark ? 'text-neutrals-06 hover:text-white' : 'text-neutrals-07 hover:text-shades-black'
            }`}
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-shades-black'
            }`}>
            Powerful Features & Tools
          </h2>
          <p className="text-neutrals-06 max-w-2xl mx-auto">
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
                className={`rounded-xl p-6 border ${isDark
                    ? 'bg-neutrals-02 border-neutrals-04'
                    : 'bg-neutrals-01/30 border-neutrals-02'
                  }`}
              >
                <div className="w-10 h-10 rounded-full bg-accents-peach/10 flex items-center justify-center mb-4">
                  <feature.icon size={20} className="text-primary-01" />
                </div>
                <h4 className={`font-bold text-sm mb-2 ${isDark ? 'text-white' : 'text-shades-black'
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

        {/* Premium Organisers Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-shades-black'}`}>Premium Features for Organisers</h3>
            <span className="px-3 py-1 bg-primary-01/10 text-primary-01 text-xs font-bold rounded-full uppercase flex items-center gap-1">
              <Lock size={10} />
              Premium
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PREMIUM_ORGANISER_FEATURES.map((feature, index) => (
              <div
                key={index}
                className={`rounded-xl p-6 border relative ${isDark
                    ? 'bg-neutrals-02 border-neutrals-04'
                    : 'bg-shades-white border-neutrals-02'
                  }`}
              >
                {/* Lock indicator */}
                <div className="absolute top-4 right-4">
                  <Lock size={14} className="text-neutrals-04" />
                </div>

                <div className="w-10 h-10 rounded-full bg-primary-01/10 flex items-center justify-center mb-4">
                  <feature.icon size={20} className="text-primary-01" />
                </div>
                <h4 className={`font-bold text-sm mb-2 ${isDark ? 'text-white' : 'text-shades-black'
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

        {/* Premium Vendors Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-shades-black'}`}>Premium Features for Vendors</h3>
            <span className="px-3 py-1 bg-primary-01/10 text-primary-01 text-xs font-bold rounded-full uppercase flex items-center gap-1">
              <Lock size={10} />
              Premium
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {PREMIUM_VENDOR_FEATURES.map((feature, index) => (
              <div
                key={index}
                className={`rounded-xl p-6 border relative ${isDark
                    ? 'bg-neutrals-02 border-neutrals-04'
                    : 'bg-shades-white border-neutrals-02'
                  }`}
              >
                {/* Lock indicator */}
                <div className="absolute top-4 right-4">
                  <Lock size={14} className="text-neutrals-04" />
                </div>

                <div className="w-10 h-10 rounded-full bg-primary-01/10 flex items-center justify-center mb-4">
                  <feature.icon size={20} className="text-primary-01" />
                </div>
                <h4 className={`font-bold text-sm mb-2 ${isDark ? 'text-white' : 'text-shades-black'
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
        <div className={`flex items-center justify-between pt-6 border-t ${isDark ? 'border-neutrals-04' : 'border-neutrals-02'
          }`}>
          <button
            onClick={onClose}
            className={`transition-colors text-sm font-medium ${isDark ? 'text-neutrals-06 hover:text-white' : 'text-neutrals-06 hover:text-shades-black'
              }`}
          >
            Maybe later
          </button>

          <div className="flex items-center gap-4">
            <button
              className={`font-semibold px-6 py-3 rounded-xl transition-colors text-sm border ${isDark
                  ? 'bg-transparent border-neutrals-04 text-white hover:bg-neutrals-03'
                  : 'bg-white border-neutrals-03 text-shades-black hover:bg-neutrals-01 shadow-sm'
                }`}
            >
              Unlock Premium
            </button>
            <button
              className="bg-primary-01 hover:bg-primary-02 text-white font-bold px-8 py-3 rounded-xl transition-colors text-sm shadow-lg shadow-primary-01/20"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
