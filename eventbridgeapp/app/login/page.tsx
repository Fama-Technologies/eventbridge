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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log({ email, password, rememberMe });
  };

  return (
    <div className="flex min-h-screen flex-col-reverse lg:flex-row">
      {/* Left side - Form */}
      <div className="flex w-full flex-col justify-center bg-[#0a0a0a] p-8 lg:w-1/2 lg:p-16">
        <div className="mx-auto w-full max-w-md">
          <h1 className="mb-2 text-4xl font-bold text-white">
            Hello
            <br />
            <span className="text-orange-500">Welcome</span> Back
          </h1>
          <p className="mb-8 text-sm text-zinc-400">Want to plan for another event?</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-transparent px-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-transparent px-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 bg-transparent text-orange-500 focus:ring-orange-500"
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-sm text-orange-500 hover:text-orange-400">
                Forget Password
              </Link>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              Sign in
            </button>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-zinc-700" />
              <span className="text-sm text-zinc-400">Login with</span>
              <div className="h-px flex-1 bg-zinc-700" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-transparent px-4 py-3 text-white hover:bg-zinc-800 transition-colors"
              >
                <Image src="/google.svg" alt="Google" width={20} height={20} />
                Sign in with Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-transparent px-4 py-3 text-white hover:bg-zinc-800 transition-colors"
              >
                <Image src="/apple.svg" alt="Apple" width={20} height={20} />
                Sign in with Apple
              </button>
            </div>

            <p className="text-center text-sm text-zinc-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-orange-500 hover:text-orange-400">
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
              className="text-orange-500"
            />
            <span className="text-xl font-semibold text-white">Event Bridge</span>
          </div>
          <Link
            href="/"
            className="rounded-full bg-zinc-800/80 backdrop-blur-sm px-4 py-2 text-sm text-white hover:bg-zinc-700"
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
