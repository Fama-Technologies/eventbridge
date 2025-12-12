'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Store, User } from 'lucide-react';

export default function SignupPage() {
  const [step, setStep] = useState<'accountType' | 'details'>('accountType');
  const [accountType, setAccountType] = useState<'VENDOR' | 'CUSTOMER' | null>(null);

  const handleAccountTypeSelect = (type: 'VENDOR' | 'CUSTOMER') => {
    setAccountType(type);
    setStep('details');
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('accountType');
      setAccountType(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col-reverse lg:flex-row">
      {/* Left side - Form */}
      <div className="flex w-full flex-col justify-center bg-neutrals-01 p-8 lg:w-1/2 lg:p-16">
        <div className="mx-auto w-full max-w-md">
          {step === 'accountType' ? (
            <AccountTypeSelection onSelect={handleAccountTypeSelect} />
          ) : (
            <SignupForm accountType={accountType!} onBack={handleBack} />
          )}
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
            src={step === 'accountType' ? '/signup.jpg' : '/signup2.jpg'}
            alt="Event"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}

function AccountTypeSelection({ onSelect }: { onSelect: (type: 'VENDOR' | 'CUSTOMER') => void }) {
  return (
    <>
      <h1 className="mb-2 text-4xl font-bold text-shades-black">
        Choose <span className="text-primary-01">an</span>
        <br />
        Account Type
      </h1>
      <p className="mb-8 text-sm text-neutrals-07">What type of account are you making?</p>

      <div className="space-y-6">
        <p className="text-sm text-neutrals-07">
          Pick an <span className="text-primary-01">Account</span> Type
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onSelect('VENDOR')}
            className="group flex flex-col items-center gap-4 rounded-lg border border-neutrals-04 bg-neutrals-02 p-8 transition-all hover:border-primary-01 hover:bg-neutrals-03"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-neutrals-03 group-hover:bg-accents-peach">
              <Store size={32} className="text-shades-black group-hover:text-primary-01" />
            </div>
            <div className="text-center">
              <p className="text-sm text-neutrals-07">Are you a</p>
              <p className="font-semibold text-shades-black">Vendor?</p>
            </div>
          </button>

          <button
            onClick={() => onSelect('CUSTOMER')}
            className="group flex flex-col items-center gap-4 rounded-lg border border-neutrals-04 bg-neutrals-02 p-8 transition-all hover:border-primary-01 hover:bg-neutrals-03"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-neutrals-03 group-hover:bg-accents-peach">
              <User size={32} className="text-shades-black group-hover:text-primary-01" />
            </div>
            <div className="text-center">
              <p className="text-sm text-neutrals-07">Are you a</p>
              <p className="font-semibold text-shades-black">Customer?</p>
            </div>
          </button>
        </div>

        <button
          type="button"
          className="w-full rounded-lg bg-primary-01 py-3 font-semibold text-shades-white hover:bg-primary-02 transition-colors"
        >
          Continue
        </button>

        <Link
          href="/login"
          className="flex items-center gap-2 text-sm text-neutrals-07 hover:text-shades-black"
        >
          ← Back
        </Link>
      </div>
    </>
  );
}

function SignupForm({ accountType, onBack }: { accountType: 'VENDOR' | 'CUSTOMER'; onBack: () => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement signup logic
    console.log({ firstName, lastName, email, password, accountType, agreeToTerms });
  };

  return (
    <>
      <h1 className="mb-2 text-4xl font-bold text-shades-black">
        Create <span className="text-primary-01">an</span>
        <br />
        Account
      </h1>
      <p className="mb-8 text-sm text-neutrals-07">Create and manage your events seamlessly.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-lg border border-neutrals-04 bg-transparent px-4 py-3 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-lg border border-neutrals-04 bg-transparent px-4 py-3 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none"
            required
          />
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-neutrals-04 bg-transparent px-4 py-3 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
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
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>

        <label className="flex items-start gap-2 text-sm text-shades-black">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-neutrals-04 bg-transparent text-primary-01 focus:ring-primary-01"
            required
          />
          <span>
            I agree to the{' '}
            <Link href="/terms" className="text-accents-link hover:text-primary-01">
              Terms of Service
            </Link>
          </span>
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-primary-01 py-3 font-semibold text-shades-white hover:bg-primary-02 transition-colors"
        >
          Sign in
        </button>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-neutrals-04" />
          <span className="text-sm text-neutrals-07">Sign up with</span>
          <div className="h-px flex-1 bg-neutrals-04" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg border border-neutrals-04 bg-transparent px-4 py-3 text-shades-black hover:bg-neutrals-02 transition-colors"
          >
            <Image src="/google.svg" alt="Google" width={20} height={20} />
            Sign up with Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg border border-neutrals-04 bg-transparent px-4 py-3 text-shades-black hover:bg-neutrals-02 transition-colors"
          >
            <Image src="/apple.svg" alt="Apple" width={20} height={20} />
            Sign up with Apple
          </button>
        </div>

        <p className="text-center text-sm text-neutrals-07">
          Already have an account?{' '}
          <Link href="/login" className="text-accents-link hover:text-primary-01">
            Login
          </Link>
        </p>
      </form>
    </>
  );
}
