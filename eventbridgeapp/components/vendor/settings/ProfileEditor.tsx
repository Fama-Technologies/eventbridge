"use client";

import { useState } from "react";
import ProfileBasics from "./ProfileBasics";
import ServicePackages from "./ServicePackages";
import PortfolioMedia from "./PortfolioMedia";
import AvailabilitySettings from "./AvailabilitySettings";

const TABS = [
    { id: "basics", label: "Profile Basics" },
    { id: "packages", label: "Service Packages" },
    { id: "media", label: "Portfolio Media" },
    { id: "availability", label: "Availability Settings" }
] as const;

type TabId = typeof TABS[number]['id'];

export default function ProfileEditor() {
    const [activeTab, setActiveTab] = useState<TabId>("basics");

    return (
        <div className="w-full">
            {/* Tabs Header */}
            <div className="flex overflow-x-auto border-b border-neutrals-03 mb-6 scrollbar-hide">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            px-6 py-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap
                            ${activeTab === tab.id
                                ? 'border-primary-01 text-primary-01'
                                : 'border-transparent text-neutrals-06 hover:text-neutrals-08'
                            }
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6 animation-fade-in">
                {activeTab === "basics" && <ProfileBasics />}
                {activeTab === "packages" && <ServicePackages />}
                {activeTab === "media" && <PortfolioMedia />}
                {activeTab === "availability" && <AvailabilitySettings />}
            </div>
        </div>
    );
}
