'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Onboarding } from '@/components/onboarding';

export default function VendorOnboardingPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<{ userId?: number; email?: string } | null>(null);

  useEffect(() => {
    // Check if user is authenticated and is a vendor
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/users/me');
        
        if (!response.ok) {
          // Not authenticated, redirect to signup
          router.push('/signup?type=vendor');
          return;
        }

        const user = await response.json();

        if (user.accountType !== 'VENDOR') {
          // Not a vendor, redirect to home
          router.push('/');
          return;
        }

        // Check if already completed onboarding
        const profileResponse = await fetch('/api/vendor/profile');
        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          if (profile && profile.businessName) {
            // Already onboarded, redirect to dashboard
            router.push('/vendor/dashboard');
            return;
          }
        }

        setUserData({ userId: user.id, email: user.email });
        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/signup?type=vendor');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutrals-01 dark:bg-shades-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-01 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutrals-07">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect
  }

  return <Onboarding userId={userData?.userId} userEmail={userData?.email} />;
}
