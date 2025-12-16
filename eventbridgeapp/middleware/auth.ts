// middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, type AuthUser } from '@/lib/auth';

// Simple middleware that returns user or error response
export async function authMiddleware(request: NextRequest): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  return user;
}

// Vendor-only middleware
export async function vendorMiddleware(request: NextRequest): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  if (user.accountType !== 'VENDOR') {
    return NextResponse.json(
      { success: false, error: 'Only vendors can perform this action' },
      { status: 403 }
    );
  }
  
  return user;
}