'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';
import PaymentMethodSelection from '@/components/vendor/upgrade/overlays/PaymentMethodSelection';
import PaymentProcessing from '@/components/vendor/upgrade/overlays/PaymentProcessing';

export default function UpgradePage() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [paymentStep, setPaymentStep] = useState<'none' | 'method' | 'processing'>('none');
    const [selectedPlan, setSelectedPlan] = useState<{ name: string; amount: number } | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<'momo' | 'airtel' | 'card' | 'bank' | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('+256 772 123 456');

    const pricing = {
        free: { monthly: 0, yearly: 0 },
        pro: { monthly: 35000, yearly: 336000 },
        business: { monthly: 52500, yearly: 504000 }
    };

    const handleUpgradeClick = (plan: 'pro' | 'business') => {
        const planName = plan === 'pro' ? 'Pro' : 'Business Pro';
        const amount = pricing[plan][billingCycle];
        setSelectedPlan({ name: planName, amount });
        setPaymentStep('method');
    };

    const handleMethodSelect = (method: 'momo' | 'airtel' | 'card' | 'bank') => {
        setSelectedMethod(method);
        setPaymentStep('processing');
    };

    const handleCardSubmit = () => {
        setPaymentStep('processing');
    };

    const handleClosePayment = () => {
        setPaymentStep('none');
        setSelectedPlan(null);
        setSelectedMethod(null);
    };

    const handleBackToMethods = () => {
        setPaymentStep('method');
    };

    return (
        <div className="min-h-screen ">
            {/* Hero Section */}
            <div className="bg-shades-white py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-shades-black mb-3">
                        Choose the plan that's right for your business
                    </h1>
                    <p className="text-sm text-neutrals-06 mb-8">
                        Transparent pricing built to help your event business scale with ease. Join 2,000+ vendors today.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-12">
                        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-shades-black' : 'text-neutrals-06'}`}>
                            Monthly
                        </span>
                        <button
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                            className={`relative w-14 h-7 rounded-full transition-colors ${billingCycle === 'yearly' ? 'bg-primary-01' : 'bg-neutrals-04'}`}
                        >
                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`} />
                        </button>
                        <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-shades-black' : 'text-neutrals-06'}`}>
                            Yearly
                        </span>
                        {billingCycle === 'yearly' && (
                            <span className="px-2 py-1 bg-accents-discount/20 text-accents-discount text-xs font-bold rounded uppercase">
                                save 20%
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Free Plan */}
                    <div className="rounded-2xl p-6 bg-shades-white text-shades-black border-2 border-neutrals-06">
                        <h3 className="text-xl font-bold mb-1">Free</h3>
                        <p className="text-sm text-neutrals-06 mb-6">Best for new vendors starting out.</p>
                        <div className="mb-6">
                            <span className="text-4xl font-bold">UGX {pricing.free[billingCycle].toLocaleString()}</span>
                            <span className="text-sm text-neutrals-06 ml-2">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                        </div>
                        <button className="w-full py-3 rounded-xl text-center font-semibold transition-colors mb-6 border-2 border-neutrals-06 text-shades-black hover:bg-neutrals-02">
                            Current Plan
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="rounded-2xl p-6 bg-shades-white text-shades-black border-2 border-neutrals-06">
                        <h3 className="text-xl font-bold mb-1">Pro</h3>
                        <p className="text-sm text-neutrals-06 mb-6">For growing small businesses</p>
                        <div className="mb-6">
                            <span className="text-4xl font-bold">UGX {pricing.pro[billingCycle].toLocaleString()}</span>
                            <span className="text-sm text-neutrals-06 ml-2">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                            {billingCycle === 'monthly' && (
                                <p className="text-xs text-primary-01 mt-1">Billed annually (UGX {(pricing.pro.monthly * 12).toLocaleString()}/yr)</p>
                            )}
                        </div>
                        <button
                            onClick={() => handleUpgradeClick('pro')}
                            className="w-full py-3 rounded-xl text-center font-semibold transition-colors mb-6 border-2 border-neutrals-06 text-shades-black hover:bg-neutrals-02"
                        >
                            Start Pro Trial
                        </button>
                    </div>

                    {/* Business Pro Plan */}
                    <div className="relative rounded-2xl p-6 bg-shades-white text-shades-black border-2 border-primary-01">
                        <div className="absolute -top-3 right-4 px-3 py-1 bg-primary-01 rounded-full text-xs font-bold uppercase tracking-wider text-white">
                            Most Popular
                        </div>
                        <h3 className="text-xl font-bold mb-1">Business Pro</h3>
                        <p className="text-sm text-neutrals-06 mb-6">Advanced tools for scale.</p>
                        <div className="mb-6">
                            <span className="text-4xl font-bold">UGX {pricing.business[billingCycle].toLocaleString()}</span>
                            <span className="text-sm text-neutrals-06 ml-2">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                            {billingCycle === 'monthly' && (
                                <p className="text-xs text-primary-01 mt-1">Billed annually (UGX {(pricing.business.monthly * 12).toLocaleString()}/yr)</p>
                            )}
                        </div>
                        <button
                            onClick={() => handleUpgradeClick('business')}
                            className="w-full py-3 rounded-xl text-center font-semibold transition-colors mb-6 bg-primary-01 text-white hover:bg-primary-02"
                        >
                            Go Business Pro
                        </button>
                    </div>
                </div>
            </div>

            {/* Feature Comparison Table */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="bg-shades-white rounded-2xl border border-neutrals-03 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="bg-shades-white text-shades-black">
                                    <th className="text-left py-4 px-6 text-sm font-bold">Features</th>
                                    <th className="text-center py-4 px-6 text-sm font-bold">Free</th>
                                    <th className="text-center py-4 px-6 text-sm font-bold">Pro</th>
                                    <th className="text-center py-4 px-6 text-sm font-bold bg-primary-01/20">Business Pro</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-neutrals-02">
                                    <td className="py-4 px-6 text-sm text-neutrals-07">Business leads & inquiries</td>
                                    <td className="py-4 px-6 text-center text-sm text-neutrals-06">Up to 10</td>
                                    <td className="py-4 px-6 text-center text-sm text-primary-01 font-semibold">Unlimited</td>
                                    <td className="py-4 px-6 text-center text-sm text-primary-01 font-semibold bg-primary-01/5">Unlimited</td>
                                </tr>
                                <tr className="border-b border-neutrals-02">
                                    <td className="py-4 px-6 text-sm text-neutrals-07">Digital invoices & receipts</td>
                                    <td className="py-4 px-6 text-center text-sm text-neutrals-06">Up to 10</td>
                                    <td className="py-4 px-6 text-center text-sm text-primary-01 font-semibold">Unlimited</td>
                                    <td className="py-4 px-6 text-center text-sm text-primary-01 font-semibold bg-primary-01/5">Unlimited</td>
                                </tr>
                                <tr className="border-b border-neutrals-02">
                                    <td className="py-4 px-6 text-sm text-neutrals-07">Service packages</td>
                                    <td className="py-4 px-6 text-center text-sm text-neutrals-06">Up to 3</td>
                                    <td className="py-4 px-6 text-center text-sm text-primary-01 font-semibold">Unlimited</td>
                                    <td className="py-4 px-6 text-center text-sm text-primary-01 font-semibold bg-primary-01/5">Unlimited</td>
                                </tr>
                                <tr className="border-b border-neutrals-02">
                                    <td className="py-4 px-6 text-sm text-neutrals-07">Photo & video uploads</td>
                                    <td className="py-4 px-6 text-center text-sm text-neutrals-06">5 videos</td>
                                    <td className="py-4 px-6 text-center text-sm text-primary-01 font-semibold">Unlimited</td>
                                    <td className="py-4 px-6 text-center text-sm text-primary-01 font-semibold bg-primary-01/5">Unlimited</td>
                                </tr>
                                <tr className="border-b border-neutrals-02">
                                    <td className="py-4 px-6 text-sm text-neutrals-07">Top listing & recommendation</td>
                                    <td className="py-4 px-6 text-center"><span className="text-neutrals-04">—</span></td>
                                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-primary-01 mx-auto" /></td>
                                    <td className="py-4 px-6 text-center bg-primary-01/5"><Check className="w-5 h-5 text-primary-01 mx-auto" /></td>
                                </tr>
                                <tr className="border-b border-neutrals-02">
                                    <td className="py-4 px-6 text-sm text-neutrals-07">Boost portfolio & packages</td>
                                    <td className="py-4 px-6 text-center"><span className="text-neutrals-04">—</span></td>
                                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-primary-01 mx-auto" /></td>
                                    <td className="py-4 px-6 text-center bg-primary-01/5"><Check className="w-5 h-5 text-primary-01 mx-auto" /></td>
                                </tr>
                                <tr className="border-b border-neutrals-02">
                                    <td className="py-4 px-6 text-sm text-neutrals-07">Trends & customer insights</td>
                                    <td className="py-4 px-6 text-center"><span className="text-neutrals-04">—</span></td>
                                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-primary-01 mx-auto" /></td>
                                    <td className="py-4 px-6 text-center bg-primary-01/5"><Check className="w-5 h-5 text-primary-01 mx-auto" /></td>
                                </tr>
                                <tr className="border-b border-neutrals-02">
                                    <td className="py-4 px-6 text-sm text-neutrals-07">Full bookings calendar</td>
                                    <td className="py-4 px-6 text-center text-sm text-neutrals-06">Limited</td>
                                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-primary-01 mx-auto" /></td>
                                    <td className="py-4 px-6 text-center bg-primary-01/5"><Check className="w-5 h-5 text-primary-01 mx-auto" /></td>
                                </tr>
                                <tr className="border-b border-neutrals-02">
                                    <td className="py-4 px-6 text-sm text-neutrals-07">Chat & messaging</td>
                                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-primary-01 mx-auto" /></td>
                                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-primary-01 mx-auto" /></td>
                                    <td className="py-4 px-6 text-center bg-primary-01/5"><Check className="w-5 h-5 text-primary-01 mx-auto" /></td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-sm text-neutrals-07">Earnings & response dashboard</td>
                                    <td className="py-4 px-6 text-center"><span className="text-neutrals-04">—</span></td>
                                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-primary-01 mx-auto" /></td>
                                    <td className="py-4 px-6 text-center bg-primary-01/5"><Check className="w-5 h-5 text-primary-01 mx-auto" /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Trust Banner */}
            <div className="bg-shades-white text-shades-black py-8">
                <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-8 text-sm">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        SECURE PAYMENTS
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        CANCEL ANYTIME
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                        </svg>
                        14-DAY MONEY BACK
                    </div>
                </div>
            </div>

            {/* Payment Overlays */}
            {paymentStep === 'method' && selectedPlan && (
                <PaymentMethodSelection
                    onClose={handleClosePayment}
                    onSelectMethod={handleMethodSelect}
                    amount={selectedPlan.amount}
                    plan={selectedPlan.name}
                />
            )}

            {paymentStep === 'processing' && selectedPlan && selectedMethod && (
                <PaymentProcessing
                    onCancel={handleClosePayment}
                    onResend={() => console.log('Resending prompt')}
                    onChangeNumber={handleBackToMethods}
                    phoneNumber={phoneNumber}
                    paymentMethod={selectedMethod === 'momo' ? 'MTN MoMo' : selectedMethod === 'airtel' ? 'Airtel Money' : 'Card Payment'}
                />
            )}
        </div>
    );
}
