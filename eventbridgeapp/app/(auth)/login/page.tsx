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
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error('Non-JSON response:', text);
        toast.error("Server error. Please try again.");
        setIsLoading(false);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        console.error('Login failed:', data);
        toast.error(data.message || "Login failed");
        setIsLoading(false);
        return;
      }

      toast.success("Login successful!");

      // Use the redirectTo from API response if available
      if (data.redirectTo) {
        window.location.href = data.redirectTo;
      } else if (redirectUrl) {
        window.location.href = redirectUrl;
      } else if (data.user?.accountType) {
        // Fallback to account type based redirect
        const accountType = data.user.accountType.toLowerCase();
        if (accountType === 'vendor') {
          window.location.href = "/vendor"; // Changed to /vendor
        } else if (accountType === 'admin') {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        // Default fallback
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error("Cannot connect to server. Please check your connection.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await signIn('google', { 
        callbackUrl: redirectUrl || '/dashboard', 
      });
      setIsGoogleLoading(false);
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google");
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);
    toast.info("Apple Sign-In coming soon!");
    setIsAppleLoading(false);
  };

  const anyLoading = isLoading || isGoogleLoading || isAppleLoading;

  return (
    <div className="flex min-h-screen flex-col-reverse lg:flex-row">
      {/* Left Column (Login Form) */}
      <div className="flex w-full flex-col justify-center bg-neutrals-01 p-8 lg:w-1/2 lg:p-16">
        <div className="mx-auto w-full max-w-md">
          <h1 className="mb-2 text-4xl font-bold text-shades-black">
            Hello
            <br />
            <span className="text-primary-01">Welcome</span> Back
          </h1>
          <p className="mb-8 text-sm text-neutrals-07">Want to plan for another event?</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutrals-04 bg-transparent px-4 py-3 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={anyLoading}
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-neutrals-04 bg-transparent px-4 py-3 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={anyLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutrals-06 hover:text-shades-black disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={anyLoading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-shades-black cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-neutrals-04 bg-transparent text-primary-01 focus:ring-primary-01 disabled:opacity-50"
                  disabled={anyLoading}
                />
                Remember me
              </label>
              <Link 
                href="/forgot-password" 
                className={`text-sm text-primary-01 hover:text-primary-02 transition-colors ${anyLoading ? 'pointer-events-none opacity-50' : ''}`}
              >
                Forgot Password
              </Link>
            </div>

            <button
              type="submit"
              disabled={anyLoading}
              className="w-full rounded-lg bg-primary-01 py-3 font-semibold text-shades-white hover:bg-primary-02 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 className="animate-spin" size={20} />}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-neutrals-04" />
              <span className="text-sm text-neutrals-07">Login with</span>
              <div className="h-px flex-1 bg-neutrals-04" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={anyLoading}
                className="flex items-center justify-center gap-2 rounded-lg border border-neutrals-04 bg-transparent px-4 py-3 text-shades-black hover:bg-neutrals-03 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Image 
                    src="/google.svg" 
                    alt="Google" 
                    width={20} 
                    height={20} 
                    className="w-5 h-5"
                  />
                )}
                {isGoogleLoading ? 'Signing in...' : 'Sign in with Google'}
              </button>

              <button
                type="button"
                onClick={handleAppleSignIn}
                disabled={anyLoading}
                className="flex items-center justify-center gap-2 rounded-lg border border-neutrals-04 bg-transparent px-4 py-3 text-shades-black hover:bg-neutrals-03 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAppleLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Image 
                    src="/apple.svg" 
                    alt="Apple" 
                    width={20} 
                    height={20} 
                    className="w-5 h-5"
                  />
                )}
                {isAppleLoading ? 'Signing in...' : 'Sign in with Apple'}
              </button>
            </div>

            <p className="mt-4 text-center text-sm text-neutrals-07">
              Don't have an account?{' '}
              <Link 
                href="/sign-up" 
                className={`text-primary-01 hover:text-primary-02 transition-colors ${anyLoading ? 'pointer-events-none opacity-50' : ''}`}
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
      
      {/* Right Column (Image Display) - Assumed structure based on visual input */}
      <div className="relative hidden lg:block lg:w-1/2 bg-gray-800">
        {/* Placeholder for your actual image implementation (e.g., using a background image or Next/Image) */}
        {/* You will need to replace the src path below with your actual image path and configure styling */}
        <Image 
          src="/path/to/your/event-background-image.jpg" 
          alt="Event venue background" 
          layout="fill" 
          objectFit="cover"
        />
        {/* Optional overlay for lighting effects seen in the original image */}
        <div className="absolute inset-0 bg-black opacity-40"></div>
      </div>
    </div>
  );
}
