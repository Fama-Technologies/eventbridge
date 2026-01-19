'use client';

import { BadgeCheck } from 'lucide-react';
import { useDashboardData } from './DashboardDataProvider';

export default function ProfileStrengthCard() {
  const { data, loading } = useDashboardData();
  const profileStrength = data?.profileCompletion ?? 0;

  return (
    <div className="w-full lg:w-[384px] h-auto lg:h-[140px] p-5 gap-3 bg-shades-white border border-neutrals-03 rounded-lg flex flex-col justify-center shadow-sm dark:shadow-none transition-colors duration-300">
      <div className="flex justify-between items-center w-full">
        <div className="flex flex-row items-center gap-2">
          <BadgeCheck className="text-primary-02 size-[24px]" />
          <p className="font-font1 font-semibold text-[14px] leading-[20px] tracking-normal text-shades-black">
            Profile Strength
          </p>
        </div>
        <div className="font-font1 font-semibold text-[14px] text-primary-02">
          {loading ? '...' : `${profileStrength}%`}
        </div>
      </div>
      <div
        className="w-full bg-neutrals-02 rounded-full overflow-hidden flex-none"
        style={{ height: '12px' }}
      >
        <div
          className="h-full bg-gradient-to-r from-primary-01 to-primary-02 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${profileStrength}%` }}
        />
      </div>
      <div>
        <p className="font-font1 font-normal text-[12px] leading-[16px] tracking-normal text-neutrals-06">
          Complete your gallery to reach 100% visibility.
        </p>
      </div>
    </div>
  );
}
