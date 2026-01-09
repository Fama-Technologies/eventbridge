"use client";

import { Check, Plus, Rocket, X } from "lucide-react";

export default function ServicePackages() {
    return (
        <div className="bg-shades-white p-6 md:p-8 rounded-2xl border border-neutrals-02">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-shades-black">Service Packages</h2>
                <button className="flex items-center gap-2 text-primary-01 font-semibold hover:text-primary-02 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add Package
                </button>
            </div>

            {/* Pro Tier Banner/Section */}
            <div className="bg-gradient-to-r from-accents-peach/40 via-accents-peach/20 to-transparent rounded-2xl p-6 md:p-8 mb-8">
                <div className="flex items-center gap-2 mb-2 text-primary-01 font-bold text-xs tracking-wider uppercase">
                    <Rocket className="w-4 h-4" />
                    Boost Your Visibility
                </div>
                <h3 className="text-2xl font-bold text-shades-black mb-8">Upgrade to Pro Tier</h3>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Free Tier Card */}
                    <div className="bg-shades-white/60 rounded-xl p-6 border border-neutrals-03 relative">
                        <div className="absolute top-4 right-4 px-3 py-1 bg-neutrals-04 rounded text-xs font-semibold text-shades-white">
                            Current
                        </div>
                        <h4 className="text-lg font-bold text-shades-black mb-6">Free Tier</h4>

                        <ul className="space-y-3 mb-6">
                            <li className="flex items-center gap-3 text-sm text-shades-black">
                                <Check className="w-4 h-4 text-accents-discount" />
                                2 Service Packages
                            </li>
                            <li className="flex items-center gap-3 text-sm text-shades-black">
                                <Check className="w-4 h-4 text-accents-discount" />
                                Standard Search Listing
                            </li>
                            <li className="flex items-center gap-3 text-sm text-neutrals-06">
                                <X className="w-4 h-4" />
                                No Priority Leads
                            </li>
                        </ul>
                    </div>

                    {/* Pro Tier Card */}
                    <div className="bg-gradient-to-b from-primary-01/10 to-transparent rounded-xl p-6 border border-primary-01/30 relative">
                        <div className="absolute -top-3 right-4 px-3 py-1 bg-primary-01 rounded text-xs font-bold text-shades-white uppercase shadow-sm">
                            Recommended
                        </div>
                        <div className="flex justify-between items-start mb-6">
                            <h4 className="text-lg font-bold text-shades-black">Pro Tier</h4>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-primary-01">$29</span>
                                <span className="text-sm text-shades-black">/mo</span>
                            </div>
                        </div>

                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-3 text-sm text-shades-black">
                                <Check className="w-4 h-4 text-primary-01" />
                                Unlimited Packages
                            </li>
                            <li className="flex items-center gap-3 text-sm text-shades-black">
                                <Check className="w-4 h-4 text-primary-01" />
                                Featured in Search Results
                            </li>
                            <li className="flex items-center gap-3 text-sm text-shades-black">
                                <Check className="w-4 h-4 text-primary-01" />
                                Priority Leads Access
                            </li>
                        </ul>

                        <button className="w-full py-3 bg-primary-01 hover:bg-primary-02 text-shades-white font-bold rounded-xl shadow-lg shadow-primary-01/20 transition-all active:scale-[0.98]">
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
