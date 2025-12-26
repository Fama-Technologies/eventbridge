// lib/vendor-validation.ts
export type AccountType = 'CUSTOMER' | 'VENDOR' | 'PLANNER';

export interface AccountTypeConflict {
  hasConflict: boolean;
  existingTypes: AccountType[];
  canProceed: boolean;
  message?: string;
}

export function checkAccountTypeConflict(
  requestedType: AccountType,
  existingType: AccountType | null
): AccountTypeConflict {
  if (!existingType) {
    return { hasConflict: false, existingTypes: [], canProceed: true };
  }

  if (requestedType === existingType) {
    return { hasConflict: false, existingTypes: [existingType], canProceed: true };
  }

  // PLANNER cannot become VENDOR
  if (existingType === 'PLANNER' && requestedType === 'VENDOR') {
    return {
      hasConflict: true,
      existingTypes: ['PLANNER'],
      canProceed: false,
      message: 'Event planners cannot register as vendors. Please use a different email address.',
    };
  }

  // VENDOR cannot become PLANNER
  if (existingType === 'VENDOR' && requestedType === 'PLANNER') {
    return {
      hasConflict: true,
      existingTypes: ['VENDOR'],
      canProceed: false,
      message: 'Vendors cannot register as event planners. Please use a different email address.',
    };
  }

  // CUSTOMER can upgrade to VENDOR or PLANNER
  if (existingType === 'CUSTOMER' && (requestedType === 'VENDOR' || requestedType === 'PLANNER')) {
    return {
      hasConflict: false,
      existingTypes: ['CUSTOMER'],
      canProceed: true,
      message: 'Your customer account will be upgraded.',
    };
  }

  return {
    hasConflict: true,
    existingTypes: [existingType],
    canProceed: false,
    message: 'This email is already registered. Please use a different email.',
  };
}

export function canUserBeVendor(user: any): { allowed: boolean; reason?: string } {
  if (user.accountType === 'PLANNER') {
    return {
      allowed: false,
      reason: 'Event planners cannot register as vendors.',
    };
  }
  return { allowed: true };
}