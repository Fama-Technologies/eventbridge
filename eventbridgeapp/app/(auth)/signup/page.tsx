'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Store, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signIn, useSession } from 'next-auth/react';

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
            <Image
              src="/logo.svg"
              alt="Event Bridge Logo"
              width={32}
              height={32}
            />
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
  selectedType
}: {
  onSelect: (type: 'VENDOR' | 'CUSTOMER') => void;
  selectedType: 'VENDOR' | 'CUSTOMER' | null;
}) {
  const [tempSelection, setTempSelection] = useState<'VENDOR' | 'CUSTOMER' | null>(selectedType);

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
        <p className="text-sm text-neutrals-07">
          Pick an <span className="text-primary-01">Account</span> Type
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setTempSelection('VENDOR')}
            className={`group flex flex-col items-center gap-4 rounded-lg border p-8 transition-all ${
              tempSelection === 'VENDOR'
                ? 'border-primary-01 bg-neutrals-03'
                : 'border-neutrals-04 bg-neutrals-02 hover:border-primary-01 hover:bg-neutrals-03'
            }`}
          >
            <div className={`flex h-16 w-16 items-center justify-center rounded-lg transition-all ${
              tempSelection === 'VENDOR'
                ? 'bg-accents-peach'
                : 'bg-neutrals-03 group-hover:bg-accents-peach'
            }`}>
              <Store size={32} className={`transition-all ${
                tempSelection === 'VENDOR'
                  ? 'text-primary-01'
                  : 'text-shades-black group-hover:text-primary-01'
              }`} />
            </div>
            <div className="text-center">
              <p className="text-sm text-neutrals-07">Are you a</p>
              <p className="font-semibold text-shades-black">Vendor?</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTempSelection('CUSTOMER')}
            className={`group flex flex-col items-center gap-4 rounded-lg border p-8 transition-all ${
              tempSelection === 'CUSTOMER'
                ? 'border-primary-01 bg-neutrals-03'
                : 'border-neutrals-04 bg-neutrals-02 hover:border-primary-01 hover:bg-neutrals-03'
            }`}
          >
            <div className={`flex h-16 w-16 items-center justify-center rounded-lg transition-all ${
              tempSelection === 'CUSTOMER'
                ? 'bg-accents-peach'
                : 'bg-neutrals-03 group-hover:bg-accents-peach'
            }`}>
              <User size={32} className={`transition-all ${
                tempSelection === 'CUSTOMER'
                  ? 'text-primary-01'
                  : 'text-shades-black group-hover:text-primary-01'
              }`} />
            </div>
            <div className="text-center">
              <p className="text-sm text-neutrals-07">Are you a</p>
              <p className="font-semibold text-shades-black">Customer?</p>
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!tempSelection}
          className="w-full rounded-lg bg-primary-01 py-3 font-semibold text-shades-white hover:bg-primary-02 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>

        <Link
          href="/login"
          className="flex items-center gap-2 text-sm text-neutrals-07 hover:text-shades-black"
        >
          Back
        </Link>
      </div>
    </>
  );
}

