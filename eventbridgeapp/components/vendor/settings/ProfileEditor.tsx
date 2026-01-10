"use client";

import { useState, useEffect } from "react";
import ProfileBasics from "./ProfileBasics";
import ServicePackages from "./ServicePackages";
import PortfolioMedia from "./PortfolioMedia";
import AvailabilitySettings from "./AvailabilitySettings";
import { useToast } from "@/components/ui/toast";

interface VendorProfile {
    id: number;
    businessName: string | null;
    description: string | null;
    phone: string | null;
    website: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    yearsExperience: number | null;
    isVerified: boolean;
    rating: number;
    reviewCount: number;
    profileImage: string | null;
    verificationStatus: string;
}

interface Service {
    id: number;
    name: string;
    description: string | null;
    price: number | null;
    isActive: boolean;
}

interface ServicePackage {
    id: number;
    name: string;
    description: string | null;
    price: number;
    duration: number | null;
    features: string[];
    isPopular: boolean;
    isActive: boolean; // Added this property
}

const TABS = [
    { id: "basics", label: "Profile Basics" },
    { id: "packages", label: "Service Packages" },
    { id: "media", label: "Portfolio Media" },
    { id: "availability", label: "Availability Settings" }
] as const;

type TabId = typeof TABS[number]['id'];

export default function ProfileEditor() {
    const [activeTab, setActiveTab] = useState<TabId>("basics");
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();

    // Shared state that all tabs might need
    const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [packages, setPackages] = useState<ServicePackage[]>([]);

    // Fetch initial data when component mounts
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setIsLoading(true);

            // Fetch vendor profile
            const profileResponse = await fetch('/api/vendor/profile');
            const profileData = await profileResponse.json();

            if (profileData.success) {
                setVendorProfile(profileData.profile);
                setServices(profileData.services || []);
            }

            // Fetch service packages
            const packagesResponse = await fetch('/api/vendor/packages');
            const packagesData = await packagesResponse.json();

            if (packagesData.success) {
                setPackages(packagesData.packages || []);
            }

        } catch (error) {
            console.error('Failed to fetch initial data:', error);
            addToast("Failed to load profile data", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileUpdate = (updatedProfile: VendorProfile) => {
        setVendorProfile(updatedProfile);
    };

    const handleServicesUpdate = (updatedServices: Service[]) => {
        setServices(updatedServices);
    };

    const handlePackagesUpdate = (updatedPackages: ServicePackage[]) => {
        setPackages(updatedPackages);
    };

    if (isLoading) {
        return (
            <div className="w-full bg-white rounded-xl border border-neutrals-03 p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-48"></div>
                    <div className="flex gap-8">
                        <div className="w-48 h-48 rounded-full bg-gray-200"></div>
                        <div className="flex-1 space-y-4">
                            <div className="h-10 bg-gray-200 rounded"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                            <div className="h-32 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-xl border border-neutrals-03 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-neutrals-03 flex items-start justify-between">
                <div className="flex gap-4">
                    <div className="p-2.5 bg-neutrals-02 rounded-lg text-neutrals-07">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-shades-black">Profile Editor</h2>
                        <p className="text-sm text-neutrals-06 mt-1">Manage your public storefront profile</p>
                    </div>
                </div>
                <button className="text-neutrals-06 hover:text-shades-black transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                </button>
            </div>

            {/* Tabs Header */}
            <div className="px-8 flex border-b border-neutrals-03 scrollbar-hide">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            py-4 mr-8 text-sm font-semibold transition-all border-b-2 whitespace-nowrap relative
                            ${activeTab === tab.id
                                ? 'border-primary-01 text-primary-01'
                                : 'border-transparent text-neutrals-06 hover:text-neutrals-08'
                            }
                        `}
                    >
                        {tab.label}
                        {/* Add notification badges if needed */}
                        {tab.id === "packages" && packages.length === 0 && (
                            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                                !
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-8 animation-fade-in min-h-[500px]">
                {activeTab === "basics" && vendorProfile && (
                    <ProfileBasics
                        vendorProfile={vendorProfile}
                        services={services}
                        onProfileUpdate={handleProfileUpdate}
                        onServicesUpdate={handleServicesUpdate}
                    />
                )}

                {activeTab === "packages" && (
                    <ServicePackages
                        packages={packages}
                        onPackagesUpdate={handlePackagesUpdate}
                    />
                )}

                {activeTab === "media" && vendorProfile && (
                    <PortfolioMedia
                        vendorId={vendorProfile.id}
                    />
                )}

                {activeTab === "availability" && vendorProfile && (
                    <AvailabilitySettings
                        vendorId={vendorProfile.id}
                    />
                )}
            </div>
        </div>
    );
}