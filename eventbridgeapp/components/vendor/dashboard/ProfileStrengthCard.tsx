'use client';

import { BadgeCheck } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProfileStrengthCard() {
    const [profileStrength, setProfileStrength] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch('/api/vendor/profile');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.profile) {
                        // Calculate strength client-side
                        let score = 0;
                        const p = data.profile;

                        // Basic Info (40%)
                        if (p.businessName) score += 10;
                        if (p.description && p.description.length > 50) score += 10;
                        if (p.city && p.state) score += 10;
                        if (p.phone) score += 10;

                        // Visuals (30%)
                        if (p.profileImage) score += 15;
                        if (p.coverImage) score += 15;

                        // Verification (30%) - Simplified check
                        if (p.isVerified) score += 30;
                        else if (p.verificationStatus === 'pending') score += 10;

                        setProfileStrength(Math.min(score, 100));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    // ... (rest of render)

    return (
        <div className="w-full lg:w-[384px] h-auto lg:h-[140px] p-5 gap-3 bg-shades-white border border-neutrals-03 rounded-lg flex flex-col justify-center shadow-sm dark:shadow-none transition-colors duration-300">
            <div className="flex justify-between items-center w-full">
                <div className="flex flex-row items-center gap-2">
                    <BadgeCheck className="text-primary-02 size-[24px]" />
                    <p className="font-font1 font-semibold text-[14px] leading-[20px] tracking-normal text-shades-black">Profile Strength</p>
                </div>
                <div className="font-font1 font-semibold text-[14px] text-primary-02">
                    {loading ? '...' : `${profileStrength}%`}
                </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-neutrals-02 rounded-full overflow-hidden flex-none" style={{ height: '12px' }}>
                <div
                    className="h-full bg-gradient-to-r from-primary-01 to-primary-02 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${profileStrength}%` }}
                />
            </div>
            <div>
                <p className="font-font1 font-normal text-[12px] leading-[16px] tracking-normal text-neutrals-06">Complete your gallery to reach 100% visibility.</p>
            </div>
        </div>
    );
}
