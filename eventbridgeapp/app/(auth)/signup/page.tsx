'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Store, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signIn, useSession } from 'next-auth/react';

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

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
    }

    if (type === 'customer') {
      setAccountType('CUSTOMER');
      setStep('details');
    }

    if (accepted === 'true') {
      setStep('details');
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen flex-col-reverse lg:flex-row">
      <div className="flex w-full flex-col justify-center bg-neutrals-01 p-8 lg:w-1/2 lg:p-16">
        <div className="mx-auto w-full max-w-md">
          {step === 'accountType' ? (
            <AccountTypeSelection
              onSelect={(type) => {
                setAccountType(type);
                setStep('details');
              }}
            />
          ) : (
            <SignupForm
              accountType={accountType!}
              onBack={() => {
                setAccountType(null);
                setStep('accountType');
              }}
              initialAgreeToTerms={searchParams.get('accepted') === 'true'}
            />
          )}
        </div>
      </div>

      <div className="relative h-64 w-full lg:h-auto lg:w-1/2">
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

        <Image
          src={step === 'accountType' ? '/signup.jpg' : '/signup2.jpg'}
          alt="Signup"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          ACCOUNT TYPE SELECTION                             */
/* -------------------------------------------------------------------------- */

function AccountTypeSelection({
  onSelect,
}: {
  onSelect: (type: 'VENDOR' | 'CUSTOMER') => void;
}) {
  const [selection, setSelection] = useState<'VENDOR' | 'CUSTOMER' | null>(null);

  return (
    <>
      <h1 className="mb-2 text-4xl font-bold text-shades-black">
        Choose <span className="text-primary-01">an</span>
        <br />
        Account Type
      </h1>

      <p className="mb-6 text-sm text-neutrals-07">
        What type of account are you creating?
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setSelection('VENDOR')}
          className={`rounded-lg border p-8 ${
            selection === 'VENDOR'
              ? 'border-primary-01 bg-neutrals-03'
              : 'border-neutrals-04'
          }`}
        >
          <Store className="mx-auto mb-2" />
          Vendor
        </button>

        <button
          onClick={() => setSelection('CUSTOMER')}
          className={`rounded-lg border p-8 ${
            selection === 'CUSTOMER'
              ? 'border-primary-01 bg-neutrals-03'
              : 'border-neutrals-04'
          }`}
        >
          <User className="mx-auto mb-2" />
          Customer
        </button>
      </div>

      <button
        disabled={!selection}
        onClick={() => selection && onSelect(selection)}
        className="w-full rounded-lg bg-primary-01 py-3 font-semibold text-white disabled:opacity-50"
      >
        Continue
      </button>

      <Link href="/login" className="mt-4 block text-sm text-neutrals-07">
        Back
      </Link>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                               SIGNUP FORM                                  */
/* -------------------------------------------------------------------------- */

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
  const { data: session, status } = useSession();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(initialAgreeToTerms);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ------------------------ OAuth Redirect Handler ------------------------- */
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const pendingType = sessionStorage.getItem('pendingAccountType');
      sessionStorage.removeItem('pendingAccountType');

      if (pendingType === 'VENDOR') router.push('/vendor/onboarding');
      else router.push('/dashboard');
    }
  }, [status, session, router]);

  /* ------------------------------- Handlers ------------------------------- */

  const handleGoogleSignup = async () => {
    if (!agree) return toast.error('Please agree to the Terms of Service');

    sessionStorage.setItem('pendingAccountType', accountType);

    await signIn('google', {
      callbackUrl: accountType === 'VENDOR' ? '/vendor/onboarding' : '/dashboard',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agree) return toast.error('Please agree to the Terms');

    setLoading(true);

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
        accountType,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || 'Signup failed');
      setLoading(false);
      return;
    }

    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    router.push(accountType === 'VENDOR' ? '/vendor/onboarding' : '/dashboard');
  };

  /* ---------------------------------- UI ---------------------------------- */

  return (
    <>
      <h1 className="mb-2 text-4xl font-bold text-shades-black">
        Create <span className="text-primary-01">an</span>
        <br />
        Account
      </h1>

      <p className="mb-8 text-sm text-neutrals-07">
        Create and manage your events seamlessly.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="First Name"
            required
            disabled={loading}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            placeholder="Last Name"
            required
            disabled={loading}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <input
          type="email"
          placeholder="Email"
          required
          disabled={loading}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            minLength={8}
            required
            disabled={loading}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <Eye /> : <EyeOff />}
          </button>
        </div>

        <label className="flex gap-2 text-sm">
          <input
            type="checkbox"
            checked={agree}
            disabled={loading}
            onChange={(e) => setAgree(e.target.checked)}
          />
          I agree to the Terms of Service
        </label>

        <button
          type="submit"
          disabled={loading || !agree}
          className="w-full bg-primary-01 py-3 text-white"
        >
          {loading ? <Loader2 className="mx-auto animate-spin" /> : 'Sign Up'}
        </button>

        <button type="button" onClick={onBack} className="text-sm">
          Back to account type
        </button>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-neutrals-04" />
          <span className="text-sm text-neutrals-07">Sign up with</span>
          <div className="h-px flex-1 bg-neutrals-04" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading || !agree}
          className="w-full border py-3"
        >
          Sign up with Google
        </button>

        <p className="text-center text-sm">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </form>
    </>
  );
}