function SignupForm({
  accountType,
  onBack,
  initialAgreeToTerms = false,
}: {
  accountType: 'VENDOR' | 'CUSTOMER';
  onBack: () => void;
  initialAgreeToTerms?: boolean;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(initialAgreeToTerms);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const userAccountType = (session.user as any).accountType;
      console.log('User authenticated with account type:', userAccountType);
      
      const pendingType = sessionStorage.getItem('pendingAccountType');
      if (pendingType) {
        sessionStorage.removeItem('pendingAccountType');
        
        if (pendingType === 'VENDOR') {
          router.push('/vendor/onboarding');
        } else {
          router.push('/');
        }
      } else {
        if (userAccountType === 'VENDOR') {
          router.push('/vendor/onboarding');
        } else {
          router.push('/');
        }
      }
    }
  }, [status, session, router]);

  const handleGoogleSignup = async () => {
    if (!agreeToTerms) {
      toast.error('Please agree to the Terms of Service');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Initiating Google sign-in for account type:', accountType);

      sessionStorage.setItem('pendingAccountType', accountType);

      const callbackUrl = accountType === 'VENDOR' ? '/vendor/onboarding' : '/';
      
      console.log('Callback URL:', callbackUrl);

      await signIn('google', {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error('Google signup error:', error);
      toast.error('An error occurred during Google sign-up');
      setIsLoading(false);
    }
  };

  const handleAppleSignup = async () => {
    toast.info('Apple sign-in coming soon');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeToTerms) {
      toast.error('Please agree to the Terms of Service');
      return;
    }

    setIsLoading(true);

    try {
      const signupRes = await fetch('/api/signup', {
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

      const signupData = await signupRes.json();

      if (!signupRes.ok) {
        toast.error(signupData.message || 'Signup failed');
        setIsLoading(false);
        return;
      }

      console.log('Account created, attempting auto-login');

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Account created but login failed. Please try logging in.');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
        return;
      }

      toast.success('Account created successfully!');

      if (accountType === 'VENDOR') {
        console.log('Redirecting vendor to onboarding');
        router.push('/vendor/onboarding');
      } else {
        console.log('Redirecting customer to home');
        router.push('/');
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast.error('Something went wrong. Please try again.');
      setIsLoading(false);
    }
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
            className="w-full rounded-lg border border-neutrals-04 bg-transparent px-4 py-3 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none disabled:opacity-50"
            required
            disabled={isLoading}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-lg border border-neutrals-04 bg-transparent px-4 py-3 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none disabled:opacity-50"
            required
            disabled={isLoading}
          />
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-neutrals-04 bg-transparent px-4 py-3 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none disabled:opacity-50"
          required
          disabled={isLoading}
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-neutrals-04 bg-transparent px-4 py-3 text-shades-black placeholder:text-neutrals-06 focus:border-primary-01 focus:outline-none disabled:opacity-50"
            required
            minLength={8}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutrals-06 hover:text-shades-black disabled:opacity-50"
            disabled={isLoading}
          >
            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>

        <label className="flex items-start gap-2 text-sm text-shades-black cursor-pointer">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-neutrals-04 bg-transparent text-primary-01 focus:ring-primary-01 disabled:opacity-50 cursor-pointer"
            disabled={isLoading}
          />
          <span>
            I agree to the{' '}
            <Link 
              href={`/terms?type=${accountType.toLowerCase()}`} 
              className={`text-accents-link hover:text-primary-01 ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
              target="_blank"
            >
              Terms of Service
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={isLoading || !agreeToTerms}
          className="w-full rounded-lg bg-primary-01 py-3 font-semibold text-shades-white hover:bg-primary-02 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="animate-spin" size={20} />}
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="w-full text-sm text-neutrals-07 hover:text-shades-black disabled:opacity-50 transition-colors"
        >
          Back to account type
        </button>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-neutrals-04" />
          <span className="text-sm text-neutrals-07">Sign up with</span>
          <div className="h-px flex-1 bg-neutrals-04" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isLoading || !agreeToTerms}
            className={`flex items-center justify-center gap-2 rounded-lg border border-neutrals-04 bg-transparent px-4 py-3 text-shades-black transition-colors ${
              isLoading || !agreeToTerms 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-neutrals-02 cursor-pointer'
            }`}
          >
            <Image src="/google.svg" alt="Google" width={20} height={20} />
            <span className="text-sm font-medium">Sign up with Google</span>
          </button>
          <button
            type="button"
            onClick={handleAppleSignup}
            disabled={isLoading || !agreeToTerms}
            className={`flex items-center justify-center gap-2 rounded-lg border border-neutrals-04 bg-transparent px-4 py-3 text-shades-black transition-colors ${
              isLoading || !agreeToTerms 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-neutrals-02 cursor-pointer'
            }`}
          >
            <Image src="/apple.svg" alt="Apple" width={20} height={20} />
            <span className="text-sm font-medium">Sign up with Apple</span>
          </button>
        </div>

        <p className="text-center text-sm text-neutrals-07">
          Already have an account?{' '}
          <Link 
            href="/login" 
            className={`text-accents-link hover:text-primary-01 font-medium ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
          >
            Login
          </Link>
        </p>
      </form>
    </>
  );
}