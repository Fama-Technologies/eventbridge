'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement forgot password logic
    console.log({ email });
  };

  return (
    <div className="flex min-h-screen flex-col-reverse lg:flex-row">
      {/* Left side - Form */}
      <div className="flex w-full flex-col justify-center bg-neutrals-01 p-8 lg:w-1/2 lg:p-16">
        <div className="mx-auto w-full max-w-md">
          <h1 className="mb-2 text-4xl font-bold text-shades-black">
            <span className="text-primary-01">Forgot</span>
            <br />
            password
          </h1>
          <p className="mb-8 text-sm text-neutrals-07">
            No worries, we'll send you reset instructions.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutrals-04 bg-transparent px-4 py-3 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-primary-01 py-3 font-semibold text-shades-white hover:bg-primary-02 transition-colors"
            >
              Send Email
            </button>

            <Link
              href="/login"
              className="flex items-center gap-2 text-sm text-neutrals-07 hover:text-shades-black"
            >
              ← Back to <span className="text-primary-01">Login</span>
            </Link>
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
            src="/forgotpassword.png"
            alt="Security Lock"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
