'use client';

import { X, Check, Rocket, CheckCircle2, XCircle } from 'lucide-react';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function UpgradeModal() {
    const { isOpen, onClose } = useUpgradeModal();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl bg-[#111111] border border-white/10 rounded-3xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 overflow-hidden">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="mb-8 relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Rocket className="text-primary-01 w-4 h-4" />
                        <span className="text-primary-01 text-xs font-bold tracking-widest uppercase">
                            Boost Your Visibility & Earnings
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                        Upgrade to Unlock More Growth
                    </h2>
                </div>

                {/* Cards Container */}
                <div className="grid md:grid-cols-2 gap-6 relative z-10">

                    {/* Free Tier Card */}
                    <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/5 flex flex-col h-full">
                        <div className="mb-6">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-xl font-bold text-white">Free Tier</h3>
                                <span className="text-[10px] font-semibold bg-[#2A2A2A] text-white/60 px-2 py-1 rounded-full uppercase">
                                    Current
                                </span>
                            </div>
                            <p className="text-white/50 text-sm">Perfect to get started</p>
                        </div>

                        <div className="space-y-4 mb-8 flex-1">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                <span className="text-white/80">2 Service Packages</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                <span className="text-white/80">Standard Search Listing</span>
                            </div>
                            <div className="flex items-center gap-3 opacity-50">
                                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <span className="text-white/50 line-through">No Priority Leads</span>
                            </div>
                            <div className="flex items-center gap-3 opacity-50">
                                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <span className="text-white/50 line-through">Basic Analytics</span>
                            </div>
                        </div>

                        <button
                            disabled
                            className="w-full py-3 rounded-xl border border-white/10 text-white/40 font-semibold cursor-not-allowed hover:bg-white/5 transition-colors"
                        >
                            Current Plan
                        </button>
                    </div>

                    {/* Pro Tier Card */}
                    <div className="relative bg-[#1A1A1A] rounded-2xl p-6 border-2 border-primary-01 flex flex-col h-full shadow-[0_0_30px_rgba(255,106,61,0.15)]">

                        {/* Recommended Badge */}
                        <div className="absolute -top-4 right-6 bg-primary-01 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg">
                            Recommended
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between items-start mb-1">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Pro Tier</h3>
                                    <p className="text-white/50 text-sm">For growing vendors</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-primary-01">35,000 UGX</div>
                                    <div className="text-[10px] text-white/40">approx. $10 / month</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8 flex-1">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-primary-01/20 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-primary-01" />
                                </div>
                                <span className="text-white">Unlimited Service Packages</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-primary-01/20 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-primary-01" />
                                </div>
                                <span className="text-white">Featured in Search Results</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-primary-01/20 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-primary-01" />
                                </div>
                                <span className="text-white">Priority Leads Access</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-primary-01/20 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-primary-01" />
                                </div>
                                <span className="text-white">Advanced Performance Insights</span>
                            </div>
                        </div>

                        <Link
                            href="/vendor/upgrade"
                            onClick={onClose}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-01 to-[#FF8A65] text-white font-bold text-center hover:opacity-90 transition-opacity shadow-lg shadow-primary-01/20"
                        >
                            Upgrade Now
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
