'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Check, 
  CalendarDays, 
  DollarSign, 
  Star, 
  Users,
  Plus,
  Settings,
  Bell,
  LogOut
} from 'lucide-react';

interface VendorProfile {
  businessName: string;
  description: string;
  profileImage: string | null;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
}

export default function VendorDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboardingComplete = searchParams.get('onboarding') === 'complete';
  
  const [showSuccessModal, setShowSuccessModal] = useState(isOnboardingComplete);
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/vendor/profile');
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutrals-01 dark:bg-shades-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-01 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutrals-01 dark:bg-shades-black">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-shades-white dark:bg-neutrals-02 rounded-2xl p-8 max-w-md mx-4 text-center animate-scale-in">
            <div className="w-16 h-16 bg-accents-discount/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-accents-discount" />
            </div>
            <h2 className="text-2xl font-bold text-shades-black mb-2">
              Profile Setup Complete!
            </h2>
            <p className="text-neutrals-07 mb-6">
              Your vendor profile has been created successfully. Our team will review your
              information and get back to you within 24-48 hours.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full px-6 py-3 bg-primary-01 text-white rounded-lg font-medium hover:bg-primary-02 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-shades-white dark:bg-neutrals-02 border-b border-neutrals-04">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 relative">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <circle cx="16" cy="16" r="6" fill="#FF7043" />
                  <g stroke="#FF7043" strokeWidth="2" strokeLinecap="round">
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="16" y1="26" x2="16" y2="30" />
                    <line x1="2" y1="16" x2="6" y2="16" />
                    <line x1="26" y1="16" x2="30" y2="16" />
                  </g>
                </svg>
              </div>
              <span className="text-lg font-semibold text-shades-black">Event Bridge</span>
              <span className="text-xs bg-neutrals-03 dark:bg-neutrals-04 px-2 py-1 rounded text-neutrals-07">
                Vendor Portal
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-neutrals-07 hover:text-shades-black transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-neutrals-07 hover:text-shades-black transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-neutrals-07 hover:text-errors-main transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-shades-black mb-2">
            Welcome, {profile?.businessName || 'Vendor'}! 👋
          </h1>
          <p className="text-neutrals-07">
            Here's an overview of your business performance
          </p>
        </div>

        {/* Verification Status */}
        {!profile?.isVerified && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 dark:text-yellow-400">⏳</span>
              </div>
              <div>
                <h3 className="font-medium text-shades-black">Verification Pending</h3>
                <p className="text-sm text-neutrals-07">
                  Your profile is under review. You'll receive an email once verified.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-shades-white dark:bg-neutrals-02 rounded-xl p-6 border border-neutrals-04">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs text-accents-discount">+12%</span>
            </div>
            <p className="text-2xl font-bold text-shades-black">0</p>
            <p className="text-sm text-neutrals-07">Total Bookings</p>
          </div>

          <div className="bg-shades-white dark:bg-neutrals-02 rounded-xl p-6 border border-neutrals-04">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs text-accents-discount">+8%</span>
            </div>
            <p className="text-2xl font-bold text-shades-black">UGX 0</p>
            <p className="text-sm text-neutrals-07">Total Revenue</p>
          </div>

          <div className="bg-shades-white dark:bg-neutrals-02 rounded-xl p-6 border border-neutrals-04">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-shades-black">{profile?.rating || 0}.0</p>
            <p className="text-sm text-neutrals-07">Average Rating</p>
          </div>

          <div className="bg-shades-white dark:bg-neutrals-02 rounded-xl p-6 border border-neutrals-04">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-shades-black">{profile?.reviewCount || 0}</p>
            <p className="text-sm text-neutrals-07">Total Reviews</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-shades-white dark:bg-neutrals-02 rounded-xl p-6 border border-neutrals-04">
            <h2 className="text-lg font-semibold text-shades-black mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/vendor/services"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutrals-02 dark:hover:bg-neutrals-03 transition-colors"
              >
                <div className="w-10 h-10 bg-primary-01/10 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary-01" />
                </div>
                <div>
                  <p className="font-medium text-shades-black">Add New Service</p>
                  <p className="text-sm text-neutrals-07">Expand your offerings</p>
                </div>
              </Link>
              <Link
                href="/vendor/portfolio"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutrals-02 dark:hover:bg-neutrals-03 transition-colors"
              >
                <div className="w-10 h-10 bg-accents-peach/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-01" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-shades-black">Update Portfolio</p>
                  <p className="text-sm text-neutrals-07">Add photos of your work</p>
                </div>
              </Link>
              <Link
                href="/vendor/profile/edit"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutrals-02 dark:hover:bg-neutrals-03 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-shades-black">Edit Profile</p>
                  <p className="text-sm text-neutrals-07">Update your information</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-shades-white dark:bg-neutrals-02 rounded-xl p-6 border border-neutrals-04">
            <h2 className="text-lg font-semibold text-shades-black mb-4">Recent Activity</h2>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-neutrals-03 dark:bg-neutrals-04 rounded-full flex items-center justify-center mb-4">
                <CalendarDays className="w-8 h-8 text-neutrals-06" />
              </div>
              <p className="text-neutrals-07 mb-2">No recent activity</p>
              <p className="text-sm text-neutrals-06">
                Your recent bookings and messages will appear here
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
