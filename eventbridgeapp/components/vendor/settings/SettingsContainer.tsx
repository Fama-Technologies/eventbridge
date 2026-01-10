"use client";

import { useState } from "react";
import { User, CreditCard, Lock, ChevronDown, ChevronUp } from "lucide-react";
import ProfileEditor from "./ProfileEditor";
import Subscriptions from "./Subscriptions";
import AccountSecurity from "./AccountSecurity";

type SectionId = "profile" | "subscriptions" | "security";

export default function SettingsContainer() {
    const [expandedSection, setExpandedSection] = useState<SectionId | null>(null);

    const toggleSection = (id: SectionId) => {
        setExpandedSection(expandedSection === id ? null : id);
    };

    return (
        <div className="max-w-6xl mx-auto px-2 pb-6 md:py-2">
            {/* Header with version */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-shades-black">Settings</h1>
                <span className="text-xs text-neutrals-06">v1.2.4-stable</span>
            </div>

            <div className="space-y-4">
                {/* 1. Profile Editor - Main Section (Always Visible) */}
                <ProfileEditor />

                {/* 2. Subscriptions Accordion */}
                <div className="bg-shades-white rounded-2xl border border-neutrals-03 overflow-hidden shadow-sm transition-all">
                    <button
                        onClick={() => toggleSection("subscriptions")}
                        className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-neutrals-01/50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                <CreditCard size={20} />
                            </div>
                            <div className="text-left">
                                <h2 className="text-base font-bold text-shades-black">Subscriptions</h2>
                                <p className="text-sm text-neutrals-06">Manage your plan and billing</p>
                            </div>
                        </div>
                        {expandedSection === "subscriptions" ? <ChevronUp className="text-neutrals-06" /> : <ChevronDown className="text-neutrals-06" />}
                    </button>

                    {expandedSection === "subscriptions" && (
                        <div className="md:px-0 bg-neutrals-01/30 animation-expand">
                            <Subscriptions />
                        </div>
                    )}
                </div>

                {/* 3. Account & Security Accordion */}
                <div className="bg-shades-white rounded-2xl border border-neutrals-03 overflow-hidden shadow-sm transition-all">
                    <button
                        onClick={() => toggleSection("security")}
                        className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-neutrals-01/50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                                <Lock size={20} />
                            </div>
                            <div className="text-left">
                                <h2 className="text-base font-bold text-shades-black">Account & Security</h2>
                                <p className="text-sm text-neutrals-06">Passwords, MFA, and access controls</p>
                            </div>
                        </div>
                        {expandedSection === "security" ? <ChevronUp className="text-neutrals-06" /> : <ChevronDown className="text-neutrals-06" />}
                    </button>

                    {expandedSection === "security" && (
                        <div className="md:px-0 bg-neutrals-01/30 animation-expand">
                            <AccountSecurity />
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Links */}
            <div className="mt-12 border-t border-neutrals-03 pt-6 flex flex-wrap justify-center gap-6 text-xs text-neutrals-06">
                <a href="/terms" className="hover:text-neutrals-08 transition-colors">Terms of Service</a>
                <a href="/privacy" className="hover:text-neutrals-08 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-neutrals-08 transition-colors">Help Center</a>
                <a href="#" className="hover:text-neutrals-08 transition-colors">System Status</a>
            </div>
        </div>
    );
}
