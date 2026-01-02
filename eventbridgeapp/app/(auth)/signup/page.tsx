'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Store, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'accountType' | 'details'>('accountType');
  const [accountType, setAccountType] = useState<'VENDOR' | 'CUSTOMER' | null>(null);

  useEffect(() => {
    const type = searchParams.get('type');
    const accepted = searchParams.get('accepted');

    if (type === 'vendor') {
      setAccountType('VENDOR');
      setStep('details');
    } else if (type === 'customer') {
      setAccountType('CUSTOMER');
      setStep('details');
    }

    if (accepted === 'true') {
      setStep('details');
    }
  }, [searchParams]);

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
      <div className="flex w-full flex-col justify-center bg-neutrals-01 p-8 lg:w-1/2 lg:p-16">
        <div className="mx-auto w-full max-w-md">
          {step === 'accountType' ? (
            <AccountTypeSelection
              onSelect={handleAccountTypeSelect}
              selectedType={accountType}
            />
          ) : (
            <SignupForm
              accountType={accountType!}
              onBack={handleBack}
              initialAgreeToTerms={searchParams.get('accepted') === 'true'}
            />
          )}
        </div>
      </div>

      <div className="block lg:w-1/2 relative h-64 lg:h-auto w-full">
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-8">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Event Bridge Logo" width={32} height={32} />
            <span className="text-xl font-semibold text-white">Event Bridge</span>
          </div>
          <Link
            href="/"
            className="rounded-full bg-black/30 backdrop-blur-sm px-4 py-2 text-sm text-white hover:bg-black/50"
          >
            Back to Website
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

function AccountTypeSelection({
  onSelect,
  selectedType,
}: {
  onSelect: (type: 'VENDOR' | 'CUSTOMER') => void;
  selectedType: 'VENDOR' | 'CUSTOMER' | null;
}) {
  const [tempSelection, setTempSelection] = useState<typeof selectedType>(selectedType);

  const handleContinue = () => {
    if (tempSelection) {
      onSelect(tempSelection);
    }
  };

  return (
    <>
      <h1 className="mb-2 text-4xl font-bold text-shades-black">
        Choose <span className="text-primary-01">an</span>
        <br />
        Account Type
      </h1>
      <p className="mb-8 text-sm text-neutrals-07">What type of account are you making?</p>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {(['VENDOR', 'CUSTOMER'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTempSelection(type)}
              className={`group flex flex-col items-center gap-4 rounded-lg border p-8 transition-all ${
                tempSelection === type
                  ? 'border-primary-01 bg-neutrals-03'
                  : 'border-neutrals-04 bg-neutrals-02 hover:border-primary-01 hover:bg-neutrals-03'
              }`}
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-lg ${
                  tempSelection === type
                    ? 'bg-accents-peach'
                    : 'bg-neutrals-03 group-hover:bg-accents-peach'
                }`}
              >
                {type === 'VENDOR' ? <Store size={32} /> : <User size={32} />}
              </div>
              <p className="font-semibold text-shades-black">{type}</p>
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!tempSelection}
          className="w-full rounded-lg bg-primary-01 py-3 font-semibold text-shades-white disabled:opacity-50"
        >
          Continue
        </button>

        <Link href="/login" className="text-sm text-neutrals-07">
          Back
        </Link>
      </div>
    </>
  );
}

function SignupForm({
  accountType,
  onBack,
  initialAgreeToTerms,
}: {
  accountType: 'VENDOR' | 'CUSTOMER';
  onBack: () => void;
  initialAgreeToTerms: boolean;
}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(initialAgreeToTerms);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignup = async () => {
    if (!agreeToTerms) return toast.error('Please agree to the Terms of Service');

    sessionStorage.setItem('pendingAccountType', accountType);
    await signIn('google', {
      callbackUrl: accountType === 'VENDOR' ? '/vendor/onboarding' : '/dashboard',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToTerms) return toast.error('Please agree to the Terms of Service');

    setIsLoading(true);

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, accountType }),
      });

      if (!res.ok) throw new Error();

      await signIn('credentials', { email, password, redirect: false });
      router.push(accountType === 'VENDOR' ? '/vendor/onboarding' : '/dashboard');
    } catch {
      toast.error('Signup failed');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" required />
      <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" required />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="button" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <Eye /> : <EyeOff />}
        </button>
      </div>

      <label className="flex gap-2">
        <input type="checkbox" checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)} />
        I agree to the Terms
      </label>

      <button type="submit" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
      </button>

      <button type="button" onClick={onBack}>
        Back to account type
      </button>

      <button type="button" onClick={handleGoogleSignup}>
        Sign up with Google
      </button>

      <Link href="/login">Login</Link>
    </form>
  );
}
