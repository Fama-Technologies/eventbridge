'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Onboarding } from '@/components/onboarding';

export default function VendorOnboardingPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<{ userId?: number; email?: string; accountType?: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/users/me');
        
        if (!response.ok) {
          router.push('/signup?type=vendor');
          return;
        }

        const user = await response.json();

        setUserData({ 
          userId: user.id, 
          email: user.email, 
          accountType: user.accountType 
        });

        if (user.accountType !== 'VENDOR') {
          if (user.accountType === 'CUSTOMER') {
            router.push('/');
          } else {
            router.push('/');
          }
          return;
        }

        try {
          const profileResponse = await fetch('/api/vendor/profile');
          if (profileResponse.ok) {
            const profile = await profileResponse.json();
            if (profile && profile.businessName) {
              router.push('/vendor');
              return;
            }
          }
        } catch (profileError) {
          console.error('Profile check error:', profileError);
        }

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

  const handleOnboardingComplete = () => {
    router.push('/vendor');
  };

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
    return null;
  }

  return (
    <Onboarding 
      userId={userData?.userId} 
      userEmail={userData?.email} 
      onComplete={handleOnboardingComplete}
    />
  );
}