// types/next-auth.d.ts
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      accountType: 'VENDOR' | 'CUSTOMER' | 'PLANNER';
    };
  }

  interface User {
    id: string;
    email: string;
    accountType: 'VENDOR' | 'CUSTOMER' | 'PLANNER';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: number;
    email?: string;
    accountType?: 'VENDOR' | 'CUSTOMER' | 'PLANNER';
  }
}
