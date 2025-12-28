'use client';

import { BadgeCheck } from "lucide-react";
import { useState } from "react";

export default function ProfileStrengthCard() {
    const [profileStrength, setProfileStrength] = useState(80);

    return (
        <div className="w-[384px] h-[112px] p-5 gap-3 bg-[#222222] border-[1px] border-[#666666] rounded-lg flex flex-col justify-center shadow">
            <div className="flex justify-between items-center w-full">
                <div className="flex flex-row items-center gap-2">
                    <BadgeCheck className="text-[#CB5E21] size-[24px]" />
                    <p className="font-font1 font-semibold text-[14px] leading-[20px] tracking-normal text-white">Profile Strength</p>
                </div>
                <div className="font-font1 font-semibold text-[14px] text-[#CB5E21]">
                    {profileStrength}%
                </div>
            </div>
            {/* Progress Bar Placeholder */}
            <div className="w-full h-2 bg-white rounded-full">
                <div className="h-full bg-[#CB5E21] rounded-full" style={{ width: `${profileStrength}%` }}></div>
            </div>
            <div>
                <p className="font-font1 font-normal text-[12px] leading-[16px] tracking-normal text-[#8C8C8C]">Complete your gallery to reach 100% visibility.</p>
            </div>
        </div>
    );
}
