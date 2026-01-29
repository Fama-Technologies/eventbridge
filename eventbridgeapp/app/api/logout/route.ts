import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });

  // Clear custom auth token
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  });

  // Clear potential NextAuth cookies
  response.cookies.set('next-auth.session-token', '', { expires: new Date(0), path: '/' });
  response.cookies.set('__Secure-next-auth.session-token', '', { expires: new Date(0), path: '/' });
  response.cookies.set('next-auth.callback-url', '', { expires: new Date(0), path: '/' });
  response.cookies.set('__Secure-next-auth.callback-url', '', { expires: new Date(0), path: '/' });
  response.cookies.set('session', '', { expires: new Date(0), path: '/' });

  return response;
}
