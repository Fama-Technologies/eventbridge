'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ✅ UPDATED PART — ONLY THIS FUNCTION WAS MODIFIED
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("Login successful!");
    window.location.href = "/dashboard";
  };
  // ✅ END OF UPDATED PART

  return (
    <div className="flex min-h-screen flex-col-reverse lg:flex-row">
      {/* Left side - Form */}
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
                className="w-full rounded-lg border border-neutrals-04 bg-transparent px-4 py-3 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-neutrals-04 bg-transparent px-4 py-3 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutrals-06 hover:text-shades-black"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-shades-black">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-neutrals-04 bg-transparent text-primary-01 focus:ring-primary-01"
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-sm text-primary-01 hover:text-primary-02">
                Forget Password
              </Link>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-primary-01 py-3 font-semibold text-shades-white hover:bg-primary-02 transition-colors"
            >
              Sign in
            </button>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-neutrals-04" />
              <span className="text-sm text-neutrals-07">Login with</span>
              <div className="h-px flex-1 bg-neutrals-04" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-neutrals-04 bg-transparent px-4 py-3 text-shades-black hover:bg-neutrals-03 transition-colors"
              >
                <Image src="/google.svg" alt="Google" width={20} height={20} />
                Sign in with Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-neutrals-04 bg-transparent px-4 py-3 text-shades-black hover:bg-neutrals-03 transition-colors"
              >
                <Image src="/apple.svg" alt="Apple" width={20} height={20} />
                Sign in with Apple
              </button>
            </div>

            <p className="text-center text-sm text-neutrals-07">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary-01 hover:text-primary-02">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="block lg:w-1/2 relative h-64 lg:h-auto w-full">
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-8">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Event Bridge Logo"
              width={32}
              height={32}
              className="text-primary-01"
            />
            <span className="text-xl font-semibold text-shades-white">Event Bridge</span>
          </div>
          <Link
            href="/"
            className="rounded-full bg-shades-black-30 backdrop-blur-sm px-4 py-2 text-sm text-shades-white hover:bg-neutrals-08"
          >
            Back to Website →
          </Link>
        </div>
        <div className="relative h-full w-full">
          <Image
            src="/login.jpg"
            alt="Event"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
