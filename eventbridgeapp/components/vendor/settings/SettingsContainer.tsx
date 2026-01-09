"use client";

import { useState } from "react";
import { User, CreditCard, Lock, ChevronDown, ChevronUp } from "lucide-react";
import ProfileEditor from "./ProfileEditor";
import Subscriptions from "./Subscriptions";
import AccountSecurity from "./AccountSecurity";

type SectionId = "profile" | "subscriptions" | "security";

export default function SettingsContainer() {
    const [expandedSection, setExpandedSection] = useState<SectionId | null>("profile");

    const toggleSection = (id: SectionId) => {
        setExpandedSection(expandedSection === id ? null : id);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
            <h1 className="text-3xl font-bold text-shades-black mb-2">Settings</h1>
            <p className="text-neutrals-06 mb-8 text-right text-xs">v1.2.4-stable</p>

            <div className="space-y-4">
                {/* 1. Profile Editor Accordion */}
                <div className="bg-shades-white rounded-2xl border border-neutrals-03 overflow-hidden shadow-sm transition-all">
                    <button
                        onClick={() => toggleSection("profile")}
                        className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-neutrals-01/50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-neutrals-02 flex items-center justify-center text-neutrals-07">
                                <User size={20} />
                            </div>
                            <div className="text-left">
                                <h2 className="text-lg font-bold text-shades-black">Profile Editor</h2>
                                <p className="text-sm text-neutrals-06">Manage your public storefront profile</p>
                            </div>
                        </div>
                        {expandedSection === "profile" ? <ChevronUp className="text-neutrals-06" /> : <ChevronDown className="text-neutrals-06" />}
                    </button>

                    {expandedSection === "profile" && (
                        <div className="px-6 pb-8 md:px-8 animation-expand">
                            <div className="pt-4 border-t border-neutrals-02">
                                <ProfileEditor />
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Subscriptions Accordion */}
                <div className="bg-shades-white rounded-2xl border border-neutrals-03 overflow-hidden shadow-sm transition-all">
                    <button
                        onClick={() => toggleSection("subscriptions")}
                        className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-neutrals-01/50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                <CreditCard size={20} />
                            </div>
                            <div className="text-left">
                                <h2 className="text-lg font-bold text-shades-black">Subscriptions</h2>
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
                        className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-neutrals-01/50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                                <Lock size={20} />
                            </div>
                            <div className="text-left">
                                <h2 className="text-lg font-bold text-shades-black">Account & Security</h2>
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
            <div className="mt-16 border-t border-neutrals-03 pt-8 flex justify-center gap-8 text-xs text-neutrals-06">
                <a href="#" className="hover:text-neutrals-08">Terms of Service</a>
                <a href="#" className="hover:text-neutrals-08">Privacy Policy</a>
                <a href="#" className="hover:text-neutrals-08">Help Center</a>
                <a href="#" className="hover:text-neutrals-08">System Status</a>
            </div>
        </div>
    );
}
