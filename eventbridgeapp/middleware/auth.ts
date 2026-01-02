// middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, type AuthUser } from '@/lib/auth';
import type { JWTPayload } from '@/lib/jwt';

// Helper to convert AuthUser to a safe format for headers
function prepareUserForHeaders(user: AuthUser) {
  return {
    id: String(user.id), // Convert number to string for headers
    email: user.email,
    accountType: user.accountType,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
  };
}

// Simple middleware that returns user or throws error
export async function authMiddleware(request: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(request);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

// Vendor-only middleware
export async function vendorMiddleware(request: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(request);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  if (user.accountType.toUpperCase() !== 'VENDOR') {
    throw new Error('Only vendors can perform this action');
  }
  
  return user;
}

// Middleware that returns NextResponse for direct use in route handlers
export async function withAuth(request: NextRequest): Promise<NextResponse | AuthUser> {
  try {
    const user = await authMiddleware(request);
    return user;
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication required' 
      },
      { status: 401 }
    );
  }
}

// Middleware that returns NextResponse for vendor-only routes
export async function withVendorAuth(request: NextRequest): Promise<NextResponse | AuthUser> {
  try {
    const user = await vendorMiddleware(request);
    return user;
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('Only vendors') ? 403 : 401;
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication required' 
      },
      { status: statusCode }
    );
  }
}

// Helper to add user data to request headers
export function addUserToHeaders(request: NextRequest, user: AuthUser): Headers {
  const requestHeaders = new Headers(request.headers);
  const userForHeaders = prepareUserForHeaders(user);
  
  requestHeaders.set('x-user-id', userForHeaders.id);
  requestHeaders.set('x-user-email', userForHeaders.email);
  requestHeaders.set('x-account-type', userForHeaders.accountType);
  requestHeaders.set('x-user-firstname', userForHeaders.firstName);
  requestHeaders.set('x-user-lastname', userForHeaders.lastName);
  
  return requestHeaders;
}

// Wrapper function for route handlers (clean pattern)
export function createAuthHandler(
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>,
  options?: { requireVendor?: boolean }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Check authentication
      const user = options?.requireVendor 
        ? await vendorMiddleware(request)
        : await authMiddleware(request);
      
      // Add user info to headers (converting ID to string)
      const headers = addUserToHeaders(request, user);
      
      // Clone request with new headers
      const modifiedRequest = new NextRequest(request, {
        headers
      });
      
      // Call the actual handler
      return handler(modifiedRequest, user);
      
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('Only vendors') ? 403 : 401;
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Authentication failed' 
        },
        { status: statusCode }
      );
    }
  };
}

// Type-safe helper to extract user from request headers
export function getUserFromHeaders(request: NextRequest): {
  id: number; // Return as number to match your JWTPayload
  email: string;
  accountType: string;
  firstName?: string;
  lastName?: string;
} | null {
  const userId = request.headers.get('x-user-id');
  const userEmail = request.headers.get('x-user-email');
  const accountType = request.headers.get('x-account-type');
  const firstName = request.headers.get('x-user-firstname');
  const lastName = request.headers.get('x-user-lastname');
  
  if (!userId || !userEmail) {
    return null;
  }
  
  // Convert string ID back to number
  const id = parseInt(userId, 10);
  if (isNaN(id)) {
    return null;
  }
  
  return {
    id, // Now a number
    email: userEmail,
    accountType: accountType || '',
    firstName: firstName || undefined,
    lastName: lastName || undefined,
  };
}

// Alternative: Get user as string ID
export function getUserIdAsString(request: NextRequest): string | null {
  return request.headers.get('x-user-id');
}

// Check if user is authenticated
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  try {
    const user = await getAuthUser(request);
    return !!user;
  } catch {
    return false;
  }
}

// Check if user is vendor
export async function isVendor(request: NextRequest): Promise<boolean> {
  try {
    const user = await getAuthUser(request);
    return !!user && user.accountType.toUpperCase() === 'VENDOR';
  } catch {
    return false;
  }
}

// Check if user is admin
export async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const user = await getAuthUser(request);
    return !!user && user.accountType.toUpperCase() === 'ADMIN';
  } catch {
    return false;
  }
}

// Utility to create response with user data
export function createUserResponse(user: AuthUser, data?: any): NextResponse {
  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      accountType: user.accountType,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    ...(data && { data })
  });
}