// types/next-auth.d.ts
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      accountType: 'VENDOR' | 'CUSTOMER';
    };
  }

  interface User {
    id: string;
    email: string;
    accountType: 'VENDOR' | 'CUSTOMER';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    email: string;
    accountType: 'VENDOR' | 'CUSTOMER';
  }
}