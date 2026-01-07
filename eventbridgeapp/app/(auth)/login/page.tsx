'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Login failed');
        setIsLoading(false);
        return;
      }

      toast.success('Login successful');

      /* ===============================
         SINGLE SOURCE OF TRUTH: API
         =============================== */
      if (data.redirectTo) {
        window.location.href = data.redirectTo;
        return;
      }

      /* ===============================
         NEVER ALLOW redirect override
         FOR VENDORS
         =============================== */
      if (
        redirectUrl &&
        data.user?.accountType &&
        data.user.accountType.toUpperCase() !== 'VENDOR'
      ) {
        window.location.href = redirectUrl;
        return;
      }

      /* ===============================
         FINAL ROLE-BASED FALLBACK
         =============================== */
      if (data.user?.accountType) {
        switch (data.user.accountType.toUpperCase()) {
          case 'VENDOR':
            window.location.href = '/vendor';
            return;
          case 'ADMIN':
            window.location.href = '/admin/dashboard';
            return;
          case 'PLANNER':
            window.location.href = '/planner/dashboard';
            return;
          default:
            window.location.href = '/dashboard';
            return;
        }
      }

      window.location.href = '/dashboard';
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);

      await signIn('google', {
        callbackUrl: redirectUrl ?? '/',
      });
    } catch {
      toast.error('Google sign-in failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);
    toast.info('Apple Sign-In coming soon');
    setIsAppleLoading(false);
  };

  const anyLoading = isLoading || isGoogleLoading || isAppleLoading;

  return (
    <div className="flex min-h-screen flex-col-reverse lg:flex-row">
      <div className="flex w-full flex-col justify-center bg-neutrals-01 p-8 lg:w-1/2 lg:p-16">
        <div className="mx-auto w-full max-w-md">
          <h1 className="mb-2 text-4xl font-bold text-shades-black">
            Hello
            <br />
            <span className="text-primary-01">Welcome</span> Back
          </h1>

          <p className="mb-8 text-sm text-neutrals-07">
            Want to plan for another event?
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={anyLoading}
              className="w-full rounded-lg border px-4 py-3"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={anyLoading}
                className="w-full rounded-lg border px-4 py-3"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                disabled={anyLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>

              <Link href="/forgot-password">Forgot password</Link>
            </div>

            <button
              type="submit"
              disabled={anyLoading}
              className="w-full rounded-lg bg-primary-01 py-3 text-white"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Sign in'}
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={anyLoading}
                className="border rounded-lg py-3"
              >
                Sign in with Google
              </button>

              <button
                type="button"
                onClick={handleAppleSignIn}
                disabled={anyLoading}
                className="border rounded-lg py-3"
              >
                Sign in with Apple
              </button>
            </div>

            <p className="text-center text-sm">
              Don&apos;t have an account? <Link href="/signup">Sign up</Link>
            </p>
          </form>
        </div>
      </div>

      <div className="relative hidden lg:block lg:w-1/2">
        <Image src="/login.jpg" alt="Login" fill style={{ objectFit: 'cover' }} />
      </div>
    </div>
  );
}
