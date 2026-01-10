'use client';

import { BadgeCheck, AlertCircle, CheckCircle } from "lucide-react";

interface ProfileStrengthCardProps {
  completionPercentage?: number;
  vendor?: {
    businessName?: string | null;
    description?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    profileImage?: string | null;
    verified?: boolean;
  };
}

export default function ProfileStrengthCard({ 
  completionPercentage = 0, 
  vendor 
}: ProfileStrengthCardProps = {}) {
  
  // Use provided completion percentage or calculate from vendor data
  const profileStrength = completionPercentage;
  
  // Calculate missing fields based on vendor data
  const missingFields = vendor ? [
    { field: 'businessName', label: 'Business Name', value: vendor.businessName },
    { field: 'description', label: 'Business Description', value: vendor.description },
    { field: 'phone', label: 'Phone Number', value: vendor.phone },
    { field: 'address', label: 'Address', value: vendor.address },
    { field: 'city', label: 'City', value: vendor.city },
    { field: 'state', label: 'State', value: vendor.state },
    { field: 'profileImage', label: 'Profile Image', value: vendor.profileImage },
    { field: 'verified', label: 'Account Verification', value: vendor.verified },
  ].filter(item => !item.value && item.field !== 'verified') : [];

  const getStatusMessage = () => {
    if (profileStrength >= 90) return "Excellent! Your profile is complete.";
    if (profileStrength >= 70) return "Good! Almost there.";
    if (profileStrength >= 50) return "Fair. Consider adding more details.";
    if (profileStrength > 0) return "Complete your profile to reach 100% visibility.";
    return "Start completing your profile to increase visibility.";
  };

  const getProgressColor = () => {
    if (profileStrength >= 90) return "from-green-600 to-green-500";
    if (profileStrength >= 70) return "from-blue-600 to-blue-500";
    if (profileStrength >= 50) return "from-yellow-600 to-yellow-500";
    return "from-primary-01 to-primary-02";
  };

  const showMissingFields = missingFields.length > 0 && profileStrength < 90;

  return (
    <div className="w-full lg:w-[384px] h-auto p-5 gap-3 bg-shades-white border border-neutrals-03 rounded-lg flex flex-col justify-center shadow-sm dark:shadow-none transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center w-full">
        <div className="flex flex-row items-center gap-2">
          <BadgeCheck className="text-primary-02 size-[24px]" />
          <p className="font-font1 font-semibold text-[14px] leading-[20px] tracking-normal text-shades-black">
            Profile Strength
          </p>
        </div>
        <div className="font-font1 font-semibold text-[14px] text-primary-02">
          {profileStrength}%
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-neutrals-02 rounded-full overflow-hidden flex-none" style={{ height: '12px' }}>
        <div
          className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${profileStrength}%` }}
        />
      </div>
      
      {/* Status Message */}
      <div>
        <p className="font-font1 font-normal text-[12px] leading-[16px] tracking-normal text-neutrals-06">
          {getStatusMessage()}
        </p>
      </div>

      {/* Missing Fields Section - Only shows when there are missing fields */}
      {showMissingFields && (
        <div className="mt-2 pt-3 border-t border-neutrals-02">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="size-[16px] text-yellow-600" />
            <p className="font-font1 font-medium text-[12px] text-neutrals-07">
              Missing Information:
            </p>
          </div>
          <ul className="space-y-1 ml-6">
            {missingFields.slice(0, 2).map((item) => (
              <li key={item.field} className="font-font1 text-[11px] text-neutrals-06">
                • {item.label}
              </li>
            ))}
            {missingFields.length > 2 && (
              <li className="font-font1 text-[11px] text-neutrals-05">
                • +{missingFields.length - 2} more fields
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Complete Profile CTA */}
      {profileStrength < 100 && (
        <div className="mt-3">
          <button className="w-full py-2 bg-primary-01 text-shades-white rounded-lg hover:bg-primary-02 transition-colors font-font1 font-medium text-[12px]">
            Complete Profile
          </button>
        </div>
      )}

      {/* Verified Status Badge */}
      {vendor?.verified && (
        <div className="mt-2 flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="size-[16px] text-green-600" />
          <p className="font-font1 text-[11px] text-green-700 font-medium">
            Account Verified ✓
          </p>
        </div>
      )}
    </div>
  );
}